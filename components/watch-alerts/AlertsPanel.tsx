"use client";

import { useCallback, useEffect, useState } from "react";
import type { AlertEvent, AlertTrigger, WatchAlert } from "@/lib/watch-alerts/types";

const TRIGGER_LABEL: Record<AlertTrigger, string> = {
  "new-source-on-topic": "Sumber baru ditemukan",
  "claim-status-changed": "Status klaim berubah",
  "article-updated": "Artikel diperbarui",
  "series-new-article": "Artikel baru dalam seri",
};

const TRIGGER_OPTIONS = Object.entries(TRIGGER_LABEL) as [AlertTrigger, string][];

type WatchKind = "topic" | "series" | "article";
const KIND_LABEL: Record<WatchKind, string> = {
  topic: "Topik",
  series: "Seri",
  article: "Artikel",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 45) return "baru saja";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
}

function watchedTarget(a: WatchAlert): string {
  if (a.topicSlug) return `Topik: ${a.topicSlug}`;
  if (a.seriesId) return `Seri: ${a.seriesId}`;
  if (a.articleSlug) return `Artikel: ${a.articleSlug}`;
  return "Pantauan";
}

function payloadTitle(p: Record<string, unknown>): string | null {
  const t = p.title ?? p.articleTitle ?? p.slug ?? p.articleSlug ?? p.topicSlug ?? p.seriesId;
  return t ? String(t) : null;
}

