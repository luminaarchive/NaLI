"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LabRoom3D } from "@/components/lab/LabRoom3D";

/* -------------------------------------------------------------------------- */
/*  LabCharacter , a real-time 3D operator that mirrors the harvest machine     */
/*  AND the local time of day. Machine status is polled from /api/lab/status    */
/*  every 30s; the clock is read live so the room moves through dawn, day,      */
/*  dusk and night.                                                            */
/*                                                                            */
/*  Activity (what the operator does in the 3D room):                          */
/*    night (20:00-06:00) -> sleeping in bed                                    */
/*    day, just harvested  -> idle coffee break in the lounge                   */
/*    day otherwise        -> working at the desk                               */
/*                                                                            */
/*  The status lamp + readout report the REAL machine health honestly (last     */
/*  run, next scheduled run, leads). ?karakter=working|idle|sleeping forces the */
/*  activity and ?jam=0..23 forces the hour , both for preview/screenshots,     */
/*  neither changes any data.                                                  */
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
  working: { lamp: "#46cfa8", label: "OPERATOR BEKERJA", icon: "\u{1F525}" },
  idle: { lamp: "#e6b53c", label: "OPERATOR ISTIRAHAT", icon: "☕" },
  sleeping: { lamp: "#6f8fd8", label: "OPERATOR TIDUR", icon: "\u{1F319}" },
};

const DIALOGUE: Record<LabState, string[]> = {
  working: [
    "Lagi nyisir GBIF sama iNaturalist nih...",
    "Zaglossus masih sunyi 65 tahun. Catat.",
    "Data masuk, jangan diganggu dulu ya.",
    "Satu lead lagi, satu lead lagi...",
  ],
  idle: [
    "Ngopi dulu, baru saja kelar panen.",
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

function hourLabel(hour: number): string {
  if (hour < 5) return "dini hari";
  if (hour < 11) return "pagi";
  if (hour < 15) return "siang";
  if (hour < 18) return "sore";
  if (hour < 20) return "senja";
  return "malam";
}

/** Activity follows time of day + recent harvest (night sleeps, day works). */
function deriveState(status: LabStatus | null, hour: number): LabState {
  const night = hour < 6 || hour >= 20;
  if (night) return "sleeping";
  const mins = status?.minutesSinceLastRun;
  if (mins != null && mins <= 90) return "idle"; // just finished a harvest, coffee break
  return "working";
}

export function LabCharacter() {
  const [status, setStatus] = useState<LabStatus | null>(null);
  const [forcedState, setForcedState] = useState<LabState | null>(null);
  const [forcedHour, setForcedHour] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());
  const [mounted, setMounted] = useState(false); // gate the live clock (avoid SSR/client mismatch)
  const [, force] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ?karakter= forces the activity, ?jam= forces the hour (preview/screenshots).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const k = q.get("karakter");
    if (k === "working" || k === "idle" || k === "sleeping") setForcedState(k);
    const j = q.get("jam");
    if (j !== null && j !== "" && !Number.isNaN(Number(j))) {
      setForcedHour(Math.max(0, Math.min(23.99, Number(j))));
    }
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
    const tick = setInterval(() => force((n) => n + 1), 1000); // refresh clock + "ago"
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  // Before mount, use a deterministic hour so SSR and the first client render
  // match (no hydration mismatch). After mount, read the real local clock.
  const now = new Date();
  const liveHour = now.getHours() + now.getMinutes() / 60;
  const hour = mounted ? forcedHour ?? liveHour : 12;
  const state: LabState = mounted ? forcedState ?? deriveState(status, hour) : "working";
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
        className="lc-stage relative block w-full cursor-pointer overflow-hidden border border-dashed border-[#2a3a34] bg-[#05080b]"
        style={{ height: 300 }}
      >
        <LabRoom3D state={state} hour={hour} />

        {/* status chip, top-left over the scene */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          <span
            className="lc-dot inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: meta.lamp, boxShadow: `0 0 8px ${meta.lamp}` }}
            aria-hidden
          />
          <span className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] text-paper drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
            {meta.icon} {meta.label}
          </span>
        </div>

        {bubble && <div className="lc-bubble">{bubble}</div>}

        {/* time-of-day chip, bottom-left */}
        <span className="pointer-events-none absolute bottom-2 left-3 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#cfe0d8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
          {String(Math.floor(hour)).padStart(2, "0")}:
          {String(Math.floor((hour % 1) * 60)).padStart(2, "0")} · {hourLabel(hour)}
        </span>

        {/* short click hint, bottom-right */}
        <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[0.58rem] uppercase tracking-wider text-[#cfe0d8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
          👋 sapa
        </span>
      </button>

      {/* the readout (honest machine health) */}
      <div className="mt-4">
        <p className="font-mono text-[0.74rem] leading-relaxed text-[#9ecdbf]">
          {state === "working" && (
            <>
              Memantau {status?.activeSources.length ?? 0} sumber data. Panen terakhir{" "}
              {ago(status?.lastRunAt ?? null)}.
            </>
          )}
          {state === "idle" && <>Baru saja kelar panen ({ago(status?.lastRunAt ?? null)}). Rehat sejenak.</>}
          {state === "sleeping" && (
            <>Malam hari, operator tidur. Mesin tetap terjadwal panen {untilNext(status?.nextScheduledRun ?? new Date().toISOString())}.</>
          )}
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
          Diperbarui {sinceUpdate < 2 ? "barusan" : `${sinceUpdate} detik lalu`} · polling 30s · ruangan
          mengikuti waktu nyata (pagi, siang, malam) + keadaan mesin
        </p>
      </div>
    </div>
  );
}

const css = `
.lc-stage{padding:0;line-height:0;text-align:left}
.lc-bubble{position:absolute;top:34px;left:50%;transform:translateX(-50%);z-index:5;
  max-width:240px;background:#0d161d;border:1px solid #2a3a34;color:#cfe8df;
  font-family:ui-monospace,monospace;font-size:11px;line-height:1.4;padding:7px 10px;
  white-space:normal;border-radius:2px;box-shadow:0 4px 18px rgba(0,0,0,0.5)}
@keyframes lcDot{0%,100%{opacity:1}50%{opacity:0.4}}
.lc-dot{animation:lcDot 1.8s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){ .lc-dot{animation:none} }
`;

export default LabCharacter;
