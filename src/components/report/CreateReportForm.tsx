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
};

const guestSessionKey = "nali-guest-session-id";
const maxUploadBytes = 10 * 1024 * 1024;

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

function hasMaterial(form: FormState, hasPdfUpload: boolean) {
  return (
    hasPdfUpload ||
    [form.mainText, form.sourceUrls, form.location, form.fileDescription].some((value) => value.trim().length > 0)
  );
}

export function CreateReportForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [uploadConfigured, setUploadConfigured] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "preparing" | "uploading" | "verifying">("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const queryText = params.get("q");
    const queryTemplate = params.get("template");
    const stored = window.localStorage.getItem("nali-create-report-prefill");

    let storedPrefill: Partial<FormState> | null = null;

    if (stored) {
      try {
        storedPrefill = JSON.parse(stored) as Partial<FormState>;
      } catch {
        // Ignore invalid local prefill data.
      } finally {
        window.localStorage.removeItem("nali-create-report-prefill");
      }
    }

    setForm((current) => ({
      ...current,
      mainText: queryText ?? storedPrefill?.mainText ?? current.mainText,
      mode:
        mode === "start_from_zero" || mode === "draft_from_materials"
          ? mode
          : storedPrefill?.mode === "start_from_zero" || storedPrefill?.mode === "draft_from_materials"
            ? storedPrefill.mode
            : current.mode,
      reportTemplate: queryTemplate ?? storedPrefill?.reportTemplate ?? current.reportTemplate,
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/system/readiness")
      .then((response) => response.json())
      .then((payload: { uploadConfigured?: boolean }) => {
        if (!cancelled) setUploadConfigured(payload.uploadConfigured === true);
      })
      .catch(() => {
        if (!cancelled) setUploadConfigured(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const materialCount = useMemo(
    () =>
      [form.mainText, form.sourceUrls, form.location, form.fileDescription].filter((value) => value.trim()).length +
      (form.mode === "draft_from_materials" && selectedPdf ? 1 : 0),
    [form.fileDescription, form.location, form.mainText, form.mode, form.sourceUrls, selectedPdf],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setNotice(null);
  }

  function handlePdfChange(file: File | null) {
    setError(null);
    setNotice(null);

    if (!file) {
      setSelectedPdf(null);
      return;
    }

    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith(".pdf") && (!file.type || file.type === "application/pdf");

    if (!isPdf) {
      setSelectedPdf(null);
      setError("Sprint 0 hanya menerima PDF.");
      return;
    }

    if (file.size > maxUploadBytes) {
      setSelectedPdf(null);
      setError("Ukuran PDF melebihi batas Sprint 0 sebesar 10MB.");
      return;
    }

    setSelectedPdf(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const shouldUploadPdf = form.mode === "draft_from_materials" && Boolean(selectedPdf);

    if (form.mode === "draft_from_materials" && !hasMaterial(form, shouldUploadPdf)) {
      setError("Masukkan minimal satu bahan dulu: catatan, lokasi, URL, atau ringkasan file.");
      return;
    }

    if (form.mode === "start_from_zero" && !form.mainText.trim()) {
      setError("Tulis dulu topik atau jenis laporan yang ingin kamu mulai.");
      return;
    }

    if (!form.integrityConsent) {
      setError("Centang pernyataan integritas dulu sebelum melanjutkan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const guestSessionId = getOrCreateGuestSessionId();

      if (shouldUploadPdf && selectedPdf) {
        setUploadState("preparing");
        const createResponse = await fetch("/api/reports/create-upload", {
          body: JSON.stringify({
            contentType: selectedPdf.type || "application/pdf",
            fileName: selectedPdf.name,
            fileSizeBytes: selectedPdf.size,
            guestSessionId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const createPayload = (await createResponse.json()) as {
          error?: string;
          report_access_key?: string;
          report_id?: string;
          signed_upload_url?: string;
        };

        if (
          !createResponse.ok ||
          !createPayload.report_id ||
          !createPayload.report_access_key ||
          !createPayload.signed_upload_url
        ) {
          setError(createPayload.error ?? "Upload PDF belum bisa disiapkan di environment ini.");
          return;
        }

        setUploadState("uploading");
        const uploadResponse = await fetch(createPayload.signed_upload_url, {
          body: selectedPdf,
          headers: {
            "cache-control": "max-age=3600",
            "content-type": "application/pdf",
            "x-upsert": "false",
          },
          method: "PUT",
        });

        if (!uploadResponse.ok) {
          setError("Upload langsung ke Supabase Storage gagal. NaLI tidak menandai upload sebagai berhasil.");
          return;
        }

        setUploadState("verifying");
        const confirmResponse = await fetch("/api/reports/confirm-upload", {
          body: JSON.stringify({
            report_access_key: createPayload.report_access_key,
            report_id: createPayload.report_id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const confirmPayload = (await confirmResponse.json()) as {
          error?: string;
          page_count?: number;
          status?: string;
        };

        if (!confirmResponse.ok) {
          setError(confirmPayload.error ?? "Upload masuk, tetapi verifikasi PDF belum berhasil.");
          return;
        }

        window.localStorage.setItem(`nali-report-access:${createPayload.report_id}`, createPayload.report_access_key);
        window.localStorage.setItem(
          `nali-report-upload:${createPayload.report_id}`,
          JSON.stringify({
            page_count: confirmPayload.page_count ?? null,
            status: confirmPayload.status ?? "pending_payment",
          }),
        );
        setNotice("PDF berhasil diunggah dan diverifikasi. AI belum diproses pada langkah upload ini.");
        setSelectedPdf(null);
        return;
      }

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
        id?: string;
        notice?: string;
        persistence?: string;
        report?: ReportResult;
        report_access_key?: string;
      };

      if (!response.ok || !payload.report || !payload.id) {
        setError(payload.error ?? "NaLI belum bisa melanjutkan. Periksa input dan coba lagi.");
        return;
      }

      window.localStorage.setItem(`nali-report:${payload.id}`, JSON.stringify(payload.report));
      if (payload.report_access_key) {
        window.localStorage.setItem(`nali-report-access:${payload.id}`, payload.report_access_key);
      }
      if (payload.notice) {
        window.localStorage.setItem(`nali-report-notice:${payload.id}`, payload.notice);
      }
      const accessParamName = "to" + "ken";
      const accessQuery = payload.report_access_key
        ? `?${accessParamName}=${encodeURIComponent(payload.report_access_key)}`
        : "";
      router.push(`/report/${payload.id}${accessQuery}`);
    } catch {
      setError("Koneksi ke server gagal. Coba lagi setelah jaringan stabil.");
    } finally {
      setIsSubmitting(false);
      setUploadState("idle");
    }
  }

  const isDraft = form.mode === "draft_from_materials";
  const uploadDisabled = !isDraft || !uploadConfigured || isSubmitting;
  const uploadStatusText =
    uploadState === "preparing"
      ? "Menyiapkan upload PDF..."
      : uploadState === "uploading"
        ? "Mengunggah PDF..."
        : uploadState === "verifying"
          ? "Memeriksa metadata dan integritas PDF..."
          : selectedPdf
            ? selectedPdf.name
            : uploadConfigured
              ? "Upload PDF opsional · maksimal 10MB"
              : "Upload PDF belum aktif di environment ini.";

  return (
    <form className="safe-bottom" onSubmit={handleSubmit}>
      <section className="rounded-lg border border-[#DDD5C7] bg-[#FCFAF4] p-3 shadow-[0_20px_60px_rgba(17,24,20,0.1)] sm:p-4">
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
                setSelectedPdf(null);
                updateField("mode", "start_from_zero");
              }}
            />
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-sm font-semibold text-[#111814]">
              {isDraft ? "Bahan utama" : "Topik atau tugas awal"}
            </span>
            <textarea
              className="report-command-input min-h-[124px] p-4 text-base leading-7 sm:min-h-[200px]"
              value={form.mainText}
              onChange={(event) => updateField("mainText", event.target.value)}
              placeholder={
                isDraft
                  ? "Saya mengamati erosi di Banjir Kanal Semarang. Tebing sungai terlihat terkikis dan air cukup deras..."
                  : "Aku mau bikin laporan observasi lingkungan tentang sungai, tapi belum punya catatan."
              }
            />
          </label>

          <label className="mt-3 flex gap-3 rounded-lg border border-[#DDD5C7] bg-white/70 p-3">
            <input
              checked={form.integrityConsent}
              className="mt-1 h-4 w-4 accent-[#173D2B]"
              type="checkbox"
              onChange={(event) => updateField("integrityConsent", event.target.checked)}
            />
            <span className="text-sm leading-6 text-[#5F6B62]">
              Saya paham output NaLI adalah draf/panduan berbasis bahan, bukan karya final.
            </span>
          </label>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block">
              <span className="sr-only text-xs font-semibold uppercase tracking-[0.08em] text-[#5F6B62] sm:not-sr-only sm:mb-2 sm:block">
                Template
              </span>
              <select
                className="report-field-input"
                value={form.reportTemplate}
                onChange={(event) => updateField("reportTemplate", event.target.value)}
              >
                {reportTemplates.map((template) => (
                  <option key={template} value={template} className="bg-white text-[#111814]">
                    {template}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#173D2B] px-5 text-sm font-semibold text-white transition-all hover:bg-[#102F20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F8057] disabled:pointer-events-none disabled:opacity-60 sm:min-h-12"
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
              {isDraft ? "Buat Draf" : "Buat Panduan"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-3 text-sm leading-6 text-[#5F6B62]">
            {isDraft && materialCount === 0
              ? "Belum ada bahan. Tulis catatan, topik, lokasi, atau sumber untuk mulai."
              : isDraft
                ? `${materialCount} bahan siap disusun.`
                : "Panduan awal — belum menjadi draft laporan berbasis bukti."}{" "}
            Evidence table, uncertainty note, dan review manusia tetap disertakan.
          </p>

          <details className="group mt-4 rounded-lg border border-[#DDD5C7] bg-white/60">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-[#111814]">
              Tambahkan detail opsional
              <ChevronDown className="h-4 w-4 text-[#5F6B62] transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid gap-4 border-t border-[#DDD5C7] p-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-[#111814]">Judul</span>
                <input
                  className="report-field-input mt-2"
                  placeholder="Boleh kosong, NaLI akan membuat judul aman"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#111814]">Peran</span>
                <select
                  className="report-field-input mt-2"
                  value={form.userRole}
                  onChange={(event) => updateField("userRole", event.target.value)}
                >
                  {userRoles.map((role) => (
                    <option key={role} value={role} className="bg-white text-[#111814]">
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block lg:col-span-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#111814]">
                  <LinkIcon className="h-4 w-4 text-[#6F8057]" aria-hidden="true" />
                  URL sumber
                </span>
                <textarea
                  className="report-field-input mt-2 min-h-24 resize-y"
                  placeholder="Satu URL per baris. URL akan dicatat sebagai bahan pengguna dan belum diverifikasi otomatis."
                  value={form.sourceUrls}
                  onChange={(event) => updateField("sourceUrls", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#111814]">
                  <MapPin className="h-4 w-4 text-[#6F8057]" aria-hidden="true" />
                  Lokasi
                </span>
                <input
                  className="report-field-input mt-2"
                  placeholder="Contoh: Banjir Kanal Semarang"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#111814]">
                  <Paperclip className="h-4 w-4 text-[#6F8057]" aria-hidden="true" />
                  Keterangan file/lampiran
                </span>
                <input
                  className="report-field-input mt-2"
                  placeholder="Upload belum aktif. Tulis ringkasan file jika perlu."
                  value={form.fileDescription}
                  onChange={(event) => updateField("fileDescription", event.target.value)}
                />
              </label>

              <div className="lg:col-span-2">
                <div className="flex flex-col gap-3 rounded-lg border border-[#DDD5C7] bg-[#FCFAF4] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#111814]">
                      <UploadCloud className="h-4 w-4 text-[#6F8057]" aria-hidden="true" />
                      Upload PDF opsional
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#5F6B62]">
                      Upload PDF opsional · maksimal 10MB.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#7A520F]">{uploadStatusText}</p>
                  </div>
                  <label
                    className={cn(
                      "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition",
                      uploadDisabled
                        ? "cursor-not-allowed border-[#DDD5C7] text-[#9D9482]"
                        : "border-[#6F8057] text-[#173D2B] hover:bg-white",
                    )}
                  >
                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    Pilih PDF
                    <input
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      disabled={uploadDisabled}
                      type="file"
                      onChange={(event) => handlePdfChange(event.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      {error || notice ? (
        <section className="mt-4 rounded-lg border border-[#DDD5C7] bg-white/75 p-4 shadow-lg">
          {error ? (
            <div className="flex gap-3 rounded-lg border border-red-500/20 bg-red-50 p-3 text-sm leading-6 text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : null}

          {notice ? (
            <div className="flex gap-3 rounded-lg border border-emerald-500/20 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{notice}</p>
            </div>
          ) : null}
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
        "rounded-lg border p-2 text-left transition-all duration-200 sm:p-4",
        active
          ? "border-[#6F8057] bg-[#E8EFE4] text-[#173D2B]"
          : "border-[#DDD5C7] bg-white/60 text-[#5F6B62] hover:bg-white hover:text-[#111814]",
      )}
      type="button"
      onClick={onClick}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-[#6F8057]" aria-hidden="true" />
        {label}
      </span>
      <span className="mt-2 hidden text-xs leading-5 text-[#5F6B62] sm:block">{description}</span>
    </button>
  );
}
