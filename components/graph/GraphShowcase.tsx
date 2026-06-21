"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GraphNode, GraphNodeType, KnowledgeGraph } from "@/lib/graph";

/** Bright accents tuned to read on the deep-navy showcase panel. */
const CATEGORY_COLOR: Record<string, string> = {
  alam: "#34D399",
  sejarah: "#E0A45E",
  investigasi: "#FB923C",
  "catatan-lapangan": "#A3C76D",
};
const TYPE_COLOR: Record<GraphNodeType, string> = {
  artikel: "#34D399",
  sumber: "#9AA6B2",
  seri: "#B79CE6",
  topik: "#6FC7E8",
};

const LEGEND: { color: string; label: string }[] = [
  { color: CATEGORY_COLOR.alam, label: "Alam" },
  { color: CATEGORY_COLOR.sejarah, label: "Sejarah" },
  { color: CATEGORY_COLOR.investigasi, label: "Investigasi" },
  { color: TYPE_COLOR.seri, label: "Seri" },
  { color: TYPE_COLOR.topik, label: "Topik" },
];

function colorOf(n: GraphNode): string {
  if (n.type === "artikel") return CATEGORY_COLOR[n.category ?? ""] ?? TYPE_COLOR.artikel;
  return TYPE_COLOR[n.type];
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface LabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  cx: number;
  cy: number;
  focused: boolean;
}

/**
 * A self-organising knowledge web for the landing page. It settles with a
 * force layout, then keeps breathing with a slow rigid rotation so it always
 * looks alive without burning the CPU: the heavy O(n^2) physics only runs while
 * settling, the idle loop is O(n), it pauses entirely when scrolled off-screen,
 * and it draws without per-node shadow blur. Hovering a node lights up its
 * direct connections; clicking opens the page behind it.
 */
