"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import ForceGraph3D from "react-force-graph-3d";
import Portal from "./Portal";
import { computeSmartAnchor } from "./computeSmartAnchor";
import { NODE_SLUG_MAP } from "./node-slug-map";
import { graphData, type GraphNode } from "./graph-data";

/* -------------------------------------------------------------------------- */
/*  NaLI Knowledge Galaxy, armillary edition.                                  */
/*                                                                            */
/*  An armillary wireframe globe of NaLI's research: a thin meridian/parallel  */
/*  cage with an equatorial halo, every article pinned to the sphere surface   */
/*  as a crisp star, constellation lines linking related work, and a pulsing   */
/*  core flare at the centre. Always alive (slow auto-orbit), breathing (core  */
/*  + bloom + starfield twinkle on a sine wave), growing (the force sim        */
/*  accretes the shell on load). Reduced-motion safe; mobile keeps the index.  */
/* -------------------------------------------------------------------------- */

const GROUP_COLOR: Record<string, string> = {
  alam: "#46cfa8", // emerald
  sejarah: "#d4af37", // gold
  investigasi: "#f97316", // alert orange
};

const GROUP_LABEL: Record<string, string> = {
  alam: "Alam & Lanskap",
  sejarah: "Sejarah Nusantara",
  investigasi: "Liputan Investigasi",
};

const SPHERE_R = 150;
const CAGE_COLOR = 0xbfe9dd;
const CORE_COLOR = 0xff5fa2;

/** Soft radial-gradient sprite so each node reads as a glowing star, not a flat disc. */
function makeGlowTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.18, "rgba(255,255,255,0.92)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.28)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/** Armillary cage: latitude rings (bold equator) + longitude great circles through the poles. */
function buildCage(R: number): THREE.Group {
  const cage = new THREE.Group();
  const mat = (opacity: number) =>
    new THREE.LineBasicMaterial({ color: CAGE_COLOR, transparent: true, opacity });

  const LAT = 9;
  for (let i = 1; i < LAT; i++) {
    const phi = (i / LAT) * Math.PI;
    const r = R * Math.sin(phi);
    const y = R * Math.cos(phi);
    const pts: THREE.Vector3[] = [];
    for (let a = 0; a <= 72; a++) {
      const t = (a / 72) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(t), y, r * Math.sin(t)));
    }
    const isEquator = Math.abs(phi - Math.PI / 2) < 1e-3;
    cage.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat(isEquator ? 0.5 : 0.14)));
  }

  const MER = 12;
  for (let i = 0; i < MER; i++) {
    const lon = (i / MER) * Math.PI * 2;
    const pts: THREE.Vector3[] = [];
    for (let a = 0; a <= 72; a++) {
      const t = (a / 72) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(R * Math.sin(t) * Math.cos(lon), R * Math.cos(t), R * Math.sin(t) * Math.sin(lon)),
      );
    }
    cage.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat(0.1)));
  }
  return cage;
}

