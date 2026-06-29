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
/*  NaLI Knowledge Galaxy.                                                     */
/*                                                                            */
/*  The knowledge graph rendered as a living 3D globe: every article orbits a  */
/*  pulsing neural core. It is always alive (slow auto-orbit + flowing link    */
/*  particles), breathing (the core and bloom pulse on a sine wave), and       */
/*  growing (the force sim accretes the sphere on load). Honours the NaLI navy */
/*  ink palette + pillar colours; falls back to a static frame for users who   */
/*  prefer reduced motion. Mobile keeps the text index (this is desktop-only). */
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

/** Soft radial-gradient sprite so each node reads as a glowing star, not a flat disc. */
function makeGlowTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.22, "rgba(255,255,255,0.85)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.25)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
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
  const coreRef = useRef<{ group: THREE.Group; ico: THREE.Mesh; inner: THREE.Mesh } | null>(null);
  const bloomRef = useRef<UnrealBloomPass | null>(null);

  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const glowTexture = useMemo(() => (typeof window === "undefined" ? null : makeGlowTexture()), []);

  // Track the container width (the 3D canvas needs explicit pixel dimensions).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDims({ width: el.clientWidth, height: 650 });
    });
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

    // 1. Forces: pull nodes onto a spherical shell (the "globe"), spread them out.
    const R = 150;
    let fNodes: Array<{ x: number; y: number; z: number; vx: number; vy: number; vz: number }> = [];
    const radial: any = (alpha: number) => {
      for (const n of fNodes) {
        const d = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1e-3;
        const k = ((R - d) / d) * alpha * 0.14;
        n.vx += n.x * k;
        n.vy += n.y * k;
        n.vz += n.z * k;
      }
    };
    radial.initialize = (ns: any[]) => {
      fNodes = ns;
    };
    fg.d3Force("radial", radial);
    fg.d3Force("charge")?.strength(-95);
    fg.d3Force("link")?.distance(34);

    // 2. Neural "brain" core at the centre of the globe.
    const group = new THREE.Group();
    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(15, 1),
      new THREE.MeshBasicMaterial({ color: 0x46cfa8, wireframe: true, transparent: true, opacity: 0.85 }),
    );
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(8, 0),
      new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.55 }),
    );
    group.add(ico, inner);
    if (glowTexture) {
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color: 0x46cfa8,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      glow.scale.set(58, 58, 1);
      group.add(glow);
    }
    scene.add(group);
    coreRef.current = { group, ico, inner };

    // 3. Faint starfield for galaxy depth.
    const N = 1300;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 620 + Math.random() * 900;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0x9ecdbf, size: 1.5, transparent: true, opacity: 0.45, sizeAttenuation: true }),
    );
    scene.add(stars);

    // 4. Bloom for the glow.
    try {
      const bloom = new UnrealBloomPass(new THREE.Vector2(dims.width, dims.height), 0.62, 0.4, 0.22);
      fg.postProcessingComposer().addPass(bloom);
      bloomRef.current = bloom;
    } catch {
      /* postprocessing unavailable; nodes still render, just without bloom */
    }

    // 5. Orbit controls + auto-rotate = "always alive".
    const controls = fg.controls();
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = !reduce;
      controls.autoRotateSpeed = 0.55;
      controls.minDistance = 90;
      controls.maxDistance = 900;
    }
    fg.cameraPosition({ x: 0, y: 40, z: 580 }, { x: 0, y: 0, z: 0 }, 0);

    // 6. Breathing loop: pulse the core scale + bloom strength on a sine wave.
    if (!reduce) {
      const animate = () => {
        const t = performance.now() / 1000;
        const c = coreRef.current;
        if (c) {
          c.group.scale.setScalar(1 + Math.sin(t * 1.4) * 0.09);
          c.ico.rotation.y += 0.003;
          c.ico.rotation.x += 0.0012;
          c.inner.rotation.y -= 0.006;
        }
        if (bloomRef.current) bloomRef.current.strength = 0.62 + Math.sin(t * 1.1) * 0.14;
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
      const color = GROUP_COLOR[node.group] || "#9ecdbf";
      const mat = new THREE.SpriteMaterial({
        map: glowTexture ?? undefined,
        color,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const s = 7 + Math.sqrt(node.val || 10) * 2.0;
      sprite.scale.set(s, s, 1);
      return sprite;
    },
    [glowTexture],
  );

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
      className="relative w-full h-[650px] border border-[#9ecdbf] bg-[#0a1411] overflow-hidden select-none"
    >
      {dims.width > 0 && (
        <ForceGraph3D
          ref={fgRef}
          width={dims.width}
          height={dims.height}
          graphData={graphData}
          backgroundColor="#0a1411"
          showNavInfo={false}
          controlType="orbit"
          nodeThreeObject={nodeThreeObject}
          nodeLabel={() => ""}
          nodeVal={(n: GraphNode) => n.val}
          linkColor={() => "rgba(158, 205, 191, 0.14)"}
          linkWidth={0.6}
          linkOpacity={0.35}
          linkDirectionalParticles={reduce ? 0 : 2}
          linkDirectionalParticleWidth={1.6}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleColor={() => "#46cfa8"}
          warmupTicks={60}
          cooldownTicks={200}
          enableNodeDrag={false}
          onNodeHover={(node) => setHoverNode(node ? (node as GraphNode) : null)}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => {
            setSelectedNode(null);
            setHoverNode(null);
          }}
        />
      )}

      {/* Floating controls legend */}
      <div className="absolute top-4 left-4 pointer-events-none bg-[#0a1411]/85 border border-[#9ecdbf]/30 p-3 font-mono text-[9px] text-[#9ecdbf] leading-relaxed uppercase">
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
            className={`fixed z-[9999] w-[calc(100vw-32px)] sm:w-80 bg-[#0a1411] border border-[#9ecdbf] p-4 text-[#cfe8df] font-mono shadow-[0px_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-md select-none ${
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