export function AlertsPanel() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<WatchAlert[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [tab, setTab] = useState<"notifikasi" | "pantauan">("notifikasi");
  const [showForm, setShowForm] = useState(false);

  // form state
  const [kind, setKind] = useState<WatchKind>("topic");
  const [slug, setSlug] = useState("");
  const [trigger, setTrigger] = useState<AlertTrigger>("new-source-on-topic");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts", { cache: "no-store" });
      const data = await res.json();
      setEnabled(Boolean(data.enabled));
      setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch {
      /* keep last state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  async function markSeen(eventId: string) {
    setEvents((prev) => prev.filter((e) => e.id !== eventId)); // optimistic
    await fetch("/api/alerts/events/seen", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    }).catch(() => {});
  }

  async function markAllSeen() {
    setEvents([]); // optimistic
    await fetch("/api/alerts/events/seen", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});
  }

  async function removeAlert(id: string) {
    if (!window.confirm("Hapus pantauan ini?")) return;
    setAlerts((prev) => prev.filter((a) => a.id !== id)); // optimistic
    await fetch(`/api/alerts/${id}`, { method: "DELETE" }).catch(() => {});
  }

  async function submitAlert(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const value = slug.trim();
    if (!value) {
      setFormError("Isi slug yang ingin dipantau.");
      return;
    }
    setSubmitting(true);
    const body: Record<string, string> = { trigger };
    if (kind === "topic") body.topicSlug = value;
    else if (kind === "series") body.seriesId = value;
    else body.articleSlug = value;
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Gagal menambah pantauan.");
      } else {
        setSlug("");
        setShowForm(false);
        await refresh();
      }
    } catch {
      setFormError("Gagal menambah pantauan.");
    } finally {
      setSubmitting(false);
    }
  }

  const unseen = events.length;

  return (
    <section className="border border-dashed border-ink/40 bg-paper/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="label text-ink">Watch Alerts</h2>
          {unseen > 0 && (
            <span className="inline-flex min-w-[1.5rem] justify-center border border-ink bg-ink px-1.5 py-0.5 font-mono text-[0.62rem] text-paper">
              {unseen}
            </span>
          )}
        </div>
        {tab === "notifikasi" && unseen > 0 && (
          <button
            onClick={markAllSeen}
            className="font-mono text-[0.68rem] uppercase tracking-widest text-ink underline-offset-2 hover:underline"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* tabs */}
      <div className="mt-4 flex gap-2 font-mono text-[0.68rem] uppercase tracking-widest">
        {(["notifikasi", "pantauan"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border px-3 py-1.5 transition-colors ${
              tab === t ? "border-ink bg-ink text-paper" : "border-ink/40 text-ink hover:bg-ink-wash"
            }`}
          >
            {t === "notifikasi" ? "Notifikasi" : "Pantauan Aktif"}
          </button>
        ))}
      </div>

      {!enabled && !loading && (
        <p className="mt-4 font-mono text-[0.72rem] leading-relaxed text-gray">
          Watch Alerts aktif setelah kunci layanan dipasang di server. Sampai itu, panel ini
          tampil kosong dengan aman.
        </p>
      )}

      {/* NOTIFIKASI */}
      {tab === "notifikasi" && (
        <ul className="mt-4 space-y-px">
          {loading ? (
            <li className="font-mono text-[0.72rem] text-gray">Memuat...</li>
          ) : events.length === 0 ? (
            <li className="font-mono text-[0.72rem] text-gray">Tidak ada notifikasi baru.</li>
          ) : (
            events.map((e) => {
              const title = payloadTitle(e.payload);
              return (
                <li key={e.id}>
                  <button
                    onClick={() => markSeen(e.id)}
                    className="flex w-full flex-col items-start gap-1 border border-dashed border-ink/30 bg-paper p-3 text-left transition-colors hover:bg-ink-wash"
                  >
                    <span className="font-mono text-[0.62rem] uppercase tracking-widest text-ink/70">
                      {TRIGGER_LABEL[e.trigger]} · {relativeTime(e.createdAt)}
                    </span>
                    {title && <span className="font-sans text-[0.85rem] text-charcoal">{title}</span>}
                    <span className="font-mono text-[0.6rem] uppercase tracking-widest text-gray/70">
                      klik untuk menandai dibaca
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}

      {/* PANTAUAN AKTIF */}
      {tab === "pantauan" && (
        <div className="mt-4">
          <ul className="space-y-px">
            {loading ? (
              <li className="font-mono text-[0.72rem] text-gray">Memuat...</li>
            ) : alerts.length === 0 ? (
              <li className="font-mono text-[0.72rem] text-gray">
                Belum ada pantauan aktif. Tambahkan topik atau seri yang ingin dipantau.
              </li>
            ) : (
              alerts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 border border-dashed border-ink/30 bg-paper p-3"
                >
                  <div>
                    <p className="font-mono text-[0.78rem] text-ink">{watchedTarget(a)}</p>
                    <p className="font-mono text-[0.62rem] uppercase tracking-widest text-gray/80">
                      {TRIGGER_LABEL[a.trigger]} · {relativeTime(a.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeAlert(a.id)}
                    className="shrink-0 font-mono text-[0.62rem] uppercase tracking-widest text-gray hover:text-ink"
                  >
                    Hapus
                  </button>
                </li>
              ))
            )}
          </ul>

          {showForm ? (
            <form onSubmit={submitAlert} className="mt-4 space-y-3 border border-dashed border-ink/30 p-3">
              <div className="flex flex-wrap gap-2">
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as WatchKind)}
                  className="border border-ink/40 bg-paper px-2 py-1.5 font-mono text-[0.72rem] text-ink"
                >
                  {(Object.keys(KIND_LABEL) as WatchKind[]).map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug yang dipantau"
                  className="min-w-[10rem] flex-1 border border-ink/40 bg-paper px-2 py-1.5 font-mono text-[0.72rem] text-ink outline-none placeholder:text-gray/60"
                />
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value as AlertTrigger)}
                  className="border border-ink/40 bg-paper px-2 py-1.5 font-mono text-[0.72rem] text-ink"
                >
                  {TRIGGER_OPTIONS.map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {formError && <p className="font-mono text-[0.68rem] text-[#c0392b]">{formError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="border border-ink bg-ink px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-widest text-paper disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan pantauan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-widest text-gray hover:text-ink"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 border border-ink/40 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-widest text-ink hover:bg-ink-wash"
            >
              Tambah pantauan
            </button>
          )}
        </div>
      )}
    </section>
  );
}
