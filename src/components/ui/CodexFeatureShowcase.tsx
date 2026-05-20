"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Table2,
  Shield,
  Download,
  Eye,
} from "lucide-react";

/* ─── Scroll-reveal hook (IntersectionObserver, GPU-only opacity+transform) ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════
   FEATURE 1 — Upload & Draft (Dark Mode)
   ═══════════════════════════════════════════════════════ */
function FeatureUploadDraft() {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-8 lg:py-28"
    >
      {/* Text side */}
      <div
        className="transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(32px)",
        }}
      >
        <h2 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[38px] lg:text-[44px]">
          Unggah catatan.
          <br />
          Dapatkan draft otomatis.
        </h2>
        <p className="mt-5 text-[16px] leading-[1.7] text-white/60 sm:text-[17px]">
          Dari catatan lapangan, file PDF, hingga observasi mentah — NaLI
          mengubahnya menjadi draft berbasis evidensi yang siap direview. Setiap
          draft dilengkapi sumber, batasan, dan catatan ketidakpastian.
        </p>
        <div className="mt-6 flex items-center gap-2 text-[#34d399] font-semibold text-[14px]">
          <span>Mulai draft sekarang</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {/* Mockup side */}
      <div
        className="transition-all duration-700 delay-200"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
        }}
      >
        <div
          className="relative overflow-hidden rounded-2xl p-[1px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(6,182,212,0.3) 50%, rgba(99,102,241,0.3) 100%)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl bg-[#0d111c]/90 p-5 sm:p-6 backdrop-blur-md"
            style={{
              boxShadow: "0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Evidence Requirement Gate label */}
            <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-450 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                Evidence Requirement Gate
              </span>
            </div>

            {/* Upload area */}
            <div className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-8 text-center transition-all hover:bg-white/[0.04]">
              <Upload className="mx-auto h-8 w-8 text-white/40" />
              <p className="mt-3 text-sm font-medium text-white/80">
                Seret file atau klik untuk upload
              </p>
              <p className="mt-1 text-xs text-white/40">
                PDF, DOCX, TXT, gambar
              </p>
            </div>

            {/* Uploaded files */}
            <div className="mt-4 space-y-2.5">
              {[
                {
                  name: "catatan_lapangan_03.pdf",
                  size: "2.4 MB",
                  status: "done",
                },
                {
                  name: "observasi_patrol.txt",
                  size: "148 KB",
                  status: "done",
                },
                {
                  name: "foto_evidence_07.jpg",
                  size: "3.1 MB",
                  status: "processing",
                },
              ].map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3"
                >
                  <FileText className="h-4 w-4 shrink-0 text-cyan-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-white/90">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-white/40">{file.size}</p>
                  </div>
                  {file.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  )}
                </div>
              ))}
            </div>

            {/* Generate button */}
            <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 transition-all hover:brightness-110">
              Generate Evidence-Based Draft →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURE 2 — Evidence Engine (Dark Mode)
   ═══════════════════════════════════════════════════════ */
function FeatureEvidenceEngine() {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:py-28"
    >
      {/* Mockup side (left on desktop) */}
      <div
        className="order-2 transition-all duration-700 delay-200 lg:order-1"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
        }}
      >
        <div
          className="relative overflow-hidden rounded-2xl p-[1px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(59,130,246,0.3) 50%, rgba(99,102,241,0.3) 100%)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl bg-[#0d111c]/90 p-5 sm:p-6 backdrop-blur-md"
            style={{
              boxShadow: "0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Evidence table header */}
            <div className="mb-4 flex items-center gap-2">
              <Table2 className="h-5 w-5 text-cyan-400" />
              <span className="text-[14.5px] font-semibold text-white/90">
                Source Coverage
              </span>
              <span className="ml-auto font-mono text-[10.5px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded">
                Hash: 0x8f2a...9c
              </span>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-white/[0.08]">
              <div className="grid grid-cols-[1.2fr_1.5fr_0.8fr] gap-px bg-white/[0.08]">
                {/* Header */}
                <div className="bg-white/[0.02] px-3 py-2.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Claim
                </div>
                <div className="bg-white/[0.02] px-3 py-2.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Source
                </div>
                <div className="bg-white/[0.02] px-3 py-2.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  Status
                </div>

                {/* Row 1 */}
                <div className="bg-[#0d111c] px-3 py-3 text-[12px] text-white/80 border-t border-white/[0.04]">
                  Populasi menurun 12%
                </div>
                <div className="bg-[#0d111c] px-3 py-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3 text-cyan-400" />
                    <span className="text-[12px] text-white/70">
                      IUCN Red List 2024
                    </span>
                  </div>
                </div>
                <div className="bg-[#0d111c] px-3 py-3 border-t border-white/[0.04]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                {/* Row 2 */}
                <div className="bg-[#0d111c] px-3 py-3 text-[12px] text-white/80 border-t border-white/[0.04]">
                  Habitat berkurang 30%
                </div>
                <div className="bg-[#0d111c] px-3 py-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3 text-cyan-400" />
                    <span className="text-[12px] text-white/70">
                      WWF Report 2023
                    </span>
                  </div>
                </div>
                <div className="bg-[#0d111c] px-3 py-3 border-t border-white/[0.04]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                {/* Row 3 */}
                <div className="bg-[#0d111c] px-3 py-3 text-[12px] text-white/80 border-t border-white/[0.04]">
                  Patroli efektif 85%
                </div>
                <div className="bg-[#0d111c] px-3 py-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    <span className="text-[12px] text-white/70">
                      Self-reported data
                    </span>
                  </div>
                </div>
                <div className="bg-[#0d111c] px-3 py-3 border-t border-white/[0.04]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Manual verification needed
                  </span>
                </div>
              </div>
            </div>

            {/* Uncertainty note */}
            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <p className="text-[12px] font-medium text-amber-300">
                    Catatan ketidakpastian
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-white/60">
                    1 claim menggunakan data self-reported. Manual verification needed
                    sebelum dilewati oleh export gate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text side (right on desktop) */}
      <div
        className="order-1 transition-all duration-700 lg:order-2"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(32px)",
        }}
      >
        <h2 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[38px] lg:text-[44px]">
          Setiap klaim dilacak.
          <br />
          Setiap sumber terlihat.
        </h2>
        <p className="mt-5 text-[16px] leading-[1.7] text-white/60 sm:text-[17px]">
          Evidence Engine NaLI melacak setiap klaim ke sumbernya, menandai data
          yang perlu verifikasi manual, dan memastikan transparansi penuh
          sebelum draft siap diekspor.
        </p>
        <div className="mt-6 flex items-center gap-2 text-cyan-400 font-semibold text-[14px]">
          <span>Lihat evidence engine</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURE 3 — Review & Export (Dark Mode)
   ═══════════════════════════════════════════════════════ */
