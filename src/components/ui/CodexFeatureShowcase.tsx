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
   FEATURE 1 — Upload & Draft
   Text left, mockup right
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
        <h2
          className="text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[38px] lg:text-[44px]"
          style={{ color: "#0f172a" }}
        >
          Unggah catatan.
          <br />
          Dapatkan draft otomatis.
        </h2>
        <p
          className="mt-5 text-[16px] leading-[1.7] sm:text-[17px]"
          style={{ color: "#475569" }}
        >
          Dari catatan lapangan, file PDF, hingga observasi mentah — NaLI
          mengubahnya menjadi draft berbasis evidensi yang siap direview. Setiap
          draft dilengkapi sumber, batasan, dan catatan ketidakpastian.
        </p>
        <div className="mt-6 flex items-center gap-2">
          <span
            className="text-[14px] font-semibold"
            style={{ color: "#4338ca" }}
          >
            Mulai draft sekarang
          </span>
          <ArrowRight className="h-4 w-4" style={{ color: "#4338ca" }} />
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
          className="relative overflow-hidden rounded-2xl p-1"
          style={{
            background:
              "linear-gradient(135deg, #7c6cda 0%, #8b9cf7 30%, #a5b4fc 50%, #c4b5fd 70%, #8b5cf6 100%)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl bg-white p-5 sm:p-6"
            style={{
              boxShadow: "0 25px 60px rgba(99,80,200,0.15)",
            }}
          >
            {/* Upload area */}
            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-indigo-400" />
              <p className="mt-3 text-sm font-medium text-indigo-600">
                Seret file atau klik untuk upload
              </p>
              <p className="mt-1 text-xs text-indigo-400">
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
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3"
                >
                  <FileText className="h-4 w-4 shrink-0 text-indigo-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-gray-700">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{file.size}</p>
                  </div>
                  {file.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-indigo-300 border-t-transparent" />
                  )}
                </div>
              ))}
            </div>

            {/* Generate button */}
            <button className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700">
              Generate Evidence-Based Draft →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURE 2 — Evidence Engine (reversed layout)
   Mockup left, text right
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
          className="relative overflow-hidden rounded-2xl p-1"
          style={{
            background:
              "linear-gradient(135deg, #6366f1 0%, #818cf8 35%, #a78bfa 60%, #c084fc 85%, #7c3aed 100%)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl bg-white p-5 sm:p-6"
            style={{
              boxShadow: "0 25px 60px rgba(99,80,200,0.15)",
            }}
          >
            {/* Evidence table header */}
            <div className="mb-4 flex items-center gap-2">
              <Table2 className="h-5 w-5 text-violet-500" />
              <span className="text-[14px] font-semibold text-gray-800">
                Evidence Table
              </span>
              <span className="ml-auto rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-600">
                3 claims verified
              </span>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <div className="grid grid-cols-[1.2fr_1.5fr_0.8fr] gap-px bg-gray-100">
                {/* Header */}
                <div className="bg-gray-50 px-3 py-2.5 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Claim
                </div>
                <div className="bg-gray-50 px-3 py-2.5 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Source
                </div>
                <div className="bg-gray-50 px-3 py-2.5 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Status
                </div>

                {/* Row 1 */}
                <div className="bg-white px-3 py-3 text-[12px] text-gray-700">
                  Populasi menurun 12%
                </div>
                <div className="bg-white px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3 text-blue-500" />
                    <span className="text-[12px] text-gray-600">
                      IUCN Red List 2024
                    </span>
                  </div>
                </div>
                <div className="bg-white px-3 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                {/* Row 2 */}
                <div className="bg-white px-3 py-3 text-[12px] text-gray-700">
                  Habitat berkurang 30%
                </div>
                <div className="bg-white px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3 text-blue-500" />
                    <span className="text-[12px] text-gray-600">
                      WWF Report 2023
                    </span>
                  </div>
                </div>
                <div className="bg-white px-3 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                {/* Row 3 */}
                <div className="bg-white px-3 py-3 text-[12px] text-gray-700">
                  Patroli efektif 85%
                </div>
                <div className="bg-white px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-[12px] text-gray-600">
                      Self-reported data
                    </span>
                  </div>
                </div>
                <div className="bg-white px-3 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    Needs review
                  </span>
                </div>
              </div>
            </div>

            {/* Uncertainty note */}
            <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50/50 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-[12px] font-medium text-amber-700">
                    Catatan ketidakpastian
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-amber-600/80">
                    1 claim menggunakan data self-reported. Review manual
                    diperlukan sebelum export.
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
        <h2
          className="text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[38px] lg:text-[44px]"
          style={{ color: "#0f172a" }}
        >
          Setiap klaim dilacak.
          <br />
          Setiap sumber terlihat.
        </h2>
        <p
          className="mt-5 text-[16px] leading-[1.7] sm:text-[17px]"
          style={{ color: "#475569" }}
        >
          Evidence Engine NaLI melacak setiap klaim ke sumbernya, menandai data
          yang perlu verifikasi manual, dan memastikan transparansi penuh
          sebelum draft siap diekspor.
        </p>
        <div className="mt-6 flex items-center gap-2">
          <span
            className="text-[14px] font-semibold"
            style={{ color: "#4338ca" }}
          >
            Lihat evidence engine
          </span>
          <ArrowRight className="h-4 w-4" style={{ color: "#4338ca" }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURE 3 — Review & Export
   Text left, mockup right
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
        <h2
          className="text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[38px] lg:text-[44px]"
          style={{ color: "#0f172a" }}
        >
          Review dulu.
          <br />
          Export saat siap.
        </h2>
        <p
          className="mt-5 text-[16px] leading-[1.7] sm:text-[17px]"
          style={{ color: "#475569" }}
        >
          Tidak ada draft yang langsung diekspor. Setiap laporan melalui
          checklist review — memastikan integritas akademis, verifikasi sumber,
          dan persetujuan eksplisit sebelum finalisasi.
        </p>
        <div className="mt-6 flex items-center gap-2">
          <span
            className="text-[14px] font-semibold"
            style={{ color: "#4338ca" }}
          >
            Pelajari review workflow
          </span>
          <ArrowRight className="h-4 w-4" style={{ color: "#4338ca" }} />
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
          className="relative overflow-hidden rounded-2xl p-1"
          style={{
            background:
              "linear-gradient(135deg, #4f46e5 0%, #7c6cda 25%, #8b9cf7 50%, #a78bfa 75%, #6d28d9 100%)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl bg-white p-5 sm:p-6"
            style={{
              boxShadow: "0 25px 60px rgba(99,80,200,0.15)",
            }}
          >
            {/* Export gate header */}
            <div className="mb-5 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              <span className="text-[14px] font-semibold text-gray-800">
                Export Gate
              </span>
              <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                2 of 4 passed
              </span>
            </div>

            {/* Review checklist */}
            <div className="space-y-3">
              {[
                {
                  label: "Semua sumber tercantum",
                  passed: true,
                  icon: BookOpen,
                },
                {
                  label: "Catatan ketidakpastian lengkap",
                  passed: true,
                  icon: AlertTriangle,
                },
                {
                  label: "Review manual selesai",
                  passed: false,
                  icon: Eye,
                },
                {
                  label: "Persetujuan integritas akademis",
                  passed: false,
                  icon: Shield,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                    style={{
                      borderColor: item.passed
                        ? "rgba(16,185,129,0.2)"
                        : "rgba(203,213,225,0.5)",
                      backgroundColor: item.passed
                        ? "rgba(16,185,129,0.04)"
                        : "rgba(248,250,252,0.5)",
                    }}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{
                        color: item.passed ? "#10b981" : "#94a3b8",
                      }}
                    />
                    <span
                      className="flex-1 text-[13px] font-medium"
                      style={{
                        color: item.passed ? "#065f46" : "#64748b",
                      }}
                    >
                      {item.label}
                    </span>
                    {item.passed ? (
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Export button (disabled state) */}
            <button
              disabled
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-200 py-3 text-sm font-semibold text-gray-400"
            >
              <Download className="h-4 w-4" />
              Export Draft
            </button>
            <p className="mt-2 text-center text-[11px] text-gray-400">
              Selesaikan semua checklist untuk mengaktifkan export
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT — Full showcase section
   ═══════════════════════════════════════════════════════ */
export function CodexFeatureShowcase() {
  return (
    <div className="bg-white">
      <FeatureUploadDraft />

      {/* Divider */}
      <div className="mx-auto max-w-[800px] px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <FeatureEvidenceEngine />

      {/* Divider */}
      <div className="mx-auto max-w-[800px] px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <FeatureReviewExport />
    </div>
  );
}
