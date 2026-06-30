"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  LabCharacter , a pixel-art operator that mirrors the harvest machine's      */
/*  real state, polled from /api/lab/status every 30s.                         */
/*                                                                            */
/*    working  : a harvest finished in the last 30 min , typing at the rig.     */
/*    idle     : last run 30 min .. 24h ago , coffee break.                     */
/*    sleeping : no run for > 24h (or none ever) , asleep with zzz.             */
/*                                                                            */
/*  Original voxel-style art (NOT Minecraft assets). Animations respect        */
/*  prefers-reduced-motion. ?karakter=working|idle|sleeping forces a state for */
/*  preview/screenshots without changing any data.                            */
/* -------------------------------------------------------------------------- */

type LabState = "working" | "idle" | "sleeping";

interface LabStatus {
  state: LabState;
  lastRunAt: string | null;
  minutesSinceLastRun: number | null;
  lastStatus: string | null;
  activeSources: string[];
  totalRuns: number;
  successRuns: number;
  leadsTracked: number;
  nextScheduledRun: string;
}

const STATE_META: Record<LabState, { lamp: string; label: string; sky: string }> = {
  working: { lamp: "#46cfa8", label: "MESIN SEDANG BEKERJA", sky: "#0a1f1a" },
  idle: { lamp: "#e6b53c", label: "MESIN ISTIRAHAT", sky: "#1a160d" },
  sleeping: { lamp: "#c0506a", label: "MESIN TIDUR", sky: "#0a0e1a" },
};

const DIALOGUE: Record<LabState, string[]> = {
  working: [
    "Lagi nyisir GBIF sama iNaturalist nih...",
    "Zaglossus masih sunyi 65 tahun. Catat.",
    "Data masuk, jangan diganggu dulu ya.",
    "Satu lead lagi, satu lead lagi...",
  ],
  idle: [
    "Ngopi dulu, harvest berikutnya Senin.",
    "Sikatan Rueck belum nongol juga.",
    "Istirahat bukan berarti berhenti mikir.",
    "Kalau ada bukti baru, aku yang pertama tahu.",
  ],
  sleeping: [
    "Zzz... biawak Zug... zzz...",
    "Bangunin aku kalau cron jalan ya.",
    "Mimpi ketemu coelacanth lagi...",
  ],
};

