"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/* -------------------------------------------------------------------------- */
/*  LabRoom3D , a real-time 3D operator room with a Sims-style angled camera    */
/*  and a live day/night lighting rig.                                         */
/*                                                                            */
/*  The voxel operator lives in one room and acts out the harvest machine's    */
/*  live state + the local time of day:                                        */
/*    working  : sits at the desk FACING the monitor, types + clicks the mouse. */
/*    idle     : relaxes in the lounge chair facing the camera, sips coffee.    */
/*    sleeping : lies in bed under the blanket; at dawn wakes, walks to the     */
/*               desk and starts working.                                      */
/*                                                                            */
/*  Lighting follows the real local clock: warm low sun at dawn/dusk through    */
/*  the window with volumetric shafts + drifting dust, bright neutral sun at    */
/*  noon, and a dark room lit by a warm desk lamp + monitor glow (with bloom)   */
/*  at night. Not literal path tracing, but a dynamic, plausible GI look.       */
/*                                                                            */
/*  Original procedural voxel art (no external models, no Minecraft assets).    */
/*  Honors prefers-reduced-motion (one static frame).                          */
/* -------------------------------------------------------------------------- */

export type LabState = "working" | "idle" | "sleeping";

interface Props {
  state: LabState;
  /** local hour 0..24 (fractional), drives the lighting + sun position */
  hour: number;
}

type StationKey = LabState;

interface Station {
  x: number;
  z: number;
  face: number; // rotation.y once arrived
  seated: number; // 0 standing .. 1 seated
  lying: number; // 0 upright .. 1 lying flat
  rootY: number; // vertical offset of the body root once posed
}

