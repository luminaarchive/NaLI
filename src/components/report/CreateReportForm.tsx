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
    const q = params.get("q");
    const stored = window.localStorage.getItem("nali-create-report-prefill");

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<FormState>;
        setForm((current) => ({
          ...current,
          mainText: parsed.mainText ?? current.mainText,
          mode: parsed.mode === "start_from_zero" ? "start_from_zero" : current.mode,
          reportTemplate: parsed.reportTemplate ?? current.reportTemplate,
        }));
      } catch {
        // Ignore invalid local prefill data.
      } finally {
        window.localStorage.removeItem("nali-create-report-prefill");
      }
    } else if (q) {
      setForm((current) => ({ ...current, mainText: q }));
    }

    if (mode === "start_from_zero" || mode === "draft_from_materials") {
      setForm((current) => ({ ...current, mode }));
    }
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
      ? "Menyiapkan URL upload..."
      : uploadState === "uploading"
        ? "Mengunggah langsung ke Supabase Storage..."
        : uploadState === "verifying"
          ? "Memeriksa metadata dan integritas PDF..."
          : selectedPdf
            ? selectedPdf.name
            : "Belum ada PDF dipilih.";

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
                setSelectedPdf(null);
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

          <label className="mt-3 flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 sm:p-3">
            <input
              checked={form.integrityConsent}
              className="mt-1 h-4 w-4 accent-indigo-500"
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
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#09090b] transition-all hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-60 sm:min-h-12"
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
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white/80">
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
                  Keterangan file/lampiran
                </span>
                <input
                  className="field-input mt-2"
                  placeholder="Upload belum aktif. Tulis ringkasan file jika perlu."
                  value={form.fileDescription}
                  onChange={(event) => updateField("fileDescription", event.target.value)}
                />
              </label>

              <div className="lg:col-span-2">
                <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
                      <UploadCloud className="h-4 w-4 text-indigo-400/60" aria-hidden="true" />
                      Upload PDF opsional
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/40">
                      Maksimal 10MB. Upload belum aktif jika Supabase Storage belum dikonfigurasi.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/30">{uploadStatusText}</p>
                  </div>
                  <label
                    className={cn(
                      "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                      uploadDisabled
                        ? "cursor-not-allowed border-white/[0.05] text-white/30"
                        : "border-white/[0.12] text-white/75 hover:bg-white/[0.06]",
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
        <section className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-lg backdrop-blur-xl">
          {error ? (
            <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm leading-6 text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : null}

          {notice ? (
            <div className="flex gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm leading-6 text-emerald-300">
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
        "rounded-xl border p-2 text-left transition-all duration-200 sm:p-4",
        active
          ? "border-white/[0.15] bg-white/[0.08] text-white"
          : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.05]",
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
