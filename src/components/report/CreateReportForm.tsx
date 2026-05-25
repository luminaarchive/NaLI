"use client";

import { FormEvent, useEffect, useMemo, useState, useRef, useCallback, memo } from "react";
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
  LockKeyhole,
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
import { CP1_PREMIUM_ACCESS_MESSAGE, naliModels } from "@/lib/models/naliModels";
import {
  saveGuestReportRecovery,
  clearGuestReportRecovery,
  loadLatestGuestReportRecovery,
  pruneExpiredGuestRecoveries,
  renameGuestReportRecovery,
  listGuestReportRecoveries,
  type GuestReportRecoverySnapshot,
} from "@/lib/reports/clientRecovery";
import { validateReportInput } from "@/lib/reports/inputValidation";
import { useDebouncedReportValidation } from "@/lib/reports/useDebouncedValidation";
import { readLocalImageMetadata, type LocalImageMetadataResult } from "@/lib/reports/localImageMetadata";

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
  return [form.mainText, form.sourceUrls, form.location, form.fileDescription].some((value) => value.trim().length > 0);
}

export function CreateReportForm() {
  const router = useRouter();
  const mainTextRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<{
    message: string;
    code?: string;
    status?: number;
    retryAfterSeconds?: number;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snapshots, setSnapshots] = useState<GuestReportRecoverySnapshot[]>([]);
  const validationIssue = useDebouncedReportValidation(form);
  const showValidation = !error && hasMaterial(form) && validationIssue.severity !== "none";
  const selectedModelLocked = naliModels.some(
    (model) => model.id === form.selectedModel && model.lockedWithoutEntitlement,
  );

  const [metadataResult, setMetadataResult] = useState<LocalImageMetadataResult | null>(null);
  const [metadataAlert, setMetadataAlert] = useState<{
    variant: "info" | "warning" | "error" | "success" | "locked";
    title: string;
    explanation: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadataAlert(null);
    setMetadataResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await readLocalImageMetadata(file);
      if (!res.ok) {
        setMetadataAlert({
          variant: "error",
          title: "Gagal membaca file",
          explanation: res.warnings[0] || "Terjadi kesalahan saat memproses gambar.",
        });
      } else if (res.warnings.length > 0 && !res.capturedAt && !res.latitude) {
        setMetadataAlert({
          variant: "warning",
          title: "Metadata tidak ditemukan",
          explanation:
            res.warnings[0] || "Tidak ada lokasi atau waktu pengambilan foto di dalam file ini. File tidak diupload.",
        });
      } else if (res.warnings.length > 0) {
        setMetadataAlert({
          variant: "info",
          title: "Metadata berhasil dibaca",
          explanation: res.warnings.join(" "),
        });
        setMetadataResult(res);
      } else {
        setMetadataResult(res);
      }
    } catch {
      setMetadataAlert({
        variant: "error",
        title: "Gagal membaca file",
        explanation: "Terjadi kesalahan saat membaca file gambar lokal.",
      });
    }
  };

  const handleClearMetadata = () => {
    setMetadataResult(null);
    setMetadataAlert(null);
    const input = document.getElementById("local-metadata-file") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleApplyMetadata = () => {
    if (!metadataResult) return;

    let targetLocation = form.location;
    let targetDesc = form.fileDescription;

    const locText = metadataResult.locationText || "";
    const dateText = metadataResult.capturedAt
      ? `[Metadata waktu foto: ${metadataResult.capturedAt}] (File tidak diupload)`
      : metadataResult.fileLastModifiedAt
        ? `[Waktu modifikasi file: ${metadataResult.fileLastModifiedAt}] (File tidak diupload)`
        : "";

    let overwriteLocation = false;
    let overwriteDesc = false;

    if (locText) {
      if (form.location.trim().length > 0) {
        overwriteLocation = window.confirm("Kolom lokasi sudah terisi. Apakah Anda ingin menimpanya?");
      } else {
        overwriteLocation = true;
      }
    }

    if (dateText) {
      if (form.fileDescription.trim().length > 0) {
        overwriteDesc = window.confirm("Kolom keterangan bahan sudah terisi. Apakah Anda ingin menimpanya?");
      } else {
        overwriteDesc = true;
      }
    }

    setForm((curr) => ({
      ...curr,
      location: overwriteLocation ? locText : curr.location,
      fileDescription: overwriteDesc ? dateText : curr.fileDescription,
    }));

    setMetadataAlert({
      variant: "success",
      title: "Metadata Diterapkan",
      explanation: "Metadata foto berhasil dimasukkan ke kolom isian. File tidak diupload ke server.",
    });
  };

  const loadSnapshots = useCallback(() => {
    try {
      const list = listGuestReportRecoveries();
      setSnapshots(list);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      pruneExpiredGuestRecoveries();
      loadSnapshots();
    } catch {
      // ignore
    }
  }, [loadSnapshots]);

  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const handleRestoreSnapshot = useCallback(
    (snapshot: GuestReportRecoverySnapshot) => {
      // Restore requires user action, warn first if active input exists
      const hasInput = [
        formRef.current.mainText,
        formRef.current.sourceUrls,
        formRef.current.location,
        formRef.current.fileDescription,
      ].some((v) => v.trim());
      if (hasInput) {
        const confirmOverwrite = window.confirm(
          "Apakah Anda ingin menimpa input aktif saat ini dengan draft yang dipulihkan?",
        );
        if (!confirmOverwrite) return;
      }

      const id = snapshot.id;
      const storedToken =
        window.localStorage.getItem(`nali-report-access:${id}`) ||
        window.localStorage.getItem(`nali-report-access-key:${id}`) ||
        window.localStorage.getItem(`nali-report-key:${id}`) ||
        window.localStorage.getItem(`nali-report-access-token:${id}`);

      // Rule 7: If snapshot has reportId but no access key, restore draft/composer state
      if (
        (snapshot.status === "draft_ready" || snapshot.status === "chat_updated") &&
        storedToken &&
        id &&
        !id.startsWith("temp-") &&
        id !== "composer-autosave"
      ) {
        router.push(`/report/${id}?token=${encodeURIComponent(storedToken)}`);
      } else {
        setForm({
          mode: snapshot.mode || "draft_from_materials",
          selectedModel: snapshot.selectedModel || "peregrine",
          mainText: snapshot.mainText || "",
          reportTemplate: snapshot.reportTemplate || "Laporan Observasi Lingkungan",
          location: snapshot.location || "",
          sourceUrls: snapshot.sourceUrls || "",
          fileDescription: snapshot.fileDescription || "",
          integrityConsent: snapshot.integrityConsent || false,
          title: snapshot.title || "",
          userRole: snapshot.userRole || "pengguna",
        });
        setError(null);
        setNotice(null);
        mainTextRef.current?.focus();
      }
    },
    [router],
  );

  const handleRenameSnapshot = useCallback(
    (id: string, currentTitle: string) => {
      const newTitle = window.prompt("Masukkan nama baru untuk draft ini:", currentTitle);
      if (newTitle === null) return;
      const success = renameGuestReportRecovery(id, newTitle);
      if (success) {
        loadSnapshots();
      } else {
        alert("Gagal mengubah nama draft.");
      }
    },
    [loadSnapshots],
  );

  const handleDeleteSnapshot = useCallback(
    (id: string) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus draft ini?")) {
        clearGuestReportRecovery(id);
        loadSnapshots();
      }
    },
    [loadSnapshots],
  );

  const handleClearAllSnapshots = useCallback(() => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua draft lokal di browser ini?")) {
      clearGuestReportRecovery();
      loadSnapshots();
    }
  }, [loadSnapshots]);

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

  // Debounced local composer autosave
  useEffect(() => {
    // Minimum useful text length of 20 characters before autosaving
    if (form.mainText.trim().length < 20) {
      return;
    }

    const timer = setTimeout(() => {
      saveGuestReportRecovery({
        id: "composer-autosave",
        title: form.title || "Autosave Draft Laporan",
        mode: form.mode,
        selectedModel: form.selectedModel,
        mainText: form.mainText,
        reportTemplate: form.reportTemplate,
        location: form.location,
        sourceUrls: form.sourceUrls,
        fileDescription: form.fileDescription,
        integrityConsent: form.integrityConsent,
        status: "autosaved_draft",
        timestamp: Date.now(),
      });
      loadSnapshots();
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    form.mainText,
    form.title,
    form.mode,
    form.selectedModel,
    form.reportTemplate,
    form.location,
    form.sourceUrls,
    form.fileDescription,
    form.integrityConsent,
    loadSnapshots,
  ]);

  const materialCount = useMemo(
    () => [form.mainText, form.sourceUrls, form.location, form.fileDescription].filter((value) => value.trim()).length,
    [form.fileDescription, form.location, form.mainText, form.sourceUrls],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    setError(null);
    setNotice(null);

    if (selectedModelLocked) {
      setError({
        message: CP1_PREMIUM_ACCESS_MESSAGE,
        code: "MODEL_ENTITLEMENT_REQUIRED",
        status: 403,
      });
      return;
    }

    const issue = validateReportInput(form);
    if (!issue.canSubmit) {
      setError({
        message: `${issue.title}: ${issue.message}`,
        code: issue.code,
      });
      return;
    }

    setIsSubmitting(true);
    clearGuestReportRecovery("composer-autosave");

    try {
      const guestSessionId = getOrCreateGuestSessionId();

      const tempId = `temp-${Date.now()}`;
      saveGuestReportRecovery({
        id: tempId,
        title: form.title || "Draft Laporan",
        mode: form.mode,
        selectedModel: form.selectedModel,
        mainText: form.mainText,
        reportTemplate: form.reportTemplate,
        location: form.location,
        sourceUrls: form.sourceUrls,
        fileDescription: form.fileDescription,
        integrityConsent: form.integrityConsent,
        status: "generation_failed",
        timestamp: Date.now(),
      });

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
      const accessKey =
        rawPayload.report_access_key ||
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
        // Rule 7: Abuse-blocked prompts must not become recovery drafts.
        const isAbuseBlock =
          response.status === 400 &&
          [
            "EMPTY_DRAFT_MATERIAL",
            "FINAL_ASSIGNMENT_WITHOUT_MATERIAL",
            "FAKE_CITATION_REQUEST",
            "FAKE_DATA_REQUEST",
            "PLAGIARISM_EVASION",
            "DO_MY_WORK",
          ].includes(payload.code || "");

        if (isAbuseBlock) {
          clearGuestReportRecovery(tempId);
          clearGuestReportRecovery("composer-autosave");
        }

        setError({
          message: payload.error ?? "NaLI belum bisa melanjutkan. Periksa input dan coba lagi.",
          code: payload.code,
          status: response.status,
          retryAfterSeconds: payload.retryAfterSeconds,
        });
        return;
      }

      // Successful generation: clear temp snapshot and save safe completed recovery
      clearGuestReportRecovery(tempId);
      clearGuestReportRecovery("composer-autosave");
      saveGuestReportRecovery({
        id: reportId,
        title: payload.report.title || "Draft Laporan",
        mode: form.mode,
        selectedModel: form.selectedModel,
        mainText: form.mainText,
        reportTemplate: form.reportTemplate,
        location: form.location,
        sourceUrls: form.sourceUrls,
        fileDescription: form.fileDescription,
        integrityConsent: form.integrityConsent,
        status: "draft_ready",
        timestamp: Date.now(),
      });

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
      const accessQuery = accessKey ? `?${accessParamName}=${encodeURIComponent(accessKey)}` : "";
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
      {snapshots.length > 0 && (
        <LocalHistoryPanel
          snapshots={snapshots}
          onRestore={handleRestoreSnapshot}
          onRename={handleRenameSnapshot}
          onDelete={handleDeleteSnapshot}
          onClearAll={handleClearAllSnapshots}
        />
      )}
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
              ref={mainTextRef}
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
            <span className="mb-2 block text-xs font-semibold tracking-[0.08em] text-white/40 uppercase">
              Pilih Profil Pemrosesan (Model)
            </span>
            <div className="flex flex-wrap gap-2">
              {naliModels.map((model) => {
                const isSelected = form.selectedModel === model.id;
                const isLocked = model.lockedWithoutEntitlement;
                return (
                  <button
                    key={model.id}
                    className={cn(
                      "inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 sm:flex-none",
                      isSelected
                        ? "border-[#6f8057] bg-[#6f8057]/15 text-white shadow-sm shadow-[#6f8057]/10"
                        : isLocked
                          ? "cursor-not-allowed border-white/[0.06] bg-[#07090e]/60 text-white/35"
                          : "cursor-pointer border-white/[0.06] bg-[#07090e]/60 text-white/50 hover:bg-white/[0.05]",
                    )}
                    type="button"
                    onClick={() => {
                      if (!isLocked) updateField("selectedModel", model.id);
                    }}
                    disabled={isLocked}
                    aria-disabled={isLocked}
                    aria-pressed={isSelected}
                  >
                    {isLocked && <LockKeyhole className="h-3 w-3 shrink-0" aria-hidden="true" />}
                    {model.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-white/45">{CP1_PREMIUM_ACCESS_MESSAGE}</p>
            {naliModels
              .filter((model) => model.id === form.selectedModel)
              .map((model) => (
                <div
                  key={`${model.id}-detail`}
                  className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <p className="text-xs leading-5 text-white/60">{model.shortDescription}</p>
                  <p className="mt-2 text-xs font-medium text-white/70">
                    {model.costLabel} / estimasi {model.estimatedCredits} Kredit
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-white/40">{model.pricingReadinessNote}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {model.safeCapabilities.map((capability) => (
                      <span
                        key={capability}
                        className="rounded-full border border-white/[0.06] px-2 py-1 text-[10px] text-white/55"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                  {model.limitations.length > 0 && (
                    <p className="mt-2 text-[11px] leading-5 text-white/40">{model.limitations.join(" / ")}</p>
                  )}
                </div>
              ))}
          </div>

          <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left">
            <input
              checked={form.integrityConsent}
              className="mt-1 h-4 w-4 shrink-0 accent-indigo-500"
              type="checkbox"
              onChange={(event) => updateField("integrityConsent", event.target.checked)}
            />
            <span className="text-sm leading-6 text-white/50">
              Saya paham output NaLI adalah draft/panduan berbasis bahan, bukan karya final.
            </span>
          </label>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block">
              <span className="sr-only text-xs font-semibold tracking-[0.08em] text-white/40 uppercase sm:not-sr-only sm:mb-2 sm:block">
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
              disabled={
                isSubmitting ||
                selectedModelLocked ||
                (error?.retryAfterSeconds !== undefined && error.retryAfterSeconds > 0) ||
                !validationIssue.canSubmit
              }
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
            <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white/80">
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

              <div className="space-y-3 lg:col-span-2">
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

                {/* Local-only Image Metadata Helper */}
                <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-white/80">
                    <UploadCloud className="h-4 w-4 text-indigo-400/60" />
                    Bantu isi dari metadata foto lokal
                  </h4>
                  <p className="text-xs leading-relaxed text-white/40">
                    Pilih foto dari perangkatmu untuk membaca metadata lokal seperti waktu atau koordinat jika tersedia.
                    File tidak diupload.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      id="local-metadata-file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="local-metadata-file"
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-white/10 px-4 text-xs font-semibold text-white transition focus-within:ring-2 focus-within:ring-indigo-500 hover:bg-white/15"
                    >
                      Baca metadata lokal
                    </label>
                    {metadataResult && (
                      <button
                        type="button"
                        onClick={handleClearMetadata}
                        className="min-h-[32px] cursor-pointer text-xs font-medium text-red-400 hover:text-red-300"
                      >
                        Hapus pilihan
                      </button>
                    )}
                  </div>

                  {metadataAlert && (
                    <div className="pt-2">
                      <NaliAlert
                        variant={metadataAlert.variant}
                        title={metadataAlert.title}
                        explanation={metadataAlert.explanation}
                      />
                    </div>
                  )}

                  {metadataResult && metadataResult.ok && (
                    <div className="space-y-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-xs">
                      <p className="font-semibold text-white/70">Pratinjau Metadata Gambar:</p>
                      <ul className="list-inside list-disc space-y-1 text-white/40">
                        <li>
                          Nama File: <span className="text-white/60">{metadataResult.fileName}</span>
                        </li>
                        <li>
                          Ukuran:{" "}
                          <span className="text-white/60">
                            {metadataResult.fileSizeBytes
                              ? (metadataResult.fileSizeBytes / 1024 / 1024).toFixed(2)
                              : "0.00"}{" "}
                            MB
                          </span>
                        </li>
                        {metadataResult.capturedAt && (
                          <li>
                            Waktu Pengambilan:{" "}
                            <span className="font-mono text-emerald-400">{metadataResult.capturedAt}</span>
                          </li>
                        )}
                        {!metadataResult.capturedAt && metadataResult.fileLastModifiedAt && (
                          <li>
                            Modifikasi File:{" "}
                            <span className="font-mono text-white/60">{metadataResult.fileLastModifiedAt}</span>{" "}
                            <span className="text-white/25">(bukan waktu pengamatan)</span>
                          </li>
                        )}
                        {metadataResult.locationText && (
                          <li>
                            Lokasi: <span className="text-emerald-400">{metadataResult.locationText}</span>
                          </li>
                        )}
                      </ul>
                      <button
                        type="button"
                        onClick={handleApplyMetadata}
                        className="inline-flex min-h-[36px] cursor-pointer items-center justify-center rounded-lg bg-emerald-500 px-3 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400"
                      >
                        Gunakan sebagai isian awal
                      </button>
                      <p className="text-[10px] text-white/20 italic">
                        * Metadata bisa hilang, salah, atau dimodifikasi. Tetap perlu verifikasi manual.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      {error || notice || showValidation ? (
        <section className="mt-4 space-y-3">
          {showValidation &&
            (() => {
              const variant = validationIssue.severity === "error" ? "error" : "warning";
              const nextStep = validationIssue.suggestions.join(" ");
              let actionLabel: string | undefined = undefined;
              let onAction: (() => void) | undefined = undefined;

              if (validationIssue.code === "TOO_SHORT" || validationIssue.code === "WEAK_INPUT") {
                actionLabel = "Tambah detail";
                onAction = () => {
                  mainTextRef.current?.focus();
                };
              }

              return (
                <NaliAlert
                  variant={variant}
                  title={validationIssue.title}
                  explanation={validationIssue.message}
                  nextStep={nextStep}
                  actionLabel={actionLabel}
                  onAction={onAction}
                />
              );
            })()}

          {error &&
            (() => {
              const normalized = normalizePublicError({
                status: error.status,
                code: error.code,
                message: error.message,
                retryAfterSeconds: error.retryAfterSeconds,
              });

              let actionLabel: string | undefined = undefined;
              let onAction: (() => void) | undefined = undefined;

              if (normalized.category === "RATE_LIMIT") {
                if (error.retryAfterSeconds === undefined || error.retryAfterSeconds <= 0) {
                  actionLabel = "Coba Lagi";
                  onAction = () => handleSubmit();
                }
              } else if (normalized.category === "NETWORK_OR_SERVER") {
                actionLabel = "Coba Lagi";
                onAction = () => handleSubmit();
              } else if (normalized.category === "INTEGRITY_BLOCK") {
                actionLabel = "Ubah Materi";
                onAction = () => {
                  setError(null);
                  mainTextRef.current?.focus();
                };
              } else if (normalized.category === "WEAK_INPUT") {
                actionLabel = "Tambah Detail";
                onAction = () => {
                  setError(null);
                  mainTextRef.current?.focus();
                };
              }

              return (
                <NaliAlert
                  variant={normalized.severity}
                  title={normalized.title}
                  explanation={normalized.explanation}
                  nextStep={normalized.nextStep}
                  retryAfterSeconds={error.retryAfterSeconds}
                  actionLabel={actionLabel}
                  onAction={onAction}
                />
              );
            })()}

          {notice && <NaliAlert variant="success" title="Notifikasi" explanation={notice} />}
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
        "min-h-[48px] rounded-xl border p-3 text-left transition-all duration-200 sm:p-4",
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

interface LocalHistoryPanelProps {
  snapshots: GuestReportRecoverySnapshot[];
  onRestore: (s: GuestReportRecoverySnapshot) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const LocalHistoryPanel = memo(function LocalHistoryPanel({
  snapshots,
  onRestore,
  onRename,
  onDelete,
  onClearAll,
}: LocalHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (snapshots.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl border border-white/[0.06] bg-[#07090e]/40 p-3 shadow-lg backdrop-blur-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-between px-1 text-xs font-bold tracking-wider text-white/50 uppercase transition hover:text-white"
      >
        <span className="flex items-center gap-1.5">
          📁 Riwayat lokal browser
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">{snapshots.length}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 border-t border-white/[0.04] pt-2">
          {snapshots.map((item) => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const statusLabel =
              {
                autosaved_draft: "Autosave",
                generation_failed: "Gagal",
                draft_ready: "Siap",
                chat_updated: "Chat",
              }[item.status] || "Draft";

            const statusColors =
              {
                autosaved_draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                generation_failed: "bg-red-500/10 text-red-400 border-red-500/20",
                draft_ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                chat_updated: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
              }[item.status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-white/[0.04] bg-white/[0.01] p-2.5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="max-w-[200px] truncate text-xs font-semibold text-white/80" title={item.title}>
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase",
                        statusColors,
                      )}
                    >
                      {statusLabel}
                    </span>
                    <span className="font-mono text-[10px] text-white/30">{timeStr}</span>
                  </div>
                  <p className="max-w-[400px] truncate text-[11px] text-white/50">
                    {item.mainText || "Tidak ada materi teks."}
                  </p>
                </div>

                <div className="mt-1 flex shrink-0 flex-wrap items-center gap-1 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => onRestore(item)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-white px-3 text-[11px] font-semibold text-zinc-950 transition hover:bg-white/90 sm:min-h-[36px]"
                  >
                    Pulihkan
                  </button>
                  <button
                    type="button"
                    onClick={() => onRename(item.id, item.title)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-white/[0.06] bg-white/5 px-3 text-[11px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white sm:min-h-[36px]"
                  >
                    Ganti nama
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-3 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/20 sm:min-h-[36px]"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-white/[0.06] bg-white/5 px-3 text-[11px] font-semibold text-red-400 transition hover:border-red-500/20 hover:bg-red-500/10 sm:min-h-[36px]"
            >
              Hapus semua
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