// Desk sits along the LEFT wall; the operator faces -x toward the monitor.
// Lounge sits front-right facing the camera. Bed sits right side, head toward
// the camera so the sleeping face + blanket are visible.
const STATIONS: Record<StationKey, Station> = {
  working: { x: -2.2, z: -1.1, face: -Math.PI / 2, seated: 1, lying: 0, rootY: -0.32 },
  idle: { x: 0.2, z: 1.5, face: Math.PI * 0.72, seated: 1, lying: 0, rootY: -0.32 },
  sleeping: { x: 2.45, z: -0.3, face: 0, seated: 0, lying: 1, rootY: 0 },
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ---- a "Z" sprite texture for sleeping ----------------------------------- */
function makeZTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = "#dfeee9";
  ctx.font = "bold 52px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Z", 32, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---- a soft round sprite texture (dust motes, light dots) ----------------- */
function makeDotTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

/* ---- day/night lighting model -------------------------------------------- */
interface SunModel {
  dir: THREE.Vector3; // direction the light travels (from sun toward room)
  sunPos: THREE.Vector3; // world position of the visible sun disk
  sunColor: THREE.Color;
  sunIntensity: number;
  ambientSky: THREE.Color;
  ambientGround: THREE.Color;
  ambientIntensity: number;
  skyColor: THREE.Color; // color seen through the window
  daylight: number; // 0 night .. 1 noon
  isNight: boolean;
}

const C = {
  dawn: new THREE.Color("#ff9b54"),
  noon: new THREE.Color("#fff3df"),
  dusk: new THREE.Color("#ff7a45"),
  moon: new THREE.Color("#9fb8e8"),
  skyNight: new THREE.Color("#0b1530"),
  skyDawn: new THREE.Color("#f5a86a"),
  skyDay: new THREE.Color("#9cc4ef"),
  skyDusk: new THREE.Color("#e8794a"),
  groundDay: new THREE.Color("#6b5a44"),
  groundNight: new THREE.Color("#141d33"),
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function sunForHour(hour: number): SunModel {
  // daylight curve: 0 before 6 / after 18, peaks at noon
  const dayT = clamp01((hour - 6) / 12); // 0 at 6h, 1 at 18h
  const daylight = hour > 6 && hour < 18 ? Math.sin(dayT * Math.PI) : 0;
  const isNight = daylight < 0.04;

  // sun arcs east -> west across the window; elevation tracks daylight
  const az = THREE.MathUtils.lerp(-Math.PI * 0.42, Math.PI * 0.42, dayT);
  const el = THREE.MathUtils.degToRad(8 + daylight * 60);
  // place the sun disk outside the back wall (z very negative)
  const r = 9;
  const sunPos = new THREE.Vector3(
    Math.sin(az) * r,
    1.5 + Math.sin(el) * r,
    -3.6 - Math.cos(el) * 2.5
  );
  const dir = sunPos.clone().normalize().negate(); // travels from sun into room

  // warm at the horizon (low daylight), neutral at noon
  const warm = hour < 12 ? C.dawn : C.dusk;
  const sunColor = warm.clone().lerp(C.noon, daylight);
  const sunIntensity = isNight ? 0.0 : 0.7 + daylight * 3.1;

  // sky through the window
  let skyColor: THREE.Color;
  if (isNight) skyColor = C.skyNight.clone();
  else if (hour < 8) skyColor = C.skyDawn.clone().lerp(C.skyDay, clamp01((hour - 6) / 2));
  else if (hour > 16) skyColor = C.skyDay.clone().lerp(C.skyDusk, clamp01((hour - 16) / 2));
  else skyColor = C.skyDay.clone();

  const ambientSky = isNight ? C.skyNight.clone().lerp(C.moon, 0.5) : C.skyDay.clone();
  const ambientGround = isNight ? C.groundNight.clone() : C.groundDay.clone();
  const ambientIntensity = 0.4 + daylight * 0.95;

  return {
    dir,
    sunPos,
    sunColor,
    sunIntensity,
    ambientSky,
    ambientGround,
    ambientIntensity,
    skyColor,
    daylight,
    isNight,
  };
}

export function LabRoom3D({ state, hour }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<LabState>(state);
  const hourRef = useRef<number>(hour);

  useEffect(() => {
    targetRef.current = state;
  }, [state]);
  useEffect(() => {
    hourRef.current = hour;
  }, [hour]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = prefersReducedMotion();
    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T): T => {
      disposables.push(o);
      return o;
    };

    /* ---- renderer / scene / camera ---------------------------------------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const w0 = mount.clientWidth || 320;
    const h0 = mount.clientHeight || 240;
    renderer.setSize(w0, h0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    // gentle depth haze only , pushed well past the room so the walls stay clear
    scene.fog = new THREE.Fog(0x10202c, 22, 48);

    const camera = new THREE.PerspectiveCamera(45, w0 / h0, 0.1, 100);
    const camBase = new THREE.Vector3(7.2, 5.2, 8.0);
    camera.position.copy(camBase);
    const lookAt = new THREE.Vector3(0.4, 1.1, -0.3);
    camera.lookAt(lookAt);

    /* ---- post-processing (bloom) ------------------------------------------ */
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(w0, h0), 0.4, 0.4, 0.86);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
    } catch {
      composer = null;
    }

    /* ---- lights ----------------------------------------------------------- */
    const hemi = new THREE.HemisphereLight(0x9cc4ef, 0x6b5a44, 0.5);
    scene.add(hemi);
    const ambient = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff3df, 2.0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -9;
    sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 9;
    sun.shadow.camera.bottom = -9;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    scene.add(sun.target);

    // warm desk lamp (prominent at night)
    const lampLight = new THREE.PointLight(0xffca74, 0.0, 9, 2);
    lampLight.position.set(-2.9, 1.7, -0.2);
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.set(512, 512);
    scene.add(lampLight);

    // monitor glow
    const monitorLight = new THREE.PointLight(0x46cfa8, 0.4, 5, 2);
    monitorLight.position.set(-2.9, 1.6, -1.1);
    scene.add(monitorLight);

    /* ---- material / geometry helpers -------------------------------------- */
    function mat(color: number, opts: { emissive?: number; emissiveIntensity?: number; rough?: number } = {}) {
      return track(
        new THREE.MeshStandardMaterial({
          color,
          emissive: opts.emissive ?? 0x000000,
          emissiveIntensity: opts.emissiveIntensity ?? 1,
          roughness: opts.rough ?? 0.85,
          metalness: 0.0,
        })
      );
    }
    function box(
      w: number,
      h: number,
      d: number,
      color: number,
      opts: { emissive?: number; emissiveIntensity?: number; cast?: boolean; rough?: number } = {}
    ): THREE.Mesh {
      const geo = track(new THREE.BoxGeometry(w, h, d));
      const m = new THREE.Mesh(geo, mat(color, opts));
      m.castShadow = opts.cast ?? true;
      m.receiveShadow = true;
      return m;
    }

    /* ---- room shell ------------------------------------------------------- */
    const room = new THREE.Group();
    scene.add(room);

    const floor = box(10, 0.3, 8, 0x6e5a43, { cast: false, rough: 0.95 });
    floor.position.set(0, -0.15, 0);
    room.add(floor);
    // floorboards hint (a couple of darker strips)
    for (let i = -2; i <= 2; i++) {
      const strip = box(10, 0.02, 0.06, 0x5a4733, { cast: false });
      strip.position.set(0, 0.01, i * 1.4);
      room.add(strip);
    }
    const rug = box(3.6, 0.04, 3.2, 0x1d6b58, { cast: false, rough: 1 });
    rug.position.set(0.1, 0.03, 1.4);
    room.add(rug);

    const backWall = box(10, 6, 0.3, 0xb9a98c, { cast: false, rough: 1 });
    backWall.position.set(0, 2.7, -3.5);
    room.add(backWall);
    const leftWall = box(0.3, 6, 8, 0xa99c82, { cast: false, rough: 1 });
    leftWall.position.set(-4.7, 2.7, 0);
    room.add(leftWall);
    // baseboards
    const bbBack = box(10, 0.3, 0.12, 0x5a4733, { cast: false });
    bbBack.position.set(0, 0.15, -3.34);
    room.add(bbBack);
    const bbLeft = box(0.12, 0.3, 8, 0x5a4733, { cast: false });
    bbLeft.position.set(-4.54, 0.15, 0);
    room.add(bbLeft);

    /* ---- window on the back wall (sun shines through) --------------------- */
    const winGroup = new THREE.Group();
    winGroup.position.set(0.4, 2.7, -3.42);
    room.add(winGroup);
    const winW = 3.0;
    const winH = 2.4;
    // sky seen through the glass (color updated per hour)
    const skyMat = track(new THREE.MeshBasicMaterial({ color: 0x9cc4ef }));
    const skyPlane = new THREE.Mesh(track(new THREE.PlaneGeometry(winW, winH)), skyMat);
    skyPlane.position.set(0, 0, -0.12);
    winGroup.add(skyPlane);
    // visible sun disk behind the glass (bloom turns this into a glow)
    const sunDiskMat = track(new THREE.MeshBasicMaterial({ color: 0xfff3df }));
    const sunDisk = new THREE.Mesh(track(new THREE.SphereGeometry(0.42, 18, 18)), sunDiskMat);
    winGroup.add(sunDisk);
    // window frame + mullions
    const frameColor = 0x3a2c1c;
    const fTop = box(winW + 0.5, 0.22, 0.25, frameColor, { cast: false });
    fTop.position.set(0, winH / 2 + 0.1, 0);
    winGroup.add(fTop);
    const fBot = box(winW + 0.5, 0.22, 0.25, frameColor, { cast: false });
    fBot.position.set(0, -winH / 2 - 0.1, 0);
    winGroup.add(fBot);
    const fL = box(0.22, winH + 0.4, 0.25, frameColor, { cast: false });
    fL.position.set(-winW / 2 - 0.1, 0, 0);
    winGroup.add(fL);
    const fR = box(0.22, winH + 0.4, 0.25, frameColor, { cast: false });
    fR.position.set(winW / 2 + 0.1, 0, 0);
    winGroup.add(fR);
    const mullV = box(0.1, winH, 0.22, frameColor, { cast: false });
    winGroup.add(mullV);
    const mullH = box(winW, 0.1, 0.22, frameColor, { cast: false });
    winGroup.add(mullH);

    // a framed "lost species" poster on the back wall
    const posterFrame = box(1.1, 1.4, 0.08, 0x2a2016, { cast: false });
    posterFrame.position.set(-2.6, 3.1, -3.32);
    room.add(posterFrame);
    const poster = box(0.86, 1.16, 0.04, 0x123c30, { emissive: 0x0c2c22, emissiveIntensity: 0.4, cast: false });
    poster.position.set(-2.6, 3.1, -3.28);
    room.add(poster);

    // a little potted plant for life
    const pot = box(0.36, 0.4, 0.36, 0x8a4a3a);
    pot.position.set(3.7, 0.4, -2.8);
    room.add(pot);
    const foliage = box(0.7, 0.8, 0.7, 0x2f7d4f, { rough: 1 });
    foliage.position.set(3.7, 0.95, -2.8);
    room.add(foliage);

    /* ---- volumetric sun shafts (additive) + dust motes -------------------- */
    const shaftMat = track(
      new THREE.MeshBasicMaterial({
        color: 0xffe6b0,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    const shaftGroup = new THREE.Group();
    room.add(shaftGroup);
    for (let i = 0; i < 4; i++) {
      const plane = new THREE.Mesh(track(new THREE.PlaneGeometry(1.0, 6.5)), shaftMat);
      plane.position.set(0.0 + (i - 1.5) * 0.7, 2.4, -1.2);
      plane.rotation.x = Math.PI / 2.6;
      plane.rotation.z = (i - 1.5) * 0.05;
      shaftGroup.add(plane);
    }

    const dotTex = track(makeDotTexture());
    const moteMat = track(
      new THREE.SpriteMaterial({
        map: dotTex,
        color: 0xfff0d0,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    interface Mote {
      s: THREE.Sprite;
      bx: number;
      by: number;
      bz: number;
      ph: number;
    }
    const motes: Mote[] = [];
    for (let i = 0; i < 36; i++) {
      const s = new THREE.Sprite(moteMat);
      const sc = 0.03 + Math.random() * 0.05;
      s.scale.set(sc, sc, sc);
      const bx = -1.5 + Math.random() * 3.5;
      const by = 0.6 + Math.random() * 3.2;
      const bz = -3.0 + Math.random() * 3.4;
      s.position.set(bx, by, bz);
      room.add(s);
      motes.push({ s, bx, by, bz, ph: Math.random() * Math.PI * 2 });
    }

    /* ---- desk + computer (working station, LEFT wall) --------------------- */
    // desk runs along z against the left wall; the monitor faces +x (toward the
    // room/camera) so the screen is visible and the operator clearly faces it.
    const deskGroup = new THREE.Group();
    deskGroup.position.set(-3.2, 0, -1.1);
    room.add(deskGroup);

    const deskTop = box(1.1, 0.16, 2.4, 0x6b4a2c, { rough: 0.7 });
    deskTop.position.set(0, 1.0, 0);
    deskGroup.add(deskTop);
    for (const dz of [-1.0, 1.0]) {
      for (const dx of [-0.42, 0.42]) {
        const leg = box(0.14, 1.0, 0.14, 0x4a3320);
        leg.position.set(dx, 0.5, dz);
        deskGroup.add(leg);
      }
    }
    // monitor (screen faces +x)
    const monStand = box(0.18, 0.42, 0.18, 0x222b30);
    monStand.position.set(-0.2, 1.28, 0);
    deskGroup.add(monStand);
    const monitor = box(0.14, 1.0, 1.55, 0x12202b);
    monitor.position.set(-0.28, 1.85, 0);
    deskGroup.add(monitor);
    const screenMat = track(new THREE.MeshStandardMaterial({ color: 0x081512, emissive: 0x46cfa8, emissiveIntensity: 1.2, roughness: 0.4 }));
    const screen = new THREE.Mesh(track(new THREE.PlaneGeometry(1.32, 0.8)), screenMat);
    screen.rotation.y = Math.PI / 2; // face +x
    screen.position.set(-0.2, 1.85, 0);
    deskGroup.add(screen);
    // data bars on the screen (face +x; vary height when working)
    const bars: THREE.Mesh[] = [];
    const barMat = track(new THREE.MeshStandardMaterial({ color: 0x0a1812, emissive: 0x46cfa8, emissiveIntensity: 1.6, roughness: 0.4 }));
    for (let i = 0; i < 6; i++) {
      const bar = new THREE.Mesh(track(new THREE.BoxGeometry(0.02, 0.42, 0.12)), barMat);
      bar.castShadow = false;
      bar.position.set(-0.19, 1.72, -0.5 + i * 0.2);
      deskGroup.add(bar);
      bars.push(bar);
    }
    // keyboard + mouse on the +x side of the desk (where the hands reach)
    const keyboard = box(0.32, 0.05, 0.8, 0x1c252b);
    keyboard.position.set(0.18, 1.09, -0.05);
    deskGroup.add(keyboard);
    const mouse = box(0.16, 0.05, 0.13, 0x1c252b);
    mouse.position.set(0.2, 1.09, 0.62);
    deskGroup.add(mouse);
    // desk lamp (gooseneck-ish), glows at night
    const lampBase = box(0.2, 0.06, 0.2, 0x2a2a2a);
    lampBase.position.set(-0.05, 1.11, 0.95);
    deskGroup.add(lampBase);
    const lampArm = box(0.05, 0.6, 0.05, 0x2a2a2a);
    lampArm.position.set(-0.05, 1.4, 0.95);
    deskGroup.add(lampArm);
    const lampHeadMat = track(new THREE.MeshStandardMaterial({ color: 0x3a3a3a, emissive: 0xffca74, emissiveIntensity: 0.0, roughness: 0.5 }));
    const lampHead = new THREE.Mesh(track(new THREE.BoxGeometry(0.22, 0.16, 0.22)), lampHeadMat);
    lampHead.position.set(0.05, 1.66, 0.95);
    lampHead.rotation.z = 0.5;
    deskGroup.add(lampHead);
    // tower with LED
    const tower = box(0.42, 0.9, 0.7, 0x171f25);
    tower.position.set(0.1, 0.55, -1.05);
    deskGroup.add(tower);
    const towerLedMat = track(new THREE.MeshStandardMaterial({ color: 0x081512, emissive: 0x46cfa8, emissiveIntensity: 2.2, roughness: 0.4 }));
    const towerLed = new THREE.Mesh(track(new THREE.BoxGeometry(0.02, 0.08, 0.08)), towerLedMat);
    towerLed.position.set(0.32, 0.85, -1.05);
    deskGroup.add(towerLed);

    // office chair (seat at the +x side, facing -x toward the desk)
    const officeChair = new THREE.Group();
    officeChair.position.set(-2.2, 0, -1.1);
    room.add(officeChair);
    const ocSeat = box(0.7, 0.12, 0.7, 0x222d33);
    ocSeat.position.set(0, 0.55, 0);
    officeChair.add(ocSeat);
    const ocBack = box(0.12, 0.85, 0.7, 0x222d33);
    ocBack.position.set(0.32, 0.98, 0); // back is on the +x side (behind the operator)
    officeChair.add(ocBack);
    const ocPost = box(0.12, 0.5, 0.12, 0x15191d);
    ocPost.position.set(0, 0.3, 0);
    officeChair.add(ocPost);

    /* ---- lounge chair + side table (idle station, front-centre) ----------- */
    const lounge = new THREE.Group();
    lounge.position.set(0.2, 0, 1.6);
    lounge.rotation.y = -0.55; // back to the rear, opening toward the camera (+x/+z)
    room.add(lounge);
    const lcSeat = box(1.15, 0.34, 1.1, 0x9c5040, { rough: 1 });
    lcSeat.position.set(0, 0.5, 0);
    lounge.add(lcSeat);
    const lcBack = box(1.15, 1.1, 0.32, 0x9c5040, { rough: 1 });
    lcBack.position.set(0, 1.05, -0.5);
    lounge.add(lcBack);
    for (const ax of [-0.62, 0.62]) {
      const arm = box(0.26, 0.5, 1.1, 0x854334, { rough: 1 });
      arm.position.set(ax, 0.78, 0);
      lounge.add(arm);
    }
    const sideTable = box(0.5, 0.5, 0.5, 0x4a3320);
    sideTable.position.set(1.25, 0.25, 1.85);
    room.add(sideTable);
    // floor lamp to the left of the lounge (warm, gentle , brighter at night)
    const floorLampPole = box(0.08, 1.8, 0.08, 0x2a2a2a);
    floorLampPole.position.set(-1.35, 0.9, 2.0);
    room.add(floorLampPole);
    const floorLampShadeMat = track(new THREE.MeshStandardMaterial({ color: 0xcdbb8e, emissive: 0xffca74, emissiveIntensity: 0.15, roughness: 0.8 }));
    const floorLampShade = new THREE.Mesh(track(new THREE.ConeGeometry(0.34, 0.42, 16, 1, true)), floorLampShadeMat);
    floorLampShade.position.set(-1.35, 1.92, 2.0);
    room.add(floorLampShade);
    const loungeLight = new THREE.PointLight(0xffd2a0, 0.3, 6, 2);
    loungeLight.position.set(-1.3, 1.75, 2.0);
    scene.add(loungeLight);

    /* ---- bed (sleeping station, right side) --------------------------------*/
    // Head + pillow at the +z (camera-near) end so the sleeper's face is fully
    // visible; the headboard sits at the FAR (-z) end so nothing blocks the view.
    const bed = new THREE.Group();
    bed.position.set(2.45, 0, -0.3);
    room.add(bed);
    const bedBase = box(1.6, 0.45, 2.7, 0x3a2c1c);
    bedBase.position.set(0, 0.28, 0);
    bed.add(bedBase);
    const mattress = box(1.5, 0.3, 2.55, 0xcdc7ba, { rough: 1 });
    mattress.position.set(0, 0.6, 0);
    bed.add(mattress);
    // low headboard at the FAR (-z) end (does not occlude the sleeper)
    const headboard = box(1.65, 0.55, 0.25, 0x4a3826);
    headboard.position.set(0, 0.62, -1.4);
    bed.add(headboard);
    const pillow = box(1.25, 0.22, 0.55, 0xffffff, { rough: 1 });
    pillow.position.set(0, 0.8, 1.0);
    bed.add(pillow);
    // blanket (separate group so it can slide off when the operator gets up)
    const blanketGroup = new THREE.Group();
    bed.add(blanketGroup);
    // blanket tone kept distinct from the navy shirt so the sleeper reads
    const blanket = box(1.55, 0.24, 1.7, 0x8a9bb0, { rough: 1 });
    blanket.position.set(0, 0.79, -0.45);
    blanketGroup.add(blanket);
    const blanketTrim = box(1.55, 0.08, 0.18, 0x2dd4a7, { emissive: 0x123c30, emissiveIntensity: 0.5 });
    blanketTrim.position.set(0, 0.92, 0.42);
    blanketGroup.add(blanketTrim);

    /* ---- the character (procedural voxel humanoid) ------------------------ */
    const SKIN = 0xe8b98b;
    const SHIRT = 0x12507a;
    const SHIRT_TRIM = 0x2dd4a7;
    const HAIR = 0x2a1d12;
    const PANTS = 0x2b3640;

    const char = new THREE.Group();
    room.add(char);
    const body = new THREE.Group(); // tilts for lying
    char.add(body);

    const torso = box(0.6, 0.7, 0.36, SHIRT);
    torso.position.set(0, 1.5, 0);
    body.add(torso);
    const collar = box(0.6, 0.12, 0.36, SHIRT_TRIM, { emissive: 0x0d2c22, emissiveIntensity: 0.4 });
    collar.position.set(0, 1.79, 0);
    body.add(collar);
    const head = box(0.5, 0.5, 0.5, SKIN);
    head.position.set(0, 2.12, 0);
    body.add(head);
    const hair = box(0.54, 0.2, 0.54, HAIR);
    hair.position.set(0, 2.33, 0);
    body.add(hair);
    const hairBack = box(0.54, 0.32, 0.12, HAIR);
    hairBack.position.set(0, 2.18, -0.22);
    body.add(hairBack);
    // eyes (forward = -z); scaled flat when sleeping
    const eyeL = box(0.07, 0.09, 0.02, 0x101010, { cast: false });
    eyeL.position.set(-0.12, 2.14, -0.26);
    body.add(eyeL);
    const eyeR = box(0.07, 0.09, 0.02, 0x101010, { cast: false });
    eyeR.position.set(0.12, 2.14, -0.26);
    body.add(eyeR);

    function makeArm(side: 1 | -1) {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.39, 1.74, 0);
      const upper = box(0.2, 0.4, 0.22, SHIRT);
      upper.position.set(0, -0.2, 0);
      shoulder.add(upper);
      const elbow = new THREE.Group();
      elbow.position.set(0, -0.4, 0);
      const fore = box(0.18, 0.4, 0.2, SKIN);
      fore.position.set(0, -0.2, 0);
      elbow.add(fore);
      const hand = box(0.2, 0.14, 0.22, SKIN);
      hand.position.set(0, -0.44, 0.02);
      elbow.add(hand);
      shoulder.add(elbow);
      body.add(shoulder);
      return { shoulder, elbow, hand };
    }
    const armL = makeArm(1);
    const armR = makeArm(-1);

    function makeLeg(side: 1 | -1) {
      const hip = new THREE.Group();
      hip.position.set(side * 0.17, 1.16, 0);
      const thigh = box(0.24, 0.5, 0.26, PANTS);
      thigh.position.set(0, -0.25, 0);
      hip.add(thigh);
      const knee = new THREE.Group();
      knee.position.set(0, -0.5, 0);
      const shin = box(0.22, 0.5, 0.24, PANTS);
      shin.position.set(0, -0.25, 0);
      knee.add(shin);
      const foot = box(0.24, 0.14, 0.36, 0x171f25);
      foot.position.set(0, -0.52, 0.07);
      knee.add(foot);
      hip.add(knee);
      body.add(hip);
      return { hip, knee };
    }
    const legL = makeLeg(1);
    const legR = makeLeg(-1);

    // coffee mug (right hand, idle)
    const mugMat = track(new THREE.MeshStandardMaterial({ color: 0xe7ddc7, roughness: 0.6 }));
    const mug = new THREE.Mesh(track(new THREE.CylinderGeometry(0.1, 0.09, 0.18, 12)), mugMat);
    mug.castShadow = true;
    mug.visible = false;
    armR.hand.add(mug);
    mug.position.set(0, -0.06, 0.05);

    // cigarette (left hand, idle) + ember
    const cig = box(0.04, 0.04, 0.22, 0xe8e2d2, { cast: false });
    cig.visible = false;
    armL.hand.add(cig);
    cig.position.set(0, -0.02, 0.14);
    const emberMat = track(new THREE.MeshStandardMaterial({ color: 0x3a1500, emissive: 0xff5a2a, emissiveIntensity: 2.6 }));
    const ember = new THREE.Mesh(track(new THREE.BoxGeometry(0.05, 0.05, 0.05)), emberMat);
    ember.castShadow = false;
    ember.visible = false;
    armL.hand.add(ember);
    ember.position.set(0, -0.02, 0.26);

    // smoke + steam puffs
    const puffGeo = track(new THREE.PlaneGeometry(0.18, 0.18));
    interface Puff {
      mesh: THREE.Mesh;
      mat: THREE.MeshBasicMaterial;
      t: number;
      speed: number;
      ox: number;
    }
    const puffs: Puff[] = [];
    for (let i = 0; i < 8; i++) {
      const m = track(new THREE.MeshBasicMaterial({ color: 0xd8d8d8, transparent: true, opacity: 0, depthWrite: false }));
      const mesh = new THREE.Mesh(puffGeo, m);
      mesh.visible = false;
      room.add(mesh);
      puffs.push({ mesh, mat: m, t: i / 8, speed: 0.4 + Math.random() * 0.3, ox: 0 });
    }

    // Z sprites (sleeping)
    const zTex = track(makeZTexture());
    interface ZSprite {
      sprite: THREE.Sprite;
      mat: THREE.SpriteMaterial;
      t: number;
    }
    const zs: ZSprite[] = [];
    for (let i = 0; i < 3; i++) {
      const m = track(new THREE.SpriteMaterial({ map: zTex, transparent: true, opacity: 0, depthWrite: false }));
      const sprite = new THREE.Sprite(m);
      sprite.scale.set(0.4, 0.4, 0.4);
      sprite.visible = false;
      room.add(sprite);
      zs.push({ sprite, mat: m, t: i / 3 });
    }

    /* ---- pose state ------------------------------------------------------- */
    const start = STATIONS[targetRef.current];
    const pose = {
      x: start.x,
      z: start.z,
      face: start.face,
      seated: start.seated,
      lying: start.lying,
      rootY: start.rootY,
    };
    let phase: "walk" | "act" = "act";
    let activeStation: StationKey = targetRef.current;
    let lastTarget: LabState = targetRef.current;

    function lerpAngle(a: number, b: number, t: number): number {
      let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (d < -Math.PI) d += Math.PI * 2;
      return a + d * t;
    }

    const BED_Y = 1.06;
    function applyPose(walkCycle: number, walking: boolean, actT: number, st: StationKey) {
      const seated = pose.seated;
      const lying = pose.lying;

      char.position.set(pose.x, 0, pose.z);
      char.rotation.y = pose.face;
      // lying: rotate flat (head toward +z), lift onto the mattress, recentre
      body.rotation.x = (Math.PI / 2) * lying;
      body.position.y = pose.rootY * (1 - lying) + BED_Y * lying;
      body.position.z = -1.05 * lying;

      // eyes close (scale flat) while sleeping
      const eyeOpen = 1 - lying;
      eyeL.scale.y = Math.max(0.12, eyeOpen);
      eyeR.scale.y = Math.max(0.12, eyeOpen);

      // legs
      const thighSeat = -1.5 * seated;
      const shinSeat = 1.5 * seated;
      legL.hip.rotation.x = thighSeat;
      legR.hip.rotation.x = thighSeat;
      legL.knee.rotation.x = shinSeat;
      legR.knee.rotation.x = shinSeat;
      legL.hip.rotation.z = 0;
      legR.hip.rotation.z = 0;

      if (walking) {
        const sw = Math.sin(walkCycle) * 0.6;
        legL.hip.rotation.x = sw;
        legR.hip.rotation.x = -sw;
        legL.knee.rotation.x = Math.max(0, -Math.sin(walkCycle)) * 0.8;
        legR.knee.rotation.x = Math.max(0, Math.sin(walkCycle)) * 0.8;
        armL.shoulder.rotation.set(-sw * 0.7, 0, 0.05);
        armR.shoulder.rotation.set(sw * 0.7, 0, -0.05);
        armL.elbow.rotation.set(0.3, 0, 0);
        armR.elbow.rotation.set(0.3, 0, 0);
      } else if (st === "working") {
        // reach forward to the keyboard (forward = -z in body space), type + click
        const type = Math.sin(actT * 11);
        const type2 = Math.sin(actT * 11 + 1.7);
        armL.shoulder.rotation.set(-1.1, 0, 0.18);
        armR.shoulder.rotation.set(-1.0, 0, -0.28); // right arm angled to the mouse
        armL.elbow.rotation.set(0.95 + type * 0.16, 0, 0);
        armR.elbow.rotation.set(0.85 + type2 * 0.05, 0, 0);
        // mouse click: brief dip on the right hand every ~2.5s
        const click = Math.max(0, Math.sin(actT * 2.5)) > 0.97 ? 0.18 : 0;
        armR.elbow.rotation.x += click;
        // tiny head nod toward the screen
        head.rotation.x = 0.12 + Math.sin(actT * 2) * 0.02;
      } else if (st === "idle") {
        const sip = (Math.sin(actT * 0.8) + 1) / 2;
        const raise = sip > 0.72 ? (sip - 0.72) / 0.28 : 0;
        armR.shoulder.rotation.set(-0.5 - raise * 0.8, 0, -0.12);
        armR.elbow.rotation.set(0.6 + raise * 1.5, 0, 0);
        armL.shoulder.rotation.set(-0.6, 0, 0.22);
        armL.elbow.rotation.set(1.2, 0, 0);
        head.rotation.x = -raise * 0.2;
      } else {
        // sleeping: arms rest at the sides
        armL.shoulder.rotation.set(0.05, 0, 0.12);
        armR.shoulder.rotation.set(0.05, 0, -0.12);
        armL.elbow.rotation.set(0.12, 0, 0);
        armR.elbow.rotation.set(0.12, 0, 0);
        head.rotation.x = 0;
      }
      if (st !== "working") head.rotation.x = st === "idle" ? head.rotation.x : 0;
    }

    /* ---- per-state extras (screen, smoke, Z, props) ----------------------- */
    function updateActivity(st: StationKey, t: number, animate: boolean) {
      const working = st === "working";
      const idle = st === "idle";
      const sleeping = st === "sleeping";

      // monitor bars dance when working
      bars.forEach((b, i) => {
        const base = 0.4;
        const amp = working ? 0.7 : 0.18;
        const sy = animate ? base * (0.5 + 0.5 * (working ? Math.abs(Math.sin(t * 5 + i)) : 0.4)) + amp * 0.0 : base * 0.6;
        const h = working ? 0.25 + 0.7 * Math.abs(Math.sin(t * 6 + i * 0.9)) : 0.3;
        b.scale.y = (animate ? h : 0.5) / 0.42;
      });
      screenMat.emissiveIntensity = working ? 1.4 : 0.7;
      monitorLight.intensity = working ? 1.4 + (animate ? Math.sin(t * 6) * 0.25 : 0) : 0.5;

      // idle props
      mug.visible = idle;
      cig.visible = idle;
      ember.visible = idle;

      const emberWorld = new THREE.Vector3();
      ember.getWorldPosition(emberWorld);
      const mugWorld = new THREE.Vector3();
      mug.getWorldPosition(mugWorld);
      puffs.forEach((p, i) => {
        if (!idle) {
          p.mesh.visible = false;
          return;
        }
        p.mesh.visible = true;
        if (animate) p.t += 0.006 * p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.ox = (Math.random() - 0.5) * 0.1;
        }
        const src = i % 3 === 0 ? mugWorld : emberWorld;
        p.mesh.position.set(src.x + p.ox + Math.sin(p.t * 6) * 0.08, src.y + p.t * 1.0, src.z);
        const s = 0.12 + p.t * 0.22;
        p.mesh.scale.set(s, s, s);
        p.mat.opacity = Math.sin(p.t * Math.PI) * 0.45;
        p.mesh.lookAt(camera.position);
      });

      // blanket slides toward the foot of the bed as the operator gets up
      blanketGroup.position.z = (1 - pose.lying) * -1.2;
      blanketGroup.visible = pose.lying > 0.25;

      // Z sprites
      const headWorld = new THREE.Vector3();
      head.getWorldPosition(headWorld);
      zs.forEach((z, i) => {
        if (!sleeping) {
          z.sprite.visible = false;
          return;
        }
        z.sprite.visible = true;
        if (animate) z.t += 0.004 + i * 0.0006;
        if (z.t > 1) z.t = 0;
        z.sprite.position.set(headWorld.x + 0.2 + z.t * 0.5, headWorld.y + 0.3 + z.t * 1.0, headWorld.z + 0.1);
        const s = 0.25 + z.t * 0.4;
        z.sprite.scale.set(s, s, s);
        z.mat.opacity = Math.sin(z.t * Math.PI) * 0.9;
      });

      // breathing
      if (animate) {
        const breathe = 1 + Math.sin(t * (sleeping ? 1.6 : 3)) * (sleeping ? 0.05 : 0.02);
        torso.scale.y = breathe;
      }
    }

    /* ---- lighting update from the (live) hour ----------------------------- */
    const tmpTarget = new THREE.Vector3();
    function updateLighting() {
      const m = sunForHour(hourRef.current);
      sun.position.copy(m.sunPos);
      tmpTarget.set(0, 1, 0);
      sun.target.position.copy(tmpTarget);
      sun.color.copy(m.sunColor);
      sun.intensity = m.sunIntensity;

      hemi.color.copy(m.ambientSky);
      hemi.groundColor.copy(m.ambientGround);
      hemi.intensity = m.ambientIntensity;
      ambient.intensity = 0.16 + m.daylight * 0.4;

      skyMat.color.copy(m.skyColor);
      sunDiskMat.color.copy(m.sunColor);
      // sun disk visible through the window, positioned by the sun azimuth/elevation
      sunDisk.visible = !m.isNight;
      sunDisk.position.set(
        THREE.MathUtils.clamp(m.sunPos.x * 0.32, -1.3, 1.3),
        THREE.MathUtils.clamp((m.sunPos.y - 2.7) * 0.5, -0.9, 0.9),
        -0.2
      );

      // interior lamps brighten as it gets dark (kept gentle , no glare blowout)
      const dark = 1 - m.daylight;
      lampLight.intensity = 0.12 + dark * 1.0;
      loungeLight.intensity = 0.12 + dark * 0.7;
      lampHeadMat.emissiveIntensity = 0.15 + dark * 0.7;
      floorLampShadeMat.emissiveIntensity = 0.12 + dark * 0.45;
      towerLedMat.emissiveIntensity = 1.6 + dark * 0.8;

      // sun shafts + dust strengthen with daylight
      shaftMat.opacity = m.daylight * 0.16;
      shaftMat.color.copy(m.sunColor);
      moteMat.opacity = m.daylight * 0.5;
      moteMat.color.copy(m.sunColor);

      // fog tints with the sky a little
      if (scene.fog) (scene.fog as THREE.Fog).color.copy(m.skyColor).multiplyScalar(m.isNight ? 0.1 : 0.5);

      if (bloomPass) bloomPass.strength = m.isNight ? 0.62 : 0.32;

      scene.background = m.skyColor.clone().multiplyScalar(m.isNight ? 0.08 : 0.42);
    }

    /* ---- animation loop --------------------------------------------------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let walkCycle = 0;
    let actT = 0;
    let running = true;
    const WALK_SPEED = 2.2;

    function renderFrame() {
      if (composer) composer.render();
      else renderer.render(scene, camera);
    }

    function frame() {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const now = clock.elapsedTime;

      const target = targetRef.current;
      if (target !== lastTarget) {
        lastTarget = target;
        phase = "walk";
      }
      const dest = STATIONS[target];

      if (phase === "walk") {
        // stand up first (rise off the bed / out of the chair)
        pose.seated += (0 - pose.seated) * Math.min(1, dt * 7);
        pose.lying += (0 - pose.lying) * Math.min(1, dt * 7);
        pose.rootY += (0 - pose.rootY) * Math.min(1, dt * 7);

        const standing = pose.lying < 0.15 && pose.seated < 0.15;
        if (standing) {
          const dx = dest.x - pose.x;
          const dz = dest.z - pose.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.05) {
            const step = Math.min(dist, WALK_SPEED * dt);
            pose.x += (dx / dist) * step;
            pose.z += (dz / dist) * step;
            pose.face = lerpAngle(pose.face, Math.atan2(dx, dz), Math.min(1, dt * 7));
            walkCycle += dt * 10;
            applyPose(walkCycle, true, 0, target);
          } else {
            pose.x = dest.x;
            pose.z = dest.z;
            phase = "act";
            activeStation = target;
            actT = 0;
          }
        } else {
          // still rising in place
          applyPose(0, false, 0, activeStation);
        }
      } else {
        pose.seated += (dest.seated - pose.seated) * Math.min(1, dt * 6);
        pose.lying += (dest.lying - pose.lying) * Math.min(1, dt * 6);
        pose.rootY += (dest.rootY - pose.rootY) * Math.min(1, dt * 6);
        pose.face = lerpAngle(pose.face, dest.face, Math.min(1, dt * 6));
        actT += dt;
        applyPose(0, false, actT, activeStation);
      }

      updateActivity(activeStation, now, true);
      updateLighting();

      camera.position.set(
        camBase.x + Math.sin(now * 0.16) * 0.4,
        camBase.y + Math.sin(now * 0.11) * 0.2,
        camBase.z
      );
      camera.lookAt(lookAt);

      renderFrame();
      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      const d = STATIONS[targetRef.current];
      pose.x = d.x;
      pose.z = d.z;
      pose.face = d.face;
      pose.seated = d.seated;
      pose.lying = d.lying;
      pose.rootY = d.rootY;
      activeStation = targetRef.current;
      applyPose(0, false, 0.2, activeStation);
      updateActivity(activeStation, 0, false);
      updateLighting();
      camera.lookAt(lookAt);
      renderFrame();
    } else {
      raf = requestAnimationFrame(frame);
    }

    /* ---- resize ----------------------------------------------------------- */
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth || w0;
      const h = mount.clientHeight || h0;
      renderer.setSize(w, h);
      composer?.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduced) {
        camera.lookAt(lookAt);
        renderFrame();
      }
    });
    ro.observe(mount);

    /* ---- pause when hidden / offscreen ------------------------------------ */
    const onVis = () => {
      if (reduced) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        clock.getDelta();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduced) return;
        if (!entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        } else if (!running && !document.hidden) {
          running = true;
          clock.getDelta();
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.01 }
    );
    io.observe(mount);

    /* ---- cleanup ---------------------------------------------------------- */
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
      io.disconnect();
      composer?.dispose();
      for (const d of disposables) {
        try {
          d.dispose();
        } catch {
          /* noop */
        }
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" aria-hidden />;
}

export default LabRoom3D;
