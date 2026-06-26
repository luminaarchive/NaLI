"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import Portal from "./Portal";
import { graphData, type GraphNode, type GraphLink } from "./graph-data";
import { computeSmartAnchor } from "./computeSmartAnchor";
import { useRouter } from "next/navigation";

const GROUP_COLOR = {
  alam: "#46cfa8", // Emerald
  sejarah: "#d4af37", // Gold
  investigasi: "#f97316", // Alert Orange
};

const GROUP_LABEL = {
  alam: "Alam & Lanskap",
  sejarah: "Sejarah Nusantara",
  investigasi: "Liputan Investigasi",
};

const NODE_SLUG_MAP: Record<string, string> = {
  "benua-kehilangan-llsvp": "llsvp-theia-mantle",
  "lautan-canfield": "lautan-ungu-canfield",
  "black-browed-babbler": "black-browed-babbler-burung-hilang-172-tahun",
  "echidna-attenborough": "echidna-attenborough-papua-ditemukan-kembali",
  "lazarus-taxon": "lazarus-taxon-bagaimana-kepunahan-dinyatakan",
  "lebah-raksasa-wallace": "lebah-raksasa-wallace-megachile-pluto",
  "nepenthes-pitopangii": "nepenthes-pitopangii-kantong-semar-paling-langka-sulawesi",
  "seriwang-sangihe": "seriwang-sangihe-burung-biru-yang-nyaris-punah",
  "spesies-hilang-nusantara": "spesies-indonesia-yang-masih-hilang",
  "pesut-mahakam": "pesut-mahakam-populasi-terakhir",
  "anak-krakatau-2018": "anak-krakatau-2018-runtuhan-tsunami",
  "anoa": "anoa-sulawesi-fragmentasi-hutan",
  "babirusa": "babirusa-evolusi-aneh-wallacea",
  "cenderawasih": "cenderawasih-papua-perdagangan-habitat",
  "coelacanth-sulawesi": "coelacanth-sulawesi-fosil-hidup-laut-dalam",
  "dieng": "dieng-kawah-gas-bahaya-senyap",
  "harimau-bali": "harimau-bali-kepunahan-arsip",
  "harimau-jawa": "harimau-jawa-lazarus-species",
  "kelud": "kelud-danau-kawah-rekayasa-bahaya",
  "komodo": "komodo-predator-pulau-tekanan-konservasi",
  "krakatau-1883": "krakatau-1883-tsunami-arsip-global",
  "mangrove-indonesia": "mangrove-indonesia-karbon-biru",
  "merapi": "merapi-awan-panas-pemantauan",
  "orangutan-tapanuli": "orangutan-tapanuli-spesies-baru-habitat-terbatas",
  "tarsius": "tarsius-primata-malam-sulawesi",
  "terumbu-karang": "terumbu-karang-indonesia-iklim",
  "toba": "toba-supervolcano-perdebatan-dampak",
  "badak-jawa": "badak-jawa-benteng-terakhir",
  "tambora-1815": "tambora-1815-iklim-dunia",
  "api-biru-kawah-ijen": "api-biru-kawah-ijen",
  "maleo": "burung-maleo-sulawesi",
  "segara-anakan": "mangrove-segara-anakan",
  "selat-yang-hilang-laut-demak": "selat-muria-demak-bledug-kuwu",
  "homo-floresiensis": "homo-floresiensis-manusia-kerdil-flores",
  "prasasti-yupa": "prasasti-yupa-kutai-dokumen-tertua",
  "banda-neira": "banda-neira-pala-kekerasan-kolonial-arsip",
  "borobudur": "borobudur-arsip-restorasi-batu-air-pelestarian",
  "peta-lama-nusantara": "peta-lama-nusantara-kolonial-membaca-pulau-kuasa",
  "samalas-1257": "samalas-1257-babad-geologi",
  "kota-tua-jakarta": "batavia-kota-tua-jakarta",
  "ekspor-pasir-laut": "ekspor-pasir-laut-pp-26-2023",
  "deforestasi-kalimantan": "deforestasi-kalimantan-data-terbuka",
  "gambut-indonesia": "gambut-indonesia-karbon-api-kabut",
  "sampah-plastik-laut": "sampah-plastik-laut-indonesia-data-kebijakan",
  "jakarta-tenggelam": "jakarta-tenggelam-penurunan-tanah",
  "citarum": "citarum-sungai-tercemar",
};