function ago(iso: string | null): string {
  if (!iso) return "belum pernah";
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "barusan";
  if (mins < 60) return `${mins} menit lalu`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

function untilNext(iso: string): string {
  const mins = Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 60000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  if (d > 0) return `${d} hari ${h} jam lagi`;
  if (h > 0) return `${h} jam lagi`;
  return `${mins} menit lagi`;
}

export function LabCharacter() {
  const [status, setStatus] = useState<LabStatus | null>(null);
  const [forced, setForced] = useState<LabState | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());
  const [, force] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ?karakter=working|idle|sleeping forces the visual (preview/screenshots only).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("karakter");
    if (p === "working" || p === "idle" || p === "sleeping") setForced(p);
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/lab/status", { cache: "no-store" });
      if (!r.ok) return;
      const j = (await r.json()) as LabStatus;
      setStatus(j);
      setUpdatedAt(Date.now());
    } catch {
      /* keep last known */
    }
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 30000);
    const tick = setInterval(() => force((n) => n + 1), 1000); // refresh "ago" labels
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  const state: LabState = forced ?? status?.state ?? "sleeping";
  const meta = STATE_META[state];

  const speak = useCallback(() => {
    const lines = DIALOGUE[state];
    setBubble(lines[Math.floor(Math.random() * lines.length)]);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 3500);
  }, [state]);

  const sinceUpdate = Math.floor((Date.now() - updatedAt) / 1000);

  return (
    <div className="border border-dashed border-ink/40 bg-[#070d12] p-4 sm:p-5">
      <style>{css}</style>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* the scene */}
        <button
          type="button"
          onClick={speak}
          aria-label="Sapa operator Lab"
          className="lc-stage relative mx-auto shrink-0 cursor-pointer"
          style={{ width: 220, height: 170 }}
        >
          {bubble && <div className="lc-bubble">{bubble}</div>}
          <Scene state={state} lamp={meta.lamp} sky={meta.sky} />
        </button>

        {/* the readout */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="lc-dot inline-block h-2.5 w-2.5"
              style={{ background: meta.lamp, boxShadow: `0 0 8px ${meta.lamp}` }}
              aria-hidden
            />
            <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-paper">
              {state === "working" ? "\u{1F525} " : state === "idle" ? "☕ " : "\u{1F4A4} "}
              {meta.label}
            </p>
          </div>

          <p className="mt-2 font-mono text-[0.74rem] leading-relaxed text-[#9ecdbf]">
            {state === "working" && (
              <>Memanen dari {status?.activeSources.length ?? 0} sumber. Panen terakhir {ago(status?.lastRunAt ?? null)}.</>
            )}
            {state === "idle" && <>Panen terakhir {ago(status?.lastRunAt ?? null)}. Sedang menunggu jadwal berikutnya.</>}
            {state === "sleeping" && <>Tidak ada panen sejak {ago(status?.lastRunAt ?? null)}.</>}
          </p>

          {status && status.activeSources.length > 0 && (
            <p className="mt-2 font-mono text-[0.66rem] leading-relaxed text-[#6f9a8e]">
              Sumber aktif: {status.activeSources.join(" · ")}
            </p>
          )}

          <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-[0.62rem] text-[#6f9a8e]">
            <div className="border border-dashed border-[#2a3a34] p-2">
              <dt className="uppercase tracking-wider">Lead</dt>
              <dd className="mt-0.5 text-base text-paper">{status?.leadsTracked ?? "-"}</dd>
            </div>
            <div className="border border-dashed border-[#2a3a34] p-2">
              <dt className="uppercase tracking-wider">Run sukses</dt>
              <dd className="mt-0.5 text-base text-paper">
                {status ? `${status.successRuns}/${status.totalRuns}` : "-"}
              </dd>
            </div>
            <div className="border border-dashed border-[#2a3a34] p-2">
              <dt className="uppercase tracking-wider">Panen berikutnya</dt>
              <dd className="mt-0.5 text-[0.72rem] leading-tight text-paper">
                {status ? untilNext(status.nextScheduledRun) : "-"}
              </dd>
            </div>
          </dl>

          <p className="mt-2 font-mono text-[0.58rem] text-[#4f6b62]">
            Diperbarui {sinceUpdate < 2 ? "barusan" : `${sinceUpdate} detik lalu`} · polling 30s · klik operator untuk menyapa
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----- the pixel scene (original voxel-style art) ------------------------- */

function Scene({ state, lamp, sky }: { state: LabState; lamp: string; sky: string }) {
  return (
    <svg viewBox="0 0 220 170" width="220" height="170" style={{ shapeRendering: "crispEdges" }} aria-hidden>
      {/* room */}
      <rect x="0" y="0" width="220" height="140" fill={sky} />
      <rect x="0" y="140" width="220" height="30" fill="#05080b" />
      {/* poster: a tiny "lost species" silhouette in a frame */}
      <rect x="18" y="20" width="40" height="42" fill="#0d161d" stroke="#243039" />
      <rect x="30" y="34" width="16" height="10" fill={lamp} opacity="0.5" />
      <rect x="36" y="30" width="4" height="6" fill={lamp} opacity="0.5" />
      <rect x="26" y="44" width="6" height="6" fill={lamp} opacity="0.5" />
      <rect x="44" y="44" width="6" height="6" fill={lamp} opacity="0.5" />
      {/* status lamp */}
      <g className="lc-lamp">
        <rect x="196" y="14" width="10" height="10" fill={lamp} />
        <rect x="199" y="8" width="4" height="6" fill="#1b2a24" />
      </g>

      {state === "sleeping" ? <SleepScene lamp={lamp} /> : <DeskScene state={state} lamp={lamp} />}
    </svg>
  );
}

function DeskScene({ state, lamp }: { state: LabState; lamp: string }) {
  const working = state === "working";
  return (
    <g>
      {/* desk */}
      <rect x="96" y="104" width="116" height="10" fill="#5a3d23" />
      <rect x="96" y="114" width="10" height="26" fill="#432d18" />
      <rect x="202" y="114" width="10" height="26" fill="#432d18" />
      {/* monitor */}
      <rect x="120" y="64" width="74" height="44" fill="#10202b" stroke="#26323b" />
      <rect x="128" y="72" width="58" height="28" fill="#06120d" />
      {/* monitor data bars */}
      <g className={working ? "lc-data" : ""}>
        <rect x="132" y="88" width="6" height="8" fill={lamp} />
        <rect x="142" y="84" width="6" height="12" fill={lamp} />
        <rect x="152" y="90" width="6" height="6" fill={lamp} />
        <rect x="162" y="80" width="6" height="16" fill={lamp} />
        <rect x="172" y="86" width="6" height="10" fill={lamp} />
      </g>
      <rect x="152" y="108" width="10" height="6" fill="#26323b" />

      {/* chair back */}
      <rect x="40" y="86" width="10" height="40" fill="#1c2a23" />
      {/* character */}
      <g className={working ? "" : "lc-lean"}>
        {/* body / shirt (navy) */}
        <rect x="50" y="92" width="30" height="30" fill="#0E3A5C" />
        <rect x="50" y="92" width="30" height="6" fill="#2dd4a7" opacity="0.8" />
        {/* head */}
        <rect x="54" y="64" width="24" height="26" fill="#e8b98b" />
        {/* hair */}
        <rect x="54" y="64" width="24" height="8" fill="#2a1d12" />
        <rect x="54" y="64" width="6" height="16" fill="#2a1d12" />
        {/* eyes */}
        <rect x="62" y="76" width="3" height="4" fill="#101010" />
        <rect x="70" y="76" width="3" height="4" fill="#101010" />
        {/* arms toward desk; bob when typing */}
        <g className={working ? "lc-type" : ""}>
          <rect x="78" y="98" width="22" height="7" fill="#e8b98b" />
          <rect x="80" y="100" width="8" height="7" fill="#0E3A5C" />
        </g>
      </g>

      {/* idle: coffee mug + steam */}
      {state === "idle" && (
        <g>
          <rect x="92" y="96" width="14" height="12" fill="#d8d2c4" />
          <rect x="106" y="99" width="5" height="6" fill="#d8d2c4" />
          <rect x="94" y="98" width="10" height="4" fill="#5a3a22" />
          <g className="lc-steam">
            <rect x="96" y="86" width="3" height="6" fill="#cfe8df" opacity="0.7" />
            <rect x="100" y="82" width="3" height="6" fill="#cfe8df" opacity="0.6" />
          </g>
        </g>
      )}
    </g>
  );
}

function SleepScene({ lamp }: { lamp: string }) {
  return (
    <g>
      {/* bed */}
      <rect x="48" y="100" width="130" height="12" fill="#3a2a1a" />
      <rect x="48" y="92" width="14" height="20" fill="#4a3522" />
      <rect x="164" y="96" width="14" height="16" fill="#4a3522" />
      {/* pillow */}
      <rect x="56" y="92" width="26" height="12" fill="#d8d2c4" />
      {/* head on pillow */}
      <rect x="60" y="78" width="22" height="20" fill="#e8b98b" />
      <rect x="60" y="78" width="22" height="7" fill="#2a1d12" />
      {/* closed eyes */}
      <rect x="66" y="88" width="5" height="2" fill="#101010" />
      <rect x="74" y="88" width="5" height="2" fill="#101010" />
      {/* blanket , breathes */}
      <g className="lc-breathe" style={{ transformOrigin: "120px 104px" }}>
        <rect x="82" y="96" width="92" height="16" fill="#0E3A5C" />
        <rect x="82" y="96" width="92" height="4" fill="#2dd4a7" opacity="0.7" />
      </g>
      {/* zzz */}
      <text x="92" y="74" className="lc-z lc-z1" fill={lamp} fontFamily="monospace" fontSize="11">z</text>
      <text x="100" y="64" className="lc-z lc-z2" fill={lamp} fontFamily="monospace" fontSize="14">z</text>
      <text x="110" y="52" className="lc-z lc-z3" fill={lamp} fontFamily="monospace" fontSize="18">Z</text>
    </g>
  );
}

const css = `
.lc-stage{border:0;background:transparent;padding:0;line-height:0}
.lc-bubble{position:absolute;top:-6px;left:50%;transform:translateX(-50%);z-index:5;
  max-width:200px;background:#0d161d;border:1px solid #2a3a34;color:#cfe8df;
  font-family:ui-monospace,monospace;font-size:10px;line-height:1.35;padding:6px 8px;white-space:normal}
@keyframes lcType{0%,100%{transform:translateY(0)}50%{transform:translateY(2px)}}
@keyframes lcData{0%,100%{transform:scaleY(0.7)}50%{transform:scaleY(1.15)}}
@keyframes lcSteam{0%{opacity:0;transform:translateY(4px)}40%{opacity:0.8}100%{opacity:0;transform:translateY(-8px)}}
@keyframes lcZ{0%{opacity:0;transform:translateY(6px)}30%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}
@keyframes lcBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.12)}}
@keyframes lcLamp{0%,100%{opacity:1}50%{opacity:0.45}}
@keyframes lcLean{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-1.5deg)}}
.lc-type{animation:lcType 0.45s steps(2) infinite;transform-origin:78px 100px}
.lc-data rect{animation:lcData 0.9s ease-in-out infinite;transform-origin:bottom}
.lc-data rect:nth-child(2){animation-delay:0.15s}
.lc-data rect:nth-child(3){animation-delay:0.3s}
.lc-data rect:nth-child(4){animation-delay:0.45s}
.lc-data rect:nth-child(5){animation-delay:0.6s}
.lc-steam rect{animation:lcSteam 2.4s ease-out infinite}
.lc-steam rect:nth-child(2){animation-delay:1.2s}
.lc-z{animation:lcZ 3s ease-out infinite}
.lc-z2{animation-delay:1s}
.lc-z3{animation-delay:2s}
.lc-breathe{animation:lcBreathe 3.4s ease-in-out infinite}
.lc-lamp{animation:lcLamp 1.8s ease-in-out infinite}
.lc-lean{animation:lcLean 5s ease-in-out infinite;transform-origin:65px 120px}
@media (prefers-reduced-motion: reduce){
  .lc-type,.lc-data rect,.lc-steam rect,.lc-z,.lc-breathe,.lc-lamp,.lc-lean{animation:none}
  .lc-z{opacity:0.8}
}
`;

export default LabCharacter;
