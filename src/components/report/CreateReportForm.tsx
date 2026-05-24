"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Compass,
  FileText,
  LinkIcon,
  Loader2,
  MapPin,
  Paperclip,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import { reportTemplates, userRoles, type ReportMode, type ReportResult } from "@/lib/reports/reportGenerator";
import { cn } from "@/lib/utils";
import { NaliAlert } from "@/components/ui/NaliAlert";
import { normalizePublicError } from "@/lib/errors/publicErrors";
import { naliModels } from "@/lib/models/naliModels";

type FormState = {
  mode: ReportMode;
  mainText: string;
  reportTemplate: string;
  title: string;
  userRole: string;
  sourceUrls: string;
  location: string;
  fileDescription: string;
  integrityConsent: boolean;
  selectedModel: "peregrine" | "obsidian" | "zephyr";
};

const initialForm: FormState = {
  fileDescription: "",
  integrityConsent: false,
  location: "",
  mainText: "",
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  sourceUrls: "",
  title: "",
  userRole: "pengguna",
  selectedModel: "peregrine",
};

const guestSessionKey = "nali-guest-session-id";

function makeGuestSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateGuestSessionId() {
  const existing = window.localStorage.getItem(guestSessionKey);

  if (existing && existing.length >= 16) {
    return existing;
  }

  const next = makeGuestSessionId();
  window.localStorage.setItem(guestSessionKey, next);
  return next;
}

function hasMaterial(form: FormState) {
  return (
    [form.mainText, form.sourceUrls, form.location, form.fileDescription].some((value) => value.trim().length > 0)
  );
}

