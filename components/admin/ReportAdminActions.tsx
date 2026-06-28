"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { CitizenReport, CitizenReportStatus } from "@/lib/reports";

/**
 * Triage actions for a citizen report (admin only; RLS enforces it). Status
 * flips + a "copy to draft" helper that puts a markdown skeleton on the
 * clipboard. Promotion to a public article/correction stays a manual editorial
 * act, never automatic.
 */
export function ReportAdminActions({ report }: { report: CitizenReport }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function setStatus(next: CitizenReportStatus) {
    setBusy(true);
    const { error } = await createSupabaseBrowserClient()
      .from("citizen_reports")
      .update({ status: next, reviewed_at: new Date().toISOString() })
      .eq("id", report.id);
    setBusy(false);
    if (error) {
      alert(`Gagal memperbarui: ${error.message}`);
      return;
    }
    router.refresh();
  }

  async function copyDraft() {
    const lines = [
      `## ${report.subject}`,
      "",
      report.description,
      "",
      report.locationLabel ? `Lokasi: ${report.locationLabel}` : null,
      report.lat != null && report.lng != null
        ? `Koordinat (jangan publikasikan untuk satwa langka): ${report.lat}, ${report.lng}`
        : null,
      report.photoUrl ? `Foto (cek lisensi/izin sebelum tampil): ${report.photoUrl}` : null,
      "",
      "> Laporan warga, BELUM terverifikasi. Perlu konfirmasi sumber independen sebelum jadi klaim.",
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Gagal menyalin.");
    }
  }

  const btn =
    "border border-dashed border-ink/50 px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-gray transition-colors hover:bg-ink-wash disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {report.status !== "ditinjau" && (
        <button type="button" onClick={() => setStatus("ditinjau")} disabled={busy} className={btn}>
          Tinjau
        </button>
      )}
      {report.status !== "terverifikasi" && (
        <button
          type="button"
          onClick={() => setStatus("terverifikasi")}
          disabled={busy}
          className="border border-ink bg-ink px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
        >
          Verifikasi
        </button>
      )}
      {report.status !== "ditolak" && (
        <button type="button" onClick={() => setStatus("ditolak")} disabled={busy} className={btn}>
          Tolak
        </button>
      )}
      {report.status !== "baru" && (
        <button type="button" onClick={() => setStatus("baru")} disabled={busy} className={btn}>
          Kembalikan
        </button>
      )}
      <button type="button" onClick={copyDraft} className={btn}>
        {copied ? "Tersalin ✓" : "Salin ke draf"}
      </button>
    </div>
  );
}
