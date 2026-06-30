"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  LabRoom3D , a real-time 3D operator room with a Sims-style angled camera.   */
/*                                                                            */
/*  The voxel operator lives in one room and acts out the harvest machine's    */
/*  live state:                                                                */
/*    working  : sits at the desk and types at the computer (monitor aglow).   */
/*    idle     : walks to the lounge chair, sits, sips coffee, smokes.         */
/*    sleeping : walks to the bed and sleeps (slow breathing, rising Z's).     */
/*                                                                            */
/*  When the state changes the character WALKS across the room to the next     */
/*  station, then eases into the new pose. Original procedural voxel art (no    */
/*  external models, no Minecraft assets). Honors prefers-reduced-motion:       */
/*  renders a single static frame with the character already at its station.   */
/* -------------------------------------------------------------------------- */

export type LabState = "working" | "idle" | "sleeping";

interface Props {
  state: LabState;
}

type StationKey = LabState;

interface Station {
  /* where the character's feet stand/sit (room coords) */
  x: number;
  z: number;
  /* facing (rotation.y) once arrived */
  face: number;
  /* pose factors */
  seated: number; // 0 standing .. 1 seated
  lying: number; // 0 upright .. 1 lying flat
  rootY: number; // vertical offset of the body root once posed
}

const STATIONS: Record<StationKey, Station> = {
  working: { x: 2.05, z: -0.35, face: 0, seated: 1, lying: 0, rootY: -0.34 },
  idle: { x: -0.35, z: 1.0, face: Math.PI * 0.92, seated: 1, lying: 0, rootY: -0.34 },
  sleeping: { x: -2.5, z: -0.7, face: 0, seated: 0, lying: 1, rootY: 0 },
};