export function GraphShowcase({ graph }: { graph: KnowledgeGraph }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);

    let W = 0;
    let H = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();

    const nodes: SimNode[] = graph.nodes.map((n, i) => {
      const a = (i / graph.nodes.length) * Math.PI * 2;
      const r = 80 + Math.random() * 140;
      return { ...n, x: W / 2 + Math.cos(a) * r, y: H / 2 + Math.sin(a) * r, vx: 0, vy: 0 };
    });
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const links = graph.edges
      .map((e) => ({ s: byId.get(e.source)!, t: byId.get(e.target)! }))
      .filter((l) => l.s && l.t);

    const adj = new Map<string, Set<string>>();
    for (const l of links) {
      (adj.get(l.s.id) ?? adj.set(l.s.id, new Set()).get(l.s.id)!).add(l.t.id);
      (adj.get(l.t.id) ?? adj.set(l.t.id, new Set()).get(l.t.id)!).add(l.s.id);
    }

    const radius = (n: SimNode) => 3.5 + Math.min(9, n.degree ?? 1);
    const maxDeg = Math.max(1, ...nodes.map((n) => n.degree ?? 1));
    const hubThreshold = Math.max(4, Math.round(maxDeg * 0.45));
    const maxIdleLabels = mobile ? 4 : 7;
    // the hubs we would label when nothing is hovered, highest degree first
    const idleHubs = nodes
      .filter((n) => (n.degree ?? 0) >= hubThreshold)
      .sort((a, b) => (b.degree ?? 0) - (a.degree ?? 0))
      .slice(0, maxIdleLabels);

    let dragging: SimNode | null = null;
    let hover: SimNode | null = null;
    let frame = 0;
    let energizeUntil = reduce ? 0 : 240; // frames of active physics

    const physics = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          const d2 = dx * dx + dy * dy || 0.01;
          const f = 1700 / d2;
          const d = Math.sqrt(d2);
          dx /= d;
          dy /= d;
          a.vx += dx * f;
          a.vy += dy * f;
          b.vx -= dx * f;
          b.vy -= dy * f;
        }
      }
      for (const l of links) {
        let dx = l.t.x - l.s.x;
        let dy = l.t.y - l.s.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - 78) * 0.018;
        dx /= d;
        dy /= d;
        l.s.vx += dx * f;
        l.s.vy += dy * f;
        l.t.vx -= dx * f;
        l.t.vy -= dy * f;
      }
      const cx = W / 2;
      const cy = H / 2;
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.004;
        n.vy += (cy - n.y) * 0.004;
        if (n === dragging) {
          n.vx = 0;
          n.vy = 0;
          continue;
        }
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
        const pad = 16;
        n.x = Math.max(pad, Math.min(W - pad, n.x));
        n.y = Math.max(pad, Math.min(H - pad, n.y));
      }
    };

    // cheap O(n) idle motion: a slow rigid rotation about the centroid
    const idleMotion = () => {
      let mx = 0;
      let my = 0;
      for (const n of nodes) {
        mx += n.x;
        my += n.y;
      }
      mx /= nodes.length;
      my /= nodes.length;
      const ang = 0.0009;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      for (const n of nodes) {
        if (n === dragging) continue;
        const px = n.x - mx;
        const py = n.y - my;
        n.x = mx + px * cos - py * sin;
        n.y = my + px * sin + py * cos;
      }
    };

    const placeLabels = (focusId: string | undefined, lit: Set<string> | null): LabelBox[] => {
      ctx.font = "10px ui-monospace, SFMono-Regular, monospace";
      const candidates: SimNode[] = focusId
        ? nodes.filter((n) => n.id === focusId || (lit ? lit.has(n.id) : false))
        : idleHubs;
      const placed: LabelBox[] = [];
      for (const n of candidates) {
        const text = n.label.length > 26 ? n.label.slice(0, 25) + "…" : n.label;
        const w = ctx.measureText(text).width;
        const r = radius(n);
        const x = n.x + r + 5;
        const y = n.y;
        const box: LabelBox = { x, y: y - 7, w, h: 14, text, cx: x, cy: y, focused: n.id === focusId };
        const clash = placed.some(
          (p) => !(box.x > p.x + p.w || box.x + box.w < p.x || box.y > p.y + p.h || box.y + box.h < p.y),
        );
        if (clash) continue;
        if (x + w > W - 4) box.cx = n.x - r - 5 - w; // flip leftwards near the edge
        placed.push(box);
      }
      return placed;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const focusId = (dragging ?? hover)?.id;
      const lit = focusId ? adj.get(focusId) ?? new Set<string>() : null;

      ctx.lineWidth = 1;
      for (const l of links) {
        const active = focusId && (l.s.id === focusId || l.t.id === focusId);
        ctx.strokeStyle = active
          ? "rgba(190,216,238,0.55)"
          : focusId
            ? "rgba(150,180,210,0.05)"
            : "rgba(150,180,210,0.14)";
        ctx.beginPath();
        ctx.moveTo(l.s.x, l.s.y);
        ctx.lineTo(l.t.x, l.t.y);
        ctx.stroke();
      }

      for (const n of nodes) {
        const dim = focusId && n.id !== focusId && !(lit && lit.has(n.id));
        const r = radius(n);
        const col = colorOf(n);
        if (!dim) {
          // soft halo, far cheaper than ctx.shadowBlur
          ctx.globalAlpha = 0.16;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = dim ? 0.22 : 1;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (n.id === focusId) {
          ctx.strokeStyle = "rgba(255,255,255,0.85)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // tidy, non-overlapping labels
      ctx.font = "10px ui-monospace, SFMono-Regular, monospace";
      ctx.textBaseline = "middle";
      for (const lb of placeLabels(focusId, lit)) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(8,35,56,0.9)";
        ctx.strokeText(lb.text, lb.cx, lb.cy);
        ctx.fillStyle = lb.focused ? "#EAF2FB" : "rgba(220,232,245,0.78)";
        ctx.fillText(lb.text, lb.cx, lb.cy);
      }
    };

    let raf = 0;
    let onScreen = true;
    const tick = () => {
      const energized = frame < energizeUntil;
      if (energized) physics();
      else if (!reduce) idleMotion();
      draw();
      frame++;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    if (reduce) {
      for (let i = 0; i < 240; i++) physics();
      draw();
    } else {
      start();
    }

    // interaction
    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const hit = (x: number, y: number) =>
      nodes.find((n) => (n.x - x) ** 2 + (n.y - y) ** 2 <= (radius(n) + 6) ** 2) ?? null;

    let downAt = { x: 0, y: 0 };
    const reenergize = () => {
      energizeUntil = frame + 110;
      if (reduce) draw();
    };
    const onDown = (e: PointerEvent) => {
      const { x, y } = pos(e);
      downAt = { x, y };
      const n = hit(x, y);
      if (n) {
        dragging = n;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      const { x, y } = pos(e);
      if (dragging) {
        dragging.x = Math.max(16, Math.min(W - 16, x));
        dragging.y = Math.max(16, Math.min(H - 16, y));
        reenergize();
        return;
      }
      const h = hit(x, y);
      if (h !== hover) {
        hover = h;
        canvas.style.cursor = hover ? "pointer" : "default";
        if (reduce) draw();
      }
    };
    const onUp = (e: PointerEvent) => {
      const { x, y } = pos(e);
      const moved = Math.hypot(x - downAt.x, y - downAt.y);
      const n = hit(x, y);
      dragging = null;
      if (n && n.href && moved < 5) router.push(n.href);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", () => {
      if (hover) {
        hover = null;
        canvas.style.cursor = "default";
        if (reduce) draw();
      }
    });

    // pause when off-screen or the tab is hidden
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (!reduce) (onScreen ? start : stop)();
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);
    const onVis = () => {
      if (reduce) return;
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVis);

    const ro = new ResizeObserver(() => {
      resize();
      reenergize();
      if (reduce) draw();
    });
    ro.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-navy-deep shadow-[0_30px_80px_-30px_rgba(8,35,56,0.7)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(52,211,153,0.10), transparent 70%)",
        }}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            Peta Eksplorasi
          </p>
          <p className="mt-1 font-display text-lg font-medium tracking-tight text-white">
            Jaringan pengetahuan yang saling terhubung
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          {graph.nodes.length} simpul · {graph.edges.length} relasi
        </span>
      </div>

      <canvas
        ref={canvasRef}
        className="block h-[360px] w-full touch-none md:h-[520px]"
        aria-label="Graf jaringan pengetahuan NaLI. Menghubungkan artikel, seri, dan topik."
      />

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/55">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
        <Link
          href="/peta-eksplorasi"
          className="group inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 transition-colors hover:text-white"
        >
          Buka peta lengkap
          <ArrowUpRight size={13} strokeWidth={1.6} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <p className="relative px-5 pb-4 text-left font-mono text-[10px] tracking-wide text-white/35">
        Arahkan kursor untuk menyalakan tautannya, seret untuk menata, klik untuk membuka.
      </p>
    </div>
  );
}