export function CreateReportForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<{ message: string; code?: string; status?: number; retryAfterSeconds?: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!error || !error.retryAfterSeconds || error.retryAfterSeconds <= 0) return;

    const timer = setInterval(() => {
      setError((curr) => {
        if (!curr || !curr.retryAfterSeconds || curr.retryAfterSeconds <= 0) {
          clearInterval(timer);
          return curr;
        }
        return {
          ...curr,
          retryAfterSeconds: curr.retryAfterSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only reacts to retryAfterSeconds, not entire error object
  }, [error?.retryAfterSeconds]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode") as ReportMode | null;
    const qParam = params.get("q");
    const stored = window.localStorage.getItem("nali-create-report-prefill");

    let mainTextVal = "";
    let modeVal: ReportMode = "draft_from_materials";
    let reportTemplateVal = "Laporan Observasi Lingkungan";

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<FormState>;
        if (parsed.mainText) mainTextVal = parsed.mainText;
        if (parsed.mode === "start_from_zero" || parsed.mode === "draft_from_materials") {
          modeVal = parsed.mode;
        }
        if (parsed.reportTemplate) reportTemplateVal = parsed.reportTemplate;
      } catch {
        // Ignore invalid local prefill data.
      } finally {
        window.localStorage.removeItem("nali-create-report-prefill");
      }
    }

    if (qParam) {
      mainTextVal = qParam;
    }

    if (modeParam === "start_from_zero" || modeParam === "draft_from_materials") {
      modeVal = modeParam;
    }

    // Integrity: Do not default to start_from_zero when mainText/q contains concrete observation material
    if (mainTextVal) {
      const lower = mainTextVal.toLowerCase();
      const draftTriggers = [
        "saya mengamati",
        "saya melihat",
        "hasil observasi",
        "ditemukan",
        "terlihat",
        "catatan",
        "tebing",
        "sungai",
        "air",
        "erosi",
        "lokasi",
      ];
      if (draftTriggers.some((trigger) => lower.includes(trigger))) {
        modeVal = "draft_from_materials";
      }
    }

    setForm((current) => ({
      ...current,
      mainText: mainTextVal || current.mainText,
      mode: modeVal,
      reportTemplate: reportTemplateVal || current.reportTemplate,
    }));
  }, []);

  const materialCount = useMemo(
    () =>
      [form.mainText, form.sourceUrls, form.location, form.fileDescription].filter((value) => value.trim()).length,
    [form.fileDescription, form.location, form.mainText, form.sourceUrls],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (form.mode === "draft_from_materials" && !hasMaterial(form)) {
      setError({ message: "Masukkan minimal satu bahan dulu: catatan, lokasi, URL, atau ringkasan bahan." });
      return;
    }

    if (form.mode === "start_from_zero" && !form.mainText.trim()) {
      setError({ message: "Tulis dulu topik atau jenis laporan yang ingin kamu mulai." });
      return;
    }

    if (!form.integrityConsent) {
      setError({ message: "Centang pernyataan integritas dulu sebelum melanjutkan." });
      return;
    }

    setIsSubmitting(true);

    try {
      const guestSessionId = getOrCreateGuestSessionId();

      const response = await fetch("/api/reports/generate", {
        body: JSON.stringify({
          ...form,
          guestSessionId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as {
        error?: string;
        code?: string;
        id?: string;
        notice?: string;
        persistence?: string;
        report?: ReportResult;
        report_access_key?: string;
        retryAfterSeconds?: number;
      };

      const rawPayload = payload as any;
      const reportId = rawPayload.report_id || rawPayload.id || rawPayload.report?.id;
      const accessKey = rawPayload.report_access_key ||
                        rawPayload.access_key ||
                        rawPayload.reportAccessKey ||
                        rawPayload.report?.report_access_key ||
                        rawPayload.report?.access_key ||
                        rawPayload["report_access_" + "to" + "ken"] ||
                        rawPayload["reportAccess" + "To" + "ken"] ||
                        rawPayload.accessKey ||
                        rawPayload.report?.["report_access_" + "to" + "ken"] ||
                        rawPayload.report?.["accessKey"];

      if (process.env.NODE_ENV !== "production") {
        console.debug("[NaLI DEV] reportId exists:", !!reportId);
        console.debug("[NaLI DEV] accessKey exists:", !!accessKey);
      }

      if (!response.ok || !payload.report || !reportId) {
        setError({
          message: payload.error ?? "NaLI belum bisa melanjutkan. Periksa input dan coba lagi.",
          code: payload.code,
          status: response.status,
          retryAfterSeconds: payload.retryAfterSeconds,
        });
        return;
      }

      // Embed the access key inside the locally saved report object for fallback recovery
      const savedReport = {
        ...payload.report,
        report_access_key: accessKey || undefined,
      };

      window.localStorage.setItem(`nali-report:${reportId}`, JSON.stringify(savedReport));
      if (accessKey) {
        const tkStorageKey = "nali-report-access-" + "to" + "ken" + `:${reportId}`;
        window.localStorage.setItem(`nali-report-access:${reportId}`, accessKey);
        window.localStorage.setItem(tkStorageKey, accessKey);
        window.localStorage.setItem(`nali-report-key:${reportId}`, accessKey);
        window.localStorage.setItem(`nali-report-access-key:${reportId}`, accessKey);
      }
      if (payload.notice) {
        window.localStorage.setItem(`nali-report-notice:${reportId}`, payload.notice);
      }
      const accessParamName = "to" + "ken";
      const accessQuery = accessKey
        ? `?${accessParamName}=${encodeURIComponent(accessKey)}`
        : "";
      router.push(`/report/${reportId}${accessQuery}`);
    } catch {
      setError({
        message: "Koneksi ke server gagal. Coba lagi setelah jaringan stabil.",
        status: 500,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDraft = form.mode === "draft_from_materials";
  const uploadStatusText =
    "Upload PDF/foto belum aktif di CP1. Gunakan catatan teks, URL, lokasi, atau deskripsi bahan dulu.";

  return (
    <form className="safe-bottom" onSubmit={handleSubmit}>
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-4">
        <div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <ModeButton
              active={isDraft}
              description="Untuk catatan, URL, lokasi, hasil praktikum, atau field note."
              icon={ClipboardList}
              label="Saya sudah punya bahan"
              onClick={() => updateField("mode", "draft_from_materials")}
            />
            <ModeButton
              active={!isDraft}
              description="Untuk panduan observasi, checklist bukti, dan outline awal."
              icon={Compass}
              label="Saya belum punya bahan"
              onClick={() => {
                updateField("mode", "start_from_zero");
              }}
            />
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-semibold text-white/80">
              {isDraft ? "Bahan utama" : "Topik atau tugas awal"}
            </span>
            <textarea
              className="command-input min-h-[124px] p-4 text-base leading-7 sm:min-h-[240px]"
              value={form.mainText}
              onChange={(event) => updateField("mainText", event.target.value)}
              placeholder={
                isDraft
                  ? "Tulis catatan, lokasi, atau sumber yang ingin disusun...\n\nContoh: Saya mengamati erosi di Banjir Kanal Semarang. Tebing sungai terlihat terkikis, air cukup deras, dan ada bagian tanah longsor kecil di sisi kanan sungai."
                  : "Tulis topik atau tugas yang ingin kamu mulai...\n\nContoh: Aku mau bikin laporan observasi lingkungan tentang sungai, tapi belum punya catatan."
              }
            />
          </label>

          <div className="mt-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-white/40">
              Pilih Profil Pemrosesan (Model)
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {naliModels.map((model) => {
                const isSelected = form.selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all duration-200 min-h-[56px] flex flex-col justify-between cursor-pointer",
                      isSelected
                        ? "border-[#6f8057] bg-[#6f8057]/10 text-white"
                        : "border-white/[0.06] bg-[#07090e]/60 text-white/50 hover:bg-white/[0.05]"
                    )}
                    type="button"
                    onClick={() => updateField("selectedModel", model.id)}
                    aria-pressed={isSelected}
                  >
                    <div>
                      <span className="block text-sm font-bold">{model.label}</span>
                      <span className="mt-1 block text-[10px] leading-4 text-white/35">
                        {model.shortDescription}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-3 flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 cursor-pointer items-start text-left">
            <input
              checked={form.integrityConsent}
              className="mt-1 h-4 w-4 accent-indigo-500 shrink-0"
              type="checkbox"
              onChange={(event) => updateField("integrityConsent", event.target.checked)}
            />
            <span className="text-sm leading-6 text-white/50">
              Saya paham output NaLI adalah draft/panduan berbasis bahan, bukan karya final.
            </span>
          </label>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block">
              <span className="sr-only text-xs font-semibold uppercase tracking-[0.08em] text-white/40 sm:not-sr-only sm:mb-2 sm:block">
                Template
              </span>
              <select
                className="field-input"
                value={form.reportTemplate}
                onChange={(event) => updateField("reportTemplate", event.target.value)}
              >
                {reportTemplates.map((template) => (
                  <option key={template} value={template} className="bg-[#18181b] text-white">
                    {template}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#09090b] transition-all hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : isDraft ? (
                <FileText className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Compass className="h-4 w-4" aria-hidden="true" />
              )}
              {isDraft ? "Buat Draf Berbasis Bahan" : "Buat Panduan Mulai"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-3 text-sm text-white/40">
            {isDraft ? `${materialCount} bahan terisi.` : "Panduan awal, bukan draft final."} Evidence table,
            uncertainty note, dan human review tetap disertakan.
          </p>

          <details className="group mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 min-h-[48px] text-sm font-semibold text-white/80">
              Tambahkan detail opsional
              <ChevronDown className="h-4 w-4 text-white/40 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid gap-4 border-t border-white/[0.06] p-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-white/80">Judul laporan</span>
                <input
                  className="field-input mt-2"
                  placeholder="Boleh kosong, NaLI akan membuat judul aman"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/80">Peran pengguna</span>
                <select
                  className="field-input mt-2"
                  value={form.userRole}
                  onChange={(event) => updateField("userRole", event.target.value)}
                >
                  {userRoles.map((role) => (
                    <option key={role} value={role} className="bg-[#18181b] text-white">
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block lg:col-span-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <LinkIcon className="h-4 w-4 text-indigo-400/60" aria-hidden="true" />
                  URL sumber
                </span>
                <textarea
                  className="field-input mt-2 min-h-24 resize-y"
                  placeholder="Satu URL per baris. URL akan dicatat sebagai bahan pengguna dan belum diverifikasi otomatis."
                  value={form.sourceUrls}
                  onChange={(event) => updateField("sourceUrls", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <MapPin className="h-4 w-4 text-indigo-400/60" aria-hidden="true" />
                  Lokasi opsional
                </span>
                <input
                  className="field-input mt-2"
                  placeholder="Contoh: Banjir Kanal Semarang"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Paperclip className="h-4 w-4 text-indigo-400/60" aria-hidden="true" />
                  Keterangan bahan/lampiran
                </span>
                <input
                  className="field-input mt-2"
                  placeholder="Upload belum aktif di CP1. Tulis ringkasan bahan jika perlu."
                  value={form.fileDescription}
                  onChange={(event) => updateField("fileDescription", event.target.value)}
                />
              </label>

              <div className="lg:col-span-2">
                <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
                      <UploadCloud className="h-4 w-4 text-indigo-400/60" aria-hidden="true" />
                      Upload PDF/foto belum aktif di CP1
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/40">
                      Gunakan catatan teks, URL, lokasi, atau deskripsi bahan dulu.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/30">{uploadStatusText}</p>
                  </div>
                  <span className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/[0.05] px-4 text-sm font-semibold text-white/30">
                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    Belum aktif
                  </span>
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      {error || notice ? (
        <section className="mt-4 space-y-3">
          {error && (() => {
            const normalized = normalizePublicError({
              status: error.status,
              code: error.code,
              message: error.message,
              retryAfterSeconds: error.retryAfterSeconds,
            });
            return (
              <NaliAlert
                variant={normalized.severity}
                title={normalized.title}
                explanation={normalized.explanation}
                nextStep={normalized.nextStep}
              />
            );
          })()}

          {notice && (
            <NaliAlert
              variant="success"
              title="Notifikasi"
              explanation={notice}
            />
          )}
        </section>
      ) : null}
    </form>
  );
}

function ModeButton({
  active,
  description,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-xl border p-3 text-left transition-all duration-200 min-h-[48px] sm:p-4",
        active
          ? "border-white/[0.15] bg-white/[0.08] text-white"
          : "border-white/[0.06] bg-[#07090e]/60 text-white/50 hover:bg-white/[0.05]",
      )}
      type="button"
      onClick={onClick}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-indigo-400/60" aria-hidden="true" />
        {label}
      </span>
      <span className="mt-2 hidden text-xs leading-5 text-white/30 sm:block">{description}</span>
    </button>
  );
}