export function GalaxyGraph() {
  const fgRef = useRef<any>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [dims, setDims] = useState({ width: 0, height: 650 });

  const lastClickRef = useRef<{ nodeId: string; time: number } | null>(null);
  const configuredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const coreRef = useRef<{ group: THREE.Group; ico: THREE.Mesh; inner: THREE.Mesh; flare: THREE.Sprite | null } | null>(null);
  const cageRef = useRef<THREE.Group | null>(null);
  const dustRef = useRef<THREE.Points | null>(null);
  const bloomRef = useRef<UnrealBloomPass | null>(null);

  const year = useMemo(() => new Date().getFullYear(), []);
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const glowTexture = useMemo(() => (typeof window === "undefined" ? null : makeGlowTexture()), []);

  // Track container width (the 3D canvas needs explicit pixel dimensions).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDims({ width: el.clientWidth, height: 650 }));
    ro.observe(el);
    setDims({ width: el.clientWidth, height: 650 });
    return () => ro.disconnect();
  }, []);

  // Track viewport + pointer for the hover-card smart anchoring.
  useEffect(() => {
    const onResize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  // One-time scene setup once the instance + a real width exist.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || dims.width === 0 || configuredRef.current) return;
    configuredRef.current = true;

    const scene: THREE.Scene = fg.scene();

    // 1. Forces: pin nodes hard onto the sphere SURFACE (points on a globe),
    //    spread them, and tighten links into constellation clusters.
    let fNodes: Array<{ x: number; y: number; z: number; vx: number; vy: number; vz: number }> = [];
    const radial: any = (alpha: number) => {
      for (const n of fNodes) {
        const d = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1e-3;
        const k = ((SPHERE_R - d) / d) * alpha * 0.5;
        n.vx += n.x * k;
        n.vy += n.y * k;
        n.vz += n.z * k;
      }
    };
    radial.initialize = (ns: any[]) => {
      fNodes = ns;
    };
    fg.d3Force("radial", radial);
    fg.d3Force("charge")?.strength(-34);
    fg.d3Force("link")?.distance(26);

    // 2. Armillary cage + equatorial halo ring.
    const cage = buildCage(SPHERE_R);
    scene.add(cage);
    cageRef.current = cage;

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(SPHERE_R * 1.1, SPHERE_R * 1.17, 120),
      new THREE.MeshBasicMaterial({ color: CAGE_COLOR, transparent: true, opacity: 0.22, side: THREE.DoubleSide }),
    );
    ring.rotation.x = Math.PI / 2;
    cage.add(ring);

    // 3. Pink core flare at the centre.
    const group = new THREE.Group();
    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(11, 1),
      new THREE.MeshBasicMaterial({ color: CORE_COLOR, wireframe: true, transparent: true, opacity: 0.9 }),
    );
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(5.5, 0),
      new THREE.MeshBasicMaterial({ color: 0xffe3ef, wireframe: true, transparent: true, opacity: 0.7 }),
    );
    group.add(ico, inner);
    let flare: THREE.Sprite | null = null;
    if (glowTexture) {
      flare = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color: CORE_COLOR,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      flare.scale.set(48, 48, 1);
      group.add(flare);
      const hot = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color: 0xffffff,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      hot.scale.set(16, 16, 1);
      group.add(hot);
    }
    scene.add(group);
    coreRef.current = { group, ico, inner, flare };

    // 4. Dense ambient micro-stars dusted across the shell + a far starfield, for depth.
    const N = 900;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const onShell = i < N * 0.62;
      const r = onShell ? SPHERE_R * (0.97 + Math.random() * 0.06) : 520 + Math.random() * 1000;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: 0xcfeee6, size: 1.1, transparent: true, opacity: 0.5, sizeAttenuation: true }),
    );
    scene.add(dust);
    dustRef.current = dust;

    // 5. Modest bloom (crisp lines, glowing core, not a neon blob).
    try {
      const bloom = new UnrealBloomPass(new THREE.Vector2(dims.width, dims.height), 0.5, 0.38, 0.2);
      fg.postProcessingComposer().addPass(bloom);
      bloomRef.current = bloom;
    } catch {
      /* postprocessing unavailable; scene still renders */
    }

    // 6. Orbit controls + slow auto-rotate = the globe is "always alive".
    const controls = fg.controls();
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = !reduce;
      controls.autoRotateSpeed = 0.5;
      controls.minDistance = 120;
      controls.maxDistance = 900;
    }
    fg.cameraPosition({ x: 0, y: 70, z: 580 }, { x: 0, y: 0, z: 0 }, 0);

    // 7. Breathing loop: pulse the core + bloom + a faint starfield twinkle.
    if (!reduce) {
      const animate = () => {
        const t = performance.now() / 1000;
        const c = coreRef.current;
        if (c) {
          c.group.scale.setScalar(1 + Math.sin(t * 1.5) * 0.1);
          c.ico.rotation.y += 0.004;
          c.ico.rotation.x += 0.0015;
          c.inner.rotation.y -= 0.007;
          if (c.flare) (c.flare.material as THREE.SpriteMaterial).opacity = 0.85 + Math.sin(t * 1.5) * 0.12;
        }
        if (cageRef.current) cageRef.current.rotation.y += 0.0004;
        if (dustRef.current)
          (dustRef.current.material as THREE.PointsMaterial).opacity = 0.45 + Math.sin(t * 0.9) * 0.12;
        if (bloomRef.current) bloomRef.current.strength = 0.5 + Math.sin(t * 1.1) * 0.12;
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dims.width, dims.height, reduce, glowTexture]);

  const nodeThreeObject = useCallback(
    (node: any) => {
      const color = GROUP_COLOR[node.group] || "#cfeee6";
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture ?? undefined,
          color,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const s = 4.5 + Math.sqrt(node.val || 10) * 1.3;
      sprite.scale.set(s, s, 1);
      return sprite;
    },
    [glowTexture],
  );

  // Colour each constellation line by its source pillar.
  const linkColor = useCallback((link: any) => {
    const src = typeof link.source === "object" ? link.source : null;
    return GROUP_COLOR[src?.group] || "#bfe9dd";
  }, []);

  const handleNodeClick = useCallback(
    (node: any) => {
      const CLICK_DELAY = 320;
      const now = Date.now();
      const last = lastClickRef.current;
      if (last && last.nodeId === node.id && now - last.time < CLICK_DELAY) {
        lastClickRef.current = null;
        router.push(`/articles/${NODE_SLUG_MAP[node.id] || node.id}`);
      } else {
        lastClickRef.current = { nodeId: node.id, time: now };
        setSelectedNode((prev) => (prev === node.id ? null : node.id));
      }
    },
    [router],
  );

  const anchor = useMemo(
    () => computeSmartAnchor(mousePos.x, mousePos.y, viewportSize.width, viewportSize.height, 320, 160, 18),
    [mousePos, viewportSize],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[650px] border border-[#9ecdbf] bg-[#070f0d] overflow-hidden select-none"
    >
      {dims.width > 0 && (
        <ForceGraph3D
          ref={fgRef}
          width={dims.width}
          height={dims.height}
          graphData={graphData}
          backgroundColor="#070f0d"
          showNavInfo={false}
          controlType="orbit"
          nodeThreeObject={nodeThreeObject}
          nodeLabel={() => ""}
          nodeVal={(n: GraphNode) => n.val}
          linkColor={linkColor}
          linkWidth={0.5}
          linkOpacity={0.3}
          linkDirectionalParticles={0}
          warmupTicks={80}
          cooldownTicks={220}
          enableNodeDrag={false}
          onNodeHover={(node) => setHoverNode(node ? (node as GraphNode) : null)}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => {
            setSelectedNode(null);
            setHoverNode(null);
          }}
        />
      )}

      {/* Year mark, like the reference */}
      <div className="pointer-events-none absolute top-7 left-1/2 -translate-x-1/2 font-mono text-[13px] tracking-[0.7em] text-[#cfe8df]/70">
        {String(year)}
      </div>

      {/* Floating controls legend */}
      <div className="absolute bottom-4 left-4 pointer-events-none bg-[#070f0d]/85 border border-[#9ecdbf]/30 p-3 font-mono text-[9px] text-[#9ecdbf] leading-relaxed uppercase">
        <div className="text-[#46cfa8] font-bold border-b border-[#9ecdbf]/20 pb-1 mb-1">GALAKSI PENGETAHUAN</div>
        <div>[Klik Simpul]: Pilih / Kunci</div>
        <div>[Double Klik]: Buka Artikel</div>
        <div>[Tarik]: Putar Bola Dunia</div>
        <div>[Scroll]: Dekat / Jauh</div>
      </div>

      {/* Hover card */}
      {hoverNode && (
        <Portal>
          <div
            style={{ left: mousePos.x, top: mousePos.y, transform: anchor.transform }}
            className={`fixed z-[9999] w-[calc(100vw-32px)] sm:w-80 bg-[#070f0d] border border-[#9ecdbf] p-4 text-[#cfe8df] font-mono shadow-[0px_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-md select-none ${
              selectedNode === hoverNode.id ? "pointer-events-auto" : "pointer-events-none"
            } ${anchor.className}`}
          >
            <div className="border-b border-[#9ecdbf]/35 pb-2 mb-2.5">
              <h3 className="text-xs font-bold text-white leading-snug tracking-tight">{hoverNode.label}</h3>
            </div>
            <div className="mb-2">
              <span
                className={`inline-block px-2 py-0.5 text-[8px] font-bold border tracking-widest ${
                  hoverNode.group === "alam"
                    ? "text-[#46cfa8] border-[#46cfa8] bg-[#11241e]/40"
                    : hoverNode.group === "sejarah"
                      ? "text-[#d4af37] border-[#d4af37] bg-amber-950/20"
                      : "text-[#f97316] border-[#f97316] bg-orange-950/20"
                }`}
              >
                {GROUP_LABEL[hoverNode.group]}
              </span>
            </div>
            <p className="text-[10px] text-[#9ecdbf] leading-relaxed line-clamp-3 mb-3 italic">
              &ldquo;{hoverNode.synopsis}&rdquo;
            </p>
            <div className="border-t border-[#9ecdbf]/15 pt-2 flex justify-between items-center text-[9px] text-emerald-800 uppercase font-semibold">
              <span>PILAR: {hoverNode.group}</span>
              <span>BOBOT: {hoverNode.val}</span>
            </div>
            {selectedNode === hoverNode.id && (
              <div className="mt-3 pt-2 border-t border-[#9ecdbf]/35 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/articles/${NODE_SLUG_MAP[hoverNode.id] || hoverNode.id}`);
                  }}
                  className="pointer-events-auto px-3 py-1.5 bg-[#46cfa8] text-[#0a1411] hover:bg-[#cfe8df] transition-colors font-bold text-[9px] uppercase tracking-wider"
                >
                  Buka Artikel ↗
                </button>
              </div>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
}

export default GalaxyGraph;