function FeatureReviewExport() {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-8 lg:py-28"
    >
      {/* Text side */}
      <div
        className="transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(32px)",
        }}
      >
        <h2 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[38px] lg:text-[44px]">
          Review dulu.
          <br />
          Export saat siap.
        </h2>
        <p className="mt-5 text-[16px] leading-[1.7] text-white/60 sm:text-[17px]">
          Tidak ada draft yang langsung diekspor. Setiap laporan melalui
          checklist review — memastikan integritas akademis, verifikasi sumber,
          dan persetujuan eksplisit sebelum finalisasi.
        </p>
        <div className="mt-6 flex items-center gap-2 text-indigo-400 font-semibold text-[14px]">
          <span>Pelajari review workflow</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {/* Mockup side */}
      <div
        className="transition-all duration-700 delay-200"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
        }}
      >
        <div
          className="relative overflow-hidden rounded-2xl p-[1px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(168,85,247,0.3) 50%, rgba(236,72,153,0.3) 100%)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl bg-[#0d111c]/90 p-5 sm:p-6 backdrop-blur-md"
            style={{
              boxShadow: "0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Export gate header */}
            <div className="mb-5 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              <span className="text-[14px] font-semibold text-white/90">
                Export Gate
              </span>
              <span className="ml-auto rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                2 of 4 passed
              </span>
            </div>

            {/* Review checklist */}
            <div className="space-y-3">
              {[
                {
                  label: "Source Coverage (Schema verified)",
                  passed: true,
                  icon: BookOpen,
                },
                {
                  label: "Uncertainty & Source Limit check",
                  passed: true,
                  icon: AlertTriangle,
                },
                {
                  label: "Manual verification & human review",
                  passed: false,
                  icon: Eye,
                },
                {
                  label: "Academic Integrity Checklist Consent",
                  passed: false,
                  icon: Shield,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors"
                    style={{
                      borderColor: item.passed
                        ? "rgba(16,185,129,0.2)"
                        : "rgba(255,255,255,0.06)",
                      backgroundColor: item.passed
                        ? "rgba(16,185,129,0.04)"
                        : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{
                        color: item.passed ? "#10b981" : "rgba(255,255,255,0.35)",
                      }}
                    />
                    <span
                      className="flex-1 text-[13px] font-medium"
                      style={{
                        color: item.passed ? "#34d399" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {item.label}
                    </span>
                    {item.passed ? (
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border-2 border-white/20" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Export button (disabled state) */}
            <button
              disabled
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.08] py-3 text-sm font-semibold text-white/30 cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export Draft
            </button>
            <p className="mt-2 text-center text-[11px] text-white/40">
              Selesaikan semua checklist untuk mengaktifkan export
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT — Full showcase section (Dark Mode)
   ═══════════════════════════════════════════════════════ */
export function CodexFeatureShowcase() {
  return (
    <div className="bg-[#07090e]">
      <FeatureUploadDraft />

      {/* Divider */}
      <div className="mx-auto max-w-[800px] px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <FeatureEvidenceEngine />

      {/* Divider */}
      <div className="mx-auto max-w-[800px] px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <FeatureReviewExport />
    </div>
  );
}