export function ShadowGraph() {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  
  // Track consecutive clicks for custom double-click detection
  const lastClickRef = useRef<{ nodeId: string; time: number } | null>(null);

  // Track viewport dimensions for smart anchoring
  useEffect(() => {
    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Configure custom D3 forces for balanced clustering
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("charge").strength(-180);
      fgRef.current.d3Force("link").distance(85);
    }
  }, []);

  // Handle pointer coordinate tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, [handleMouseMove, handleTouchStart]);

  // Handle click & double-click interactions
  const handleNodeClick = useCallback(
    (node: any) => {
      const CLICK_DELAY = 300; // ms
      const now = Date.now();
      const lastClick = lastClickRef.current;
      
      if (lastClick && lastClick.nodeId === node.id && now - lastClick.time < CLICK_DELAY) {
        // Double-click action -> Redirect to the associated article details
        lastClickRef.current = null;
        const slug = NODE_SLUG_MAP[node.id] || node.id;
        router.push(`/articles/${slug}`);
      } else {
        // Single-click action -> Select / Lock node selection
        lastClickRef.current = { nodeId: node.id, time: now };
        setSelectedNode(selectedNode === node.id ? null : node.id);
      }
    },
    [selectedNode, router]
  );

  // Custom node drawing method in canvas
  const drawNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const radius = 4 + Math.sqrt(node.val || 10) * 0.85;
      const isSelected = selectedNode === node.id;
      const isHovered = hoverNode?.id === node.id;
      
      const baseColor = GROUP_COLOR[node.group as "alam" | "sejarah" | "investigasi"] || "#8a8f98";
      
      ctx.save();
      
      // Node Glow styling matching Archive Ink & Neo-Museum aesthetic
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = isSelected ? 18 : isHovered ? 12 : 5;
      
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fill();
      
      // Draw outer borders for focused states
      if (isSelected || isHovered) {
        ctx.strokeStyle = "#cfe8df";
        ctx.lineWidth = isSelected ? 2.5 / globalScale : 1.5 / globalScale;
        ctx.stroke();
      }
      
      ctx.restore();

      // Render monospaced text labels only when zoomed in past 1.5x scale
      if (globalScale > 1.5) {
        ctx.save();
        ctx.font = `${Math.max(4.5, 9 / globalScale)}px "IBM Plex Mono", var(--font-mono), ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Draw background pill for label readability
        const label = node.label.length > 25 ? node.label.slice(0, 24) + "…" : node.label;
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = "rgba(10, 20, 17, 0.9)";
        ctx.fillRect(
          node.x - textWidth / 2 - 2,
          node.y + radius + 3,
          textWidth + 4,
          Math.max(6, 12 / globalScale)
        );
        
        ctx.fillStyle = isSelected ? "#46cfa8" : "#cfe8df";
        ctx.fillText(label, node.x, node.y + radius + Math.max(5, 9 / globalScale));
        ctx.restore();
      }
    },
    [hoverNode, selectedNode]
  );

  const anchor = React.useMemo(() => {
    return computeSmartAnchor(
      mousePos.x,
      mousePos.y,
      viewportSize.width,
      viewportSize.height,
      320,
      160,
      18
    );
  }, [mousePos, viewportSize]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[650px] border border-[#9ecdbf] bg-[#0a1411] overflow-hidden select-none"
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={drawNode}
        linkWidth={1.5}
        linkColor={() => "rgba(158, 205, 191, 0.12)"}
        linkDirectionalParticles={3}
        linkDirectionalParticleWidth={1.8}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleColor={() => "#1e3a32"}
        onNodeHover={(node: any) => setHoverNode(node ? (node as GraphNode) : null)}
        onNodeClick={handleNodeClick}
        onBackgroundClick={() => {
          setSelectedNode(null);
          setHoverNode(null);
        }}
        cooldownTicks={120}
        enableNodeDrag={true}
        enablePanInteraction={true}
        enableZoomInteraction={true}
      />

      {/* Floating Instructions */}
      <div className="absolute top-4 left-4 pointer-events-none bg-[#0a1411]/85 border border-[#9ecdbf]/30 p-3 font-mono text-[9px] text-[#9ecdbf] leading-relaxed uppercase">
        <div className="text-[#46cfa8] font-bold border-b border-[#9ecdbf]/20 pb-1 mb-1">KONTROL GRAF</div>
        <div>[Klik Simpul]: Pilih / Kunci</div>
        <div>[Double Klik]: Buka Artikel</div>
        <div>[Tarik Kiri]: Geser Lanskap</div>
        <div>[Scroll]: Zoom Skala (Label muncul &gt; 1.5x)</div>
      </div>

      {/* React Portal Hover Card Tooltip */}
      {hoverNode && (
        <Portal>
          <div
            style={{
              left: mousePos.x,
              top: mousePos.y,
              transform: anchor.transform,
            }}
            className={`fixed z-[9999] w-[calc(100vw-32px)] sm:w-80 bg-[#0a1411] border border-[#9ecdbf] p-4 text-[#cfe8df] font-mono shadow-[0px_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-md select-none ${
              selectedNode === hoverNode.id ? "pointer-events-auto" : "pointer-events-none"
            } ${anchor.className}`}
          >
            <div className="border-b border-[#9ecdbf]/35 pb-2 mb-2.5">
              <h3 className="text-xs font-bold text-white leading-snug tracking-tight">
                {hoverNode.label}
              </h3>
            </div>
            
            <div className="mb-2">
              <span className={`inline-block px-2 py-0.5 text-[8px] font-bold border rounded-none tracking-widest ${
                hoverNode.group === "alam"
                  ? "text-[#46cfa8] border-[#46cfa8] bg-[#11241e]/40"
                  : hoverNode.group === "sejarah"
                  ? "text-[#d4af37] border-[#d4af37] bg-amber-950/20"
                  : "text-[#f97316] border-[#f97316] bg-orange-950/20"
              }`}>
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
                    const slug = NODE_SLUG_MAP[hoverNode.id] || hoverNode.id;
                    router.push(`/articles/${slug}`);
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

export default ShadowGraph;
