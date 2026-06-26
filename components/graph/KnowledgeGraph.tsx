"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { GraphNode, GraphNodeType, KnowledgeGraph } from "@/lib/graph";
import { AIChatPanel } from "./AIChatPanel";

const TYPE_COLOR: Record<GraphNodeType, string> = {
  artikel: "#2f9e6e", // overridden per-category below
  sumber: "#8a8f98",
  seri: "#7a5bb0",
  topik: "#b08a3b",
};
const CATEGORY_COLOR: Record<string, string> = {
  alam: "#2f9e6e",
  sejarah: "#3b6fb0",
  investigasi: "#c9772f",
  "catatan-lapangan": "#6b8f2f",
};
const TYPE_LABEL: Record<GraphNodeType, string> = {
  artikel: "Artikel",
  sumber: "Sumber",
  seri: "Seri",
  topik: "Topik",
};

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

export function KnowledgeGraph({ graph }: { graph: KnowledgeGraph }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const selectedRef = useRef<string | undefined>(undefined);
  const select = useCallback((n: GraphNode | null) => {
    selectedRef.current = n?.id;
    setSelected(n);
  }, []);
  const [filterCat, setFilterCat] = useState<string>("semua");
  const [filterType, setFilterType] = useState<GraphNodeType | "semua">("semua");
  const [filterTag, setFilterTag] = useState<string>("semua");
  const [panelTab, setPanelTab] = useState<"info" | "ai">("info");

  // filtered subgraph
  const sub = useMemo(() => {
    const keepNode = (n: GraphNode) => {
      if (filterType !== "semua" && n.type !== filterType) return false;
      if (filterCat !== "semua") {
        // category filter keeps matching articles + their connected nodes
        if (n.type === "artikel" && n.category !== filterCat) return false;
      }
      if (filterTag !== "semua") {
        if (n.type === "artikel" && !(n.tags ?? []).includes(filterTag)) return false;
        if (n.type === "topik" && n.label !== filterTag) return false;
      }
      return true;
    };
    let nodes = graph.nodes.filter(keepNode);
    // when filtering by category/tag, also include non-article nodes linked to kept articles
    if (filterCat !== "semua" || filterTag !== "semua") {
      const keptArticleIds = new Set(nodes.filter((n) => n.type === "artikel").map((n) => n.id));
      const linked = new Set<string>();
      for (const e of graph.edges) {
        if (keptArticleIds.has(e.source)) linked.add(e.target);
        if (keptArticleIds.has(e.target)) linked.add(e.source);
      }
      const byId = new Map(graph.nodes.map((n) => [n.id, n]));
      for (const id of linked) {
        const n = byId.get(id);
        if (n && !nodes.includes(n) && (filterType === "semua" || n.type === filterType)) nodes.push(n);
      }
    }
    const ids = new Set(nodes.map((n) => n.id));
    const edges = graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
    return { nodes, edges };
  }, [graph, filterCat, filterType, filterTag]);

  // force simulation + render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dark = document.documentElement.classList.contains("dark");
    const edgeColor = dark ? "rgba(160,200,190,0.18)" : "rgba(20,40,34,0.14)";
    const labelColor = dark ? "#cfe8df" : "#1c1c1c";

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    const W = () => canvas.width / dpr;
    const H = () => canvas.height / dpr;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes: SimNode[] = sub.nodes.map((n, i) => ({
      ...n,
      x: W() / 2 + Math.cos((i / sub.nodes.length) * Math.PI * 2) * 120 + (Math.random() - 0.5) * 40,
      y: H() / 2 + Math.sin((i / sub.nodes.length) * Math.PI * 2) * 120 + (Math.random() - 0.5) * 40,
      vx: 0,
      vy: 0,
    }));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const links = sub.edges
      .map((e) => ({ s: byId.get(e.source)!, t: byId.get(e.target)! }))
      .filter((l) => l.s && l.t);
    const radius = (n: SimNode) => 4 + Math.min(8, (n.degree ?? 1));
    // only label the genuine hubs so dense graphs stay readable
    const maxDeg = Math.max(1, ...nodes.map((n) => n.degree ?? 1));
    const hubThreshold = Math.max(5, Math.round(maxDeg * 0.5));
    const haloColor = dark ? "rgba(8,18,15,0.85)" : "rgba(255,255,255,0.85)";

    let dragging: SimNode | null = null;
    let hover: SimNode | null = null;

    const tick = () => {
      // repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy || 0.01;
          const f = 1400 / d2;
          const d = Math.sqrt(d2);
          dx /= d;
          dy /= d;
          a.vx += dx * f;
          a.vy += dy * f;
          b.vx -= dx * f;
          b.vy -= dy * f;
        }
      }
      // springs
      for (const l of links) {
        let dx = l.t.x - l.s.x;
        let dy = l.t.y - l.s.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - 70) * 0.02;
        dx /= d;
        dy /= d;
        l.s.vx += dx * f;
        l.s.vy += dy * f;
        l.t.vx -= dx * f;
        l.t.vy -= dy * f;
      }
      // centering + damping
      const cx = W() / 2;
      const cy = H() / 2;
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.0015;
        n.vy += (cy - n.y) * 0.0015;
        if (n === dragging) {
          n.vx = 0;
          n.vy = 0;
          continue;
        }
        n.vx *= 0.86;
        n.vy *= 0.86;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(12, Math.min(W() - 12, n.x));
        n.y = Math.max(12, Math.min(H() - 12, n.y));
      }
    };

    const draw = () => {
      const selId = selectedRef.current;
      const neighbors = new Set<string>();
      if (selId) {
        for (const l of links) {
          if (l.s.id === selId) neighbors.add(l.t.id);
          if (l.t.id === selId) neighbors.add(l.s.id);
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W(), H());
      // edges
      for (const l of links) {
        const active = !selId || l.s.id === selId || l.t.id === selId;
        ctx.strokeStyle = active ? edgeColor : "rgba(120,120,120,0.05)";
        ctx.beginPath();
        ctx.moveTo(l.s.x, l.s.y);
        ctx.lineTo(l.t.x, l.t.y);
        ctx.stroke();
      }
      // nodes
      for (const n of nodes) {
        const dim = selId && n.id !== selId && !neighbors.has(n.id);
        ctx.globalAlpha = dim ? 0.25 : 1;
        ctx.fillStyle = colorOf(n);
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius(n), 0, Math.PI * 2);
        ctx.fill();
        if (n.id === selId) {
          ctx.strokeStyle = labelColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        // labels for hubs / hovered / selected
        if (n === hover || n.id === selId || (n.degree ?? 0) >= hubThreshold) {
          ctx.globalAlpha = dim ? 0.35 : 1;
          ctx.font = "10px ui-monospace, monospace";
          const label = n.label.length > 28 ? n.label.slice(0, 27) + "…" : n.label;
          const tx = n.x + radius(n) + 4;
          const ty = n.y + 3;
          ctx.lineWidth = 3;
          ctx.strokeStyle = haloColor;
          ctx.strokeText(label, tx, ty);
          ctx.fillStyle = labelColor;
          ctx.fillText(label, tx, ty);
        }
        ctx.globalAlpha = 1;
      }
    };

    let raf = 0;
    let ticks = 0;
    const loop = () => {
      if (!dragging && ticks < 320 && !reduce) {
        tick();
        ticks++;
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    if (reduce) {
      for (let i = 0; i < 320; i++) tick();
    }
    loop();

    // interaction
    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const hit = (x: number, y: number) =>
      nodes.find((n) => (n.x - x) ** 2 + (n.y - y) ** 2 <= (radius(n) + 4) ** 2) ?? null;

    const onDown = (e: PointerEvent) => {
      const { x, y } = pos(e);
      const n = hit(x, y);
      if (n) {
        dragging = n;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      const { x, y } = pos(e);
      if (dragging) {
        dragging.x = x;
        dragging.y = y;
        return;
      }
      hover = hit(x, y);
      canvas.style.cursor = hover ? "pointer" : "default";
    };
    const onUp = (e: PointerEvent) => {
      const { x, y } = pos(e);
      const n = hit(x, y);
      if (n) select(n);
      dragging = null;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", resize);
    };
  }, [sub, select]);

  const cats = ["semua", "alam", "sejarah", "investigasi"];
  const types: (GraphNodeType | "semua")[] = ["semua", "artikel", "sumber", "seri", "topik"];

  return (
    <div className="hidden md:block">
      {/* filters */}
      <div className="flex flex-wrap items-center gap-3 border border-dashed border-ink/50 bg-paper/80 p-3">
        <FilterSelect label="Kategori" value={filterCat} onChange={setFilterCat} options={cats} />
        <FilterSelect
          label="Tipe"
          value={filterType}
          onChange={(v) => setFilterType(v as GraphNodeType | "semua")}
          options={types}
        />
        <FilterSelect
          label="Topik"
          value={filterTag}
          onChange={setFilterTag}
          options={["semua", ...graph.tags]}
        />
        <span className="ml-auto font-mono text-[0.66rem] uppercase tracking-[0.12em] text-gray">
          {sub.nodes.length} simpul · {sub.edges.length} relasi
        </span>
      </div>

      <div className="relative mt-3 grid gap-3 lg:grid-cols-[1fr_300px]">
        <div className="relative border border-dashed border-ink/50 bg-paper/60">
          <canvas ref={canvasRef} className="h-[560px] w-full touch-none" />
          {/* legend */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-gray">
            <Legend color={CATEGORY_COLOR.alam} label="Alam" />
            <Legend color={CATEGORY_COLOR.sejarah} label="Sejarah" />
            <Legend color={CATEGORY_COLOR.investigasi} label="Investigasi" />
            <Legend color={TYPE_COLOR.sumber} label="Sumber" />
            <Legend color={TYPE_COLOR.seri} label="Seri" />
            <Legend color={TYPE_COLOR.topik} label="Topik" />
          </div>
        </div>

        {/* side panel */}
        <aside className="flex flex-col border border-dashed border-ink/50 bg-paper p-4" style={{ minHeight: "480px" }}>
          {selected ? (
            <>
              {/* Tab bar */}
              <div className="mb-3 flex gap-0 border-b border-dashed border-ink/40">
                <button
                  type="button"
                  onClick={() => setPanelTab("info")}
                  className={`px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] transition-colors ${
                    panelTab === "info"
                      ? "border-b-2 border-ink text-ink"
                      : "text-gray hover:text-ink-charcoal"
                  }`}
                >
                  Info
                </button>
                <button
                  type="button"
                  onClick={() => setPanelTab("ai")}
                  className={`px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] transition-colors ${
                    panelTab === "ai"
                      ? "border-b-2 border-ink text-ink"
                      : "text-gray hover:text-ink-charcoal"
                  }`}
                >
                  Tanya AI
                </button>
              </div>

              {panelTab === "info" ? (
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-deep">
                    {TYPE_LABEL[selected.type]}
                    {selected.category ? ` · ${selected.category}` : ""}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-bold uppercase leading-snug text-ink">
                    {selected.label}
                  </h3>
                  {selected.excerpt && (
                    <p className="mt-2 font-mono text-[0.74rem] leading-relaxed text-gray">
                      {selected.excerpt}
                    </p>
                  )}
                  {selected.href && (
                    <Link
                      href={selected.href}
                      className="mt-4 inline-block border border-ink bg-ink px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
                    >
                      Buka halaman →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex-1">
                  <AIChatPanel
                    nodeSlug={selected.id.replace(/^[a-z]+:/, "")}
                    nodeType={selected.type}
                    nodeLabel={selected.label}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="font-mono text-[0.74rem] leading-relaxed text-gray">
              Klik sebuah simpul untuk melihat ringkasan dan tautannya. Seret untuk menata,
              gunakan filter untuk menyaring.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-gray">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-dashed border-ink/50 bg-paper px-2 py-1 text-ink"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
