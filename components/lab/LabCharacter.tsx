"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LabRoom3D } from "@/components/lab/LabRoom3D";

/* -------------------------------------------------------------------------- */
/*  LabCharacter , a real-time 3D operator that mirrors the harvest machine's   */
/*  live state, polled from /api/lab/status every 30s.                         */
/*                                                                            */
/*    working  : a harvest finished in the last 30 min , typing at the rig.     */
/*    idle     : last run 30 min .. 24h ago , coffee + cigarette break.         */
/*    sleeping : no run for > 24h (or none ever) , asleep in bed.               */
/*                                                                            */
/*  The room + character are an original procedural three.js scene (see        */
/*  LabRoom3D). When the state changes the operator WALKS to the next station.  */
/*  ?karakter=working|idle|sleeping forces a state for preview/screenshots      */
/*  without changing any data.                                                 */
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

const STATE_META: Record<LabState, { lamp: string; label: string; icon: string }> = {
  working: { lamp: "#46cfa8", label: "MESIN SEDANG BEKERJA", icon: "\u{1F525}" },
  idle: { lamp: "#e6b53c", label: "MESIN ISTIRAHAT", icon: "☕" },
  sleeping: { lamp: "#c0506a", label: "MESIN TIDUR", icon: "\u{1F4A4}" },
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

      {/* 3D operator room , click anywhere to make the operator speak */}
      <button
        type="button"
        onClick={speak}
        aria-label="Sapa operator Lab"
        className="lc-stage relative block w-full cursor-pointer overflow-hidden border border-dashed border-[#2a3a34] bg-gradient-to-b from-[#0a141b] to-[#05080b]"
        style={{ height: 280 }}
      >
        <LabRoom3D state={state} />

        {/* status chip, top-left over the scene */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          <span
            className="lc-dot inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: meta.lamp, boxShadow: `0 0 8px ${meta.lamp}` }}
            aria-hidden
          />
          <span className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-paper drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {meta.icon} {meta.label}
          </span>
        </div>

        {bubble && <div className="lc-bubble">{bubble}</div>}

        <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[0.56rem] uppercase tracking-wider text-[#4f6b62]">
          klik untuk menyapa
        </span>
      </button>

      {/* the readout */}
      <div className="mt-4">
        <p className="font-mono text-[0.74rem] leading-relaxed text-[#9ecdbf]">
          {state === "working" && (
            <>
              Memanen dari {status?.activeSources.length ?? 0} sumber. Panen terakhir{" "}
              {ago(status?.lastRunAt ?? null)}.
            </>
          )}
          {state === "idle" && (
            <>Panen terakhir {ago(status?.lastRunAt ?? null)}. Sedang menunggu jadwal berikutnya.</>
          )}
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
          Diperbarui {sinceUpdate < 2 ? "barusan" : `${sinceUpdate} detik lalu`} · polling 30s ·
          operator pindah ruang mengikuti keadaan mesin
        </p>
      </div>
    </div>
  );
}

const css = `
.lc-stage{padding:0;line-height:0;text-align:left}
.lc-bubble{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:5;
  max-width:240px;background:#0d161d;border:1px solid #2a3a34;color:#cfe8df;
  font-family:ui-monospace,monospace;font-size:11px;line-height:1.4;padding:7px 10px;
  white-space:normal;border-radius:2px;box-shadow:0 4px 18px rgba(0,0,0,0.5)}
@keyframes lcDot{0%,100%{opacity:1}50%{opacity:0.4}}
.lc-dot{animation:lcDot 1.8s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){ .lc-dot{animation:none} }
`;

export default LabCharacter;