const STATE_LAMP: Record<LabState, number> = {
  working: 0x46cfa8,
  idle: 0xe6b53c,
  sleeping: 0xc0506a,
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
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
  ctx.fillStyle = "#cfe8df";
  ctx.font = "bold 52px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Z", 32, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function LabRoom3D({ state }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  // expose the latest target state to the animation loop without re-running setup
  const targetRef = useRef<LabState>(state);

  useEffect(() => {
    targetRef.current = state;
  }, [state]);

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
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const w0 = mount.clientWidth || 320;
    const h0 = mount.clientHeight || 240;
    renderer.setSize(w0, h0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, w0 / h0, 0.1, 100);
    const camBase = new THREE.Vector3(6.4, 5.6, 7.4);
    camera.position.copy(camBase);
    const lookAt = new THREE.Vector3(-0.1, 1.0, -0.2);
    camera.lookAt(lookAt);

    /* ---- lights ----------------------------------------------------------- */
    scene.add(new THREE.AmbientLight(0x6a7a86, 0.85));
    const key = new THREE.DirectionalLight(0xfff1e0, 1.05);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x88aaff, 0.3);
    fill.position.set(-6, 4, 3);
    scene.add(fill);

    // monitor glow (color shifts with state)
    const monitorLight = new THREE.PointLight(STATE_LAMP.working, 0.0, 6, 2);
    monitorLight.position.set(2.05, 1.55, -1.0);
    scene.add(monitorLight);

    /* ---- material / geometry helpers -------------------------------------- */
    function box(
      w: number,
      h: number,
      d: number,
      color: number,
      opts: { emissive?: number; emissiveIntensity?: number; cast?: boolean } = {}
    ): THREE.Mesh {
      const geo = track(new THREE.BoxGeometry(w, h, d));
      const mat = track(
        new THREE.MeshLambertMaterial({
          color,
          emissive: opts.emissive ?? 0x000000,
          emissiveIntensity: opts.emissiveIntensity ?? 1,
        })
      );
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = opts.cast ?? true;
      m.receiveShadow = true;
      return m;
    }

    /* ---- room ------------------------------------------------------------- */
    const room = new THREE.Group();
    scene.add(room);

    const floor = box(9, 0.3, 7, 0x2c3b44, { cast: false });
    floor.position.set(0, -0.15, 0);
    room.add(floor);
    // rug
    const rug = box(3.4, 0.02, 3.0, 0x1d6b58, { cast: false });
    rug.position.set(-0.3, 0.02, 0.7);
    room.add(rug);

    const backWall = box(9, 5, 0.3, 0x33444e, { cast: false });
    backWall.position.set(0, 2.35, -3.2);
    room.add(backWall);
    const leftWall = box(0.3, 5, 7, 0x2b3a43, { cast: false });
    leftWall.position.set(-4.4, 2.35, 0);
    room.add(leftWall);

    // a framed "lost species" poster on the back wall
    const posterFrame = box(1.2, 1.5, 0.08, 0x14202a, { cast: false });
    posterFrame.position.set(-1.7, 2.7, -3.0);
    room.add(posterFrame);
    const poster = box(0.95, 1.2, 0.04, 0x0d161d, { emissive: 0x123, cast: false });
    poster.position.set(-1.7, 2.7, -2.95);
    room.add(poster);

    /* ---- desk + computer (working station, right) ------------------------- */
    const deskGroup = new THREE.Group();
    deskGroup.position.set(2.05, 0, -1.15);
    room.add(deskGroup);

    const deskTop = box(2.4, 0.16, 1.1, 0x6b4a2c);
    deskTop.position.set(0, 1.0, 0);
    deskGroup.add(deskTop);
    for (const dx of [-1.0, 1.0]) {
      for (const dz of [-0.42, 0.42]) {
        const leg = box(0.14, 1.0, 0.14, 0x4a3320);
        leg.position.set(dx, 0.5, dz);
        deskGroup.add(leg);
      }
    }
    // monitor
    const monStand = box(0.16, 0.4, 0.16, 0x222b30);
    monStand.position.set(0, 1.28, -0.2);
    deskGroup.add(monStand);
    const monitor = box(1.5, 0.95, 0.12, 0x12202b);
    monitor.position.set(0, 1.85, -0.25);
    deskGroup.add(monitor);
    const screenGeo = track(new THREE.PlaneGeometry(1.3, 0.78));
    const screenMat = track(
      new THREE.MeshBasicMaterial({ color: STATE_LAMP.working })
    );
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.85, -0.185);
    deskGroup.add(screen);
    // data bars on screen
    const bars: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const bar = box(0.12, 0.4, 0.02, 0x0a1812, {
        emissive: STATE_LAMP.working,
        emissiveIntensity: 1.4,
      });
      bar.castShadow = false;
      bar.position.set(-0.5 + i * 0.2, 1.72, -0.17);
      deskGroup.add(bar);
      bars.push(bar);
    }
    // keyboard + mouse
    const keyboard = box(0.8, 0.05, 0.3, 0x1c252b);
    keyboard.position.set(-0.1, 1.09, 0.28);
    deskGroup.add(keyboard);
    const mouse = box(0.14, 0.05, 0.2, 0x1c252b);
    mouse.position.set(0.55, 1.09, 0.3);
    deskGroup.add(mouse);
    // tower
    const tower = box(0.4, 0.9, 0.7, 0x171f25);
    tower.position.set(1.0, 0.55, 0);
    deskGroup.add(tower);
    const towerLed = box(0.08, 0.08, 0.02, 0x000000, {
      emissive: STATE_LAMP.working,
      emissiveIntensity: 2,
    });
    towerLed.position.set(1.0, 0.85, 0.36);
    deskGroup.add(towerLed);

    // office chair
    const officeChair = new THREE.Group();
    officeChair.position.set(2.05, 0, -0.35);
    room.add(officeChair);
    const ocSeat = box(0.7, 0.12, 0.7, 0x222d33);
    ocSeat.position.set(0, 0.55, 0);
    officeChair.add(ocSeat);
    const ocBack = box(0.7, 0.8, 0.12, 0x222d33);
    ocBack.position.set(0, 0.95, -0.3);
    officeChair.add(ocBack);
    const ocPost = box(0.12, 0.5, 0.12, 0x15191d);
    ocPost.position.set(0, 0.3, 0);
    officeChair.add(ocPost);

    /* ---- lounge chair + side table (idle station, centre) ----------------- */
    const lounge = new THREE.Group();
    lounge.position.set(-0.5, 0, 1.0);
    lounge.rotation.y = Math.PI * 0.92;
    room.add(lounge);
    const lcSeat = box(1.0, 0.3, 1.0, 0x8a4a3a);
    lcSeat.position.set(0, 0.5, 0);
    lounge.add(lcSeat);
    const lcBack = box(1.0, 1.0, 0.3, 0x8a4a3a);
    lcBack.position.set(0, 1.0, -0.5);
    lounge.add(lcBack);
    for (const ax of [-0.55, 0.55]) {
      const arm = box(0.2, 0.45, 1.0, 0x733d30);
      arm.position.set(ax, 0.72, 0);
      lounge.add(arm);
    }
    // side table + coffee mug + ashtray
    const sideTable = box(0.6, 0.6, 0.6, 0x4a3320);
    sideTable.position.set(-1.7, 0.3, 1.35);
    room.add(sideTable);

    /* ---- bed (sleeping station, left) ------------------------------------- */
    const bed = new THREE.Group();
    bed.position.set(-2.5, 0, -0.7);
    bed.rotation.y = Math.PI * 0.5;
    room.add(bed);
    const mattress = box(2.5, 0.4, 1.4, 0x3f5168);
    mattress.position.set(0, 0.55, 0);
    bed.add(mattress);
    const bedBase = box(2.6, 0.45, 1.5, 0x2d3a30);
    bedBase.position.set(0, 0.28, 0);
    bed.add(bedBase);
    const headboard = box(0.25, 1.0, 1.5, 0x5a3d23);
    headboard.position.set(-1.25, 0.85, 0);
    bed.add(headboard);
    const pillow = box(0.55, 0.22, 1.1, 0xd8d2c4);
    pillow.position.set(-0.85, 0.86, 0);
    bed.add(pillow);
    const blanket = box(1.7, 0.18, 1.45, 0x0e3a5c);
    blanket.position.set(0.35, 0.84, 0);
    bed.add(blanket);
    const blanketTrim = box(1.7, 0.05, 1.45, 0x2dd4a7, {
      emissive: 0x123c30,
    });
    blanketTrim.position.set(0.35, 0.94, 0);
    bed.add(blanketTrim);

    /* ---- the character (procedural voxel humanoid) ------------------------ */
    const SKIN = 0xe8b98b;
    const SHIRT = 0x0e3a5c;
    const SHIRT_TRIM = 0x2dd4a7;
    const HAIR = 0x2a1d12;
    const PANTS = 0x26323b;

    const char = new THREE.Group(); // root: x/z = floor position, y handled by rootY
    room.add(char);

    const body = new THREE.Group(); // tilts for lying; child of char
    char.add(body);

    // hips/torso
    const torso = box(0.62, 0.7, 0.36, SHIRT);
    torso.position.set(0, 1.5, 0);
    body.add(torso);
    const collar = box(0.62, 0.12, 0.36, SHIRT_TRIM, { emissive: 0x0d2c22 });
    collar.position.set(0, 1.79, 0);
    body.add(collar);
    // head
    const head = box(0.5, 0.5, 0.5, SKIN);
    head.position.set(0, 2.12, 0);
    body.add(head);
    const hair = box(0.54, 0.18, 0.54, HAIR);
    hair.position.set(0, 2.34, 0);
    body.add(hair);
    const hairBack = box(0.54, 0.34, 0.12, HAIR);
    hairBack.position.set(0, 2.18, -0.22);
    body.add(hairBack);
    // eyes
    for (const ex of [-0.12, 0.12]) {
      const eye = box(0.07, 0.09, 0.02, 0x101010, { cast: false });
      eye.position.set(ex, 2.14, 0.26);
      body.add(eye);
    }

    // arm builder: shoulder group (pivot at top), forearm group (pivot at elbow)
    function makeArm(side: 1 | -1) {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.4, 1.74, 0);
      const upper = box(0.2, 0.4, 0.22, SHIRT);
      upper.position.set(0, -0.2, 0);
      shoulder.add(upper);
      const elbow = new THREE.Group();
      elbow.position.set(0, -0.4, 0);
      const fore = box(0.18, 0.42, 0.2, SKIN);
      fore.position.set(0, -0.21, 0);
      elbow.add(fore);
      shoulder.add(elbow);
      body.add(shoulder);
      return { shoulder, elbow };
    }
    const armL = makeArm(1);
    const armR = makeArm(-1);

    // leg builder: hip group (pivot), knee group (pivot)
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

    // coffee mug (held in right hand during idle)
    const mugGeo = track(new THREE.CylinderGeometry(0.1, 0.09, 0.18, 10));
    const mugMat = track(new THREE.MeshLambertMaterial({ color: 0xd8d2c4 }));
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.castShadow = true;
    mug.visible = false;
    armR.elbow.add(mug);
    mug.position.set(0, -0.46, 0.04);

    // cigarette (held in left hand during idle) + ember
    const cig = box(0.04, 0.04, 0.22, 0xe8e2d2, { cast: false });
    cig.visible = false;
    armL.elbow.add(cig);
    cig.position.set(0, -0.44, 0.12);
    const ember = box(0.05, 0.05, 0.05, 0x000000, {
      emissive: 0xff5a2a,
      emissiveIntensity: 2.4,
      cast: false,
    });
    ember.visible = false;
    armL.elbow.add(ember);
    ember.position.set(0, -0.44, 0.24);

    // smoke + steam particles (small fading planes that rise)
    const puffGeo = track(new THREE.PlaneGeometry(0.16, 0.16));
    interface Puff {
      mesh: THREE.Mesh;
      mat: THREE.MeshBasicMaterial;
      t: number;
      speed: number;
      ox: number;
    }
    const puffs: Puff[] = [];
    for (let i = 0; i < 8; i++) {
      const mat = track(
        new THREE.MeshBasicMaterial({
          color: 0xcfe8df,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        })
      );
      const mesh = new THREE.Mesh(puffGeo, mat);
      mesh.visible = false;
      room.add(mesh);
      puffs.push({ mesh, mat, t: i / 8, speed: 0.4 + Math.random() * 0.3, ox: 0 });
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
      const mat = track(
        new THREE.SpriteMaterial({ map: zTex, transparent: true, opacity: 0, depthWrite: false })
      );
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.4, 0.4, 0.4);
      sprite.visible = false;
      room.add(sprite);
      zs.push({ sprite, mat, t: i / 3 });
    }

    /* ---- pose state (lerped toward station targets each frame) ------------- */
    const pose = {
      x: STATIONS[targetRef.current].x,
      z: STATIONS[targetRef.current].z,
      face: STATIONS[targetRef.current].face,
      seated: STATIONS[targetRef.current].seated,
      lying: STATIONS[targetRef.current].lying,
      rootY: STATIONS[targetRef.current].rootY,
    };
    let phase: "walk" | "act" = "act";
    let activeStation: StationKey = targetRef.current;
    let lastTarget: LabState = targetRef.current;

    const BED_Y = 0.95; // mattress-top height the lying body rests at
    function applyPose(walkCycle: number, walking: boolean, actT: number, st: StationKey) {
      const seated = pose.seated;
      const lying = pose.lying;

      char.position.set(pose.x, 0, pose.z);
      char.rotation.y = pose.face;
      // Lying: rotate the body flat (head toward +z) and lift it onto the
      // mattress. The body pivots at the feet, so +90deg lays it along +z and we
      // shift back by ~half the body length to centre it on the bed.
      body.rotation.x = (Math.PI / 2) * lying;
      body.position.y = pose.rootY * (1 - lying) + BED_Y * lying;
      body.position.z = -1.12 * lying;

      // base joint angles from seated/lying
      // legs
      const thighSeat = -1.5 * seated; // forward/up when seated
      const shinSeat = 1.5 * seated; // shins drop down
      const thighLie = -0.05 * lying;
      legL.hip.rotation.x = thighSeat + thighLie;
      legR.hip.rotation.x = thighSeat + thighLie;
      legL.knee.rotation.x = shinSeat;
      legR.knee.rotation.x = shinSeat;

      // walking overrides legs with a swing cycle
      if (walking) {
        const sw = Math.sin(walkCycle) * 0.6;
        legL.hip.rotation.x = sw;
        legR.hip.rotation.x = -sw;
        legL.knee.rotation.x = Math.max(0, -Math.sin(walkCycle)) * 0.7;
        legR.knee.rotation.x = Math.max(0, Math.sin(walkCycle)) * 0.7;
        armL.shoulder.rotation.x = -sw * 0.7;
        armR.shoulder.rotation.x = sw * 0.7;
        armL.elbow.rotation.x = 0.2;
        armR.elbow.rotation.x = 0.2;
      } else {
        // arms depend on the activity
        if (st === "working") {
          // type: arms reach forward to the keyboard, small bob
          const bob = Math.sin(actT * 9) * 0.12;
          armL.shoulder.rotation.x = -1.15;
          armR.shoulder.rotation.x = -1.15;
          armL.elbow.rotation.x = 1.0 + bob;
          armR.elbow.rotation.x = 1.0 - bob;
          armL.shoulder.rotation.z = 0.15;
          armR.shoulder.rotation.z = -0.15;
        } else if (st === "idle") {
          // right arm sips periodically, left holds cigarette
          const sip = (Math.sin(actT * 0.8) + 1) / 2; // 0..1 slow
          const raise = sip > 0.7 ? (sip - 0.7) / 0.3 : 0;
          armR.shoulder.rotation.x = -0.5 - raise * 0.7;
          armR.elbow.rotation.x = 0.6 + raise * 1.4;
          armR.shoulder.rotation.z = -0.1;
          armL.shoulder.rotation.x = -0.7;
          armL.elbow.rotation.x = 1.3;
          armL.shoulder.rotation.z = 0.2;
        } else {
          // sleeping: arms rest alongside the body
          armL.shoulder.rotation.x = 0.05;
          armR.shoulder.rotation.x = 0.05;
          armL.elbow.rotation.x = 0.1;
          armR.elbow.rotation.x = 0.1;
          armL.shoulder.rotation.z = 0.08;
          armR.shoulder.rotation.z = -0.08;
        }
      }
    }

    /* ---- per-state extra animation (screen, smoke, Z) --------------------- */
    function updateActivity(st: StationKey, t: number, animate: boolean) {
      // monitor / bars / tower led colour follow the lamp
      const lamp = STATE_LAMP[st];
      screenMat.color.setHex(lamp);
      (towerLed.material as THREE.MeshLambertMaterial).emissive.setHex(lamp);
      for (const b of bars) (b.material as THREE.MeshLambertMaterial).emissive.setHex(lamp);

      const working = st === "working";
      monitorLight.color.setHex(lamp);
      monitorLight.intensity = working ? 1.6 + (animate ? Math.sin(t * 6) * 0.25 : 0) : 0.35;

      // data bars dance when working
      bars.forEach((b, i) => {
        const base = 0.18;
        const amp = working ? 0.55 : 0.12;
        const sy = animate ? base + amp * (0.5 + 0.5 * Math.sin(t * 5 + i)) : base + amp * 0.5;
        b.scale.y = sy / 0.4;
        b.position.y = 1.52 + sy / 2 + 1.15 - 1.15; // anchor near bottom of screen
        b.position.y = 1.55 + (sy * 0.4) / 2;
      });

      // idle props
      const idle = st === "idle";
      mug.visible = idle;
      cig.visible = idle;
      ember.visible = idle;

      // smoke (idle) + steam: rise from the cigarette ember / mug
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
        const src = i % 3 === 0 ? mugWorld : emberWorld; // a third are steam from mug
        p.mesh.position.set(
          src.x + p.ox + Math.sin(p.t * 6) * 0.08,
          src.y + p.t * 1.1,
          src.z
        );
        const s = 0.1 + p.t * 0.22;
        p.mesh.scale.set(s, s, s);
        p.mat.opacity = Math.sin(p.t * Math.PI) * 0.5;
        p.mesh.lookAt(camera.position);
      });

      // Z sprites (sleeping)
      const sleeping = st === "sleeping";
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
        z.sprite.position.set(
          headWorld.x + 0.3 + z.t * 0.5,
          headWorld.y + 0.2 + z.t * 1.1,
          headWorld.z + 0.3
        );
        const s = 0.25 + z.t * 0.4;
        z.sprite.scale.set(s, s, s);
        z.mat.opacity = Math.sin(z.t * Math.PI) * 0.9;
      });

      // gentle breathing while seated/lying (torso scale)
      if (animate) {
        const breathe = 1 + Math.sin(t * (sleeping ? 1.6 : 3)) * (sleeping ? 0.04 : 0.02);
        torso.scale.y = breathe;
      }
    }

    /* ---- animation loop --------------------------------------------------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let walkCycle = 0;
    let actT = 0;
    let running = true;

    const WALK_SPEED = 2.4; // units/sec

    function frame() {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const now = clock.elapsedTime;

      // react to a target change
      const target = targetRef.current;
      if (target !== lastTarget) {
        lastTarget = target;
        phase = "walk";
      }

      const dest = STATIONS[target];

      if (phase === "walk") {
        // stand up first (ease seated/lying to 0 while walking)
        pose.seated += (0 - pose.seated) * Math.min(1, dt * 8);
        pose.lying += (0 - pose.lying) * Math.min(1, dt * 8);
        pose.rootY += (0 - pose.rootY) * Math.min(1, dt * 8);

        const dx = dest.x - pose.x;
        const dz = dest.z - pose.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.04) {
          const step = Math.min(dist, WALK_SPEED * dt);
          pose.x += (dx / dist) * step;
          pose.z += (dz / dist) * step;
          // face the direction of travel
          const want = Math.atan2(dx, dz);
          pose.face = lerpAngle(pose.face, want, Math.min(1, dt * 6));
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
        // ease into the seated/lying pose + facing
        pose.seated += (dest.seated - pose.seated) * Math.min(1, dt * 6);
        pose.lying += (dest.lying - pose.lying) * Math.min(1, dt * 6);
        pose.rootY += (dest.rootY - pose.rootY) * Math.min(1, dt * 6);
        pose.face = lerpAngle(pose.face, dest.face, Math.min(1, dt * 6));
        actT += dt;
        applyPose(0, false, actT, activeStation);
      }

      updateActivity(activeStation, now, true);

      // subtle living camera sway
      camera.position.set(
        camBase.x + Math.sin(now * 0.18) * 0.5,
        camBase.y + Math.sin(now * 0.13) * 0.25,
        camBase.z
      );
      camera.lookAt(lookAt);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    function lerpAngle(a: number, b: number, t: number): number {
      let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (d < -Math.PI) d += Math.PI * 2;
      return a + d * t;
    }

    if (reduced) {
      // static frame: snap to the current station, render once.
      const dest = STATIONS[targetRef.current];
      pose.x = dest.x;
      pose.z = dest.z;
      pose.face = dest.face;
      pose.seated = dest.seated;
      pose.lying = dest.lying;
      pose.rootY = dest.rootY;
      activeStation = targetRef.current;
      applyPose(0, false, 0.1, activeStation);
      updateActivity(activeStation, 0, false);
      camera.lookAt(lookAt);
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(frame);
    }

    /* ---- resize ----------------------------------------------------------- */
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth || w0;
      const h = mount.clientHeight || h0;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduced) {
        camera.lookAt(lookAt);
        renderer.render(scene, camera);
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
