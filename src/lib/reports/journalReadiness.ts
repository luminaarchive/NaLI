import type { ReportRequest, ReportResult } from "./reportGenerator";

export interface JournalReadinessResult {
  journalReady: boolean;
  readinessLevel: "not_ready" | "outline_ready" | "draft_ready" | "pdf_ready_later";
  canGenerateJournalDraft: boolean;
  canGenerateJournalPdfNow: false;
  reasons: string[];
  missingRequirements: string[];
  recommendedNextAction: string;
}

export function evaluateJournalReadiness(
  input: ReportRequest,
  report: ReportResult
): JournalReadinessResult {
  const reasons: string[] = [];
  const missingRequirements: string[] = [];
  
  let hasTitle = false;
  let hasContext = false;
  let hasMethod = false;
  let hasEvidence = false;
  let hasLimitations = false;
  let hasMissingEvidence = false;

  const isStartFromZero = input.mode === "start_from_zero";

  // Check Title
  if (report.title && report.title.trim().length > 5) {
    hasTitle = true;
  } else {
    missingRequirements.push("Judul laporan yang spesifik");
  }

  if (isStartFromZero) {
    reasons.push("Laporan dalam mode Start From Zero (hanya berupa panduan awal).");
    missingRequirements.push("Bahan pengamatan atau catatan lapangan belum diunggah/ditulis.");
    return {
      journalReady: false,
      readinessLevel: "not_ready",
      canGenerateJournalDraft: false,
      canGenerateJournalPdfNow: false,
      reasons,
      missingRequirements,
      recommendedNextAction: "Kumpulkan catatan observasi lapangan terlebih dahulu.",
    };
  }

  // draft_from_materials
  const draft = report as any;

  // Check Context (Background/Executive Summary)
  const bgText = draft.background || "";
  if (bgText.trim().length > 100) {
    hasContext = true;
  } else {
    missingRequirements.push("Deskripsi latar belakang penelitian/observasi yang memadai (min. 100 karakter)");
  }

  // Check Method
  const methodText = draft.method_or_materials || "";
  if (methodText.trim().length > 100) {
    hasMethod = true;
  } else {
    missingRequirements.push("Metode pengamatan atau bahan yang terdokumentasi (min. 100 karakter)");
  }

  // Check Evidence
  const evidenceRows = draft.evidence_table || [];
  if (evidenceRows.length > 0) {
    hasEvidence = true;
  } else {
    missingRequirements.push("Minimal satu baris tabel bukti (catatan, lokasi, URL, atau file)");
  }

  // Check Limitations
  const uncertainty = draft.uncertainty_note || "";
  if (uncertainty.trim().length > 30) {
    hasLimitations = true;
  } else {
    missingRequirements.push("Pernyataan batasan bukti dan ketidakpastian");
  }

  // Check Missing Evidence
  const missingEv = draft.additional_evidence_needed || [];
  if (missingEv.length > 0) {
    hasMissingEvidence = true;
  } else {
    missingRequirements.push("Daftar bukti tambahan yang dibutuhkan");
  }

  // Check for fake citations/claims in input
  const mainTextLower = (input.mainText || "").toLowerCase();
  const hasAcademicCheatingRequest = /generate\s+tugas|buatkan\s+skripsi|anti\s+plagiarisme/i.test(mainTextLower);
  
  if (hasAcademicCheatingRequest) {
    reasons.push("Permintaan mengandung indikasi plagiarisme atau pembuatan tugas otomatis.");
  }

  // Determine readiness level
  let readinessLevel: "not_ready" | "outline_ready" | "draft_ready" | "pdf_ready_later" = "not_ready";
  let journalReady = false;
  let canGenerateJournalDraft = false;

  const score = [hasTitle, hasContext, hasMethod, hasEvidence, hasLimitations, hasMissingEvidence].filter(Boolean).length;

  if (score >= 6) {
    readinessLevel = "draft_ready";
    journalReady = true;
    canGenerateJournalDraft = true;
    reasons.push("Semua komponen dasar draf jurnal ilmiah terpenuhi.");
  } else if (score >= 3) {
    readinessLevel = "outline_ready";
    canGenerateJournalDraft = false;
    reasons.push("Komponen cukup untuk outline jurnal, namun detail metode dan bukti masih kurang.");
  } else {
    readinessLevel = "not_ready";
    canGenerateJournalDraft = false;
    reasons.push("Bahan awal sangat terbatas, belum siap untuk outline maupun draf jurnal.");
  }

  // Generate recommended action
  let recommendedNextAction = "Tambahkan detail observasi dan perjelas tujuan pengamatan.";
  if (readinessLevel === "not_ready") {
    recommendedNextAction = "Lengkapi catatan lapangan, sebutkan lokasi pengamatan, atau tambahkan deskripsi file.";
  } else if (readinessLevel === "outline_ready") {
    if (!hasMethod) {
      recommendedNextAction = "Lengkapi bagian metode atau langkah kerja pengamatan kamu.";
    } else if (!hasEvidence) {
      recommendedNextAction = "Tambahkan data observasi pendukung (lokasi, catatan detail, atau URL).";
    } else {
      recommendedNextAction = "Perkuat bukti observasi dengan mendeskripsikan hasil pengamatan lebih rinci.";
    }
  } else if (readinessLevel === "draft_ready") {
    recommendedNextAction = "Tinjau draf jurnal, lengkapi sumber pustaka manual, lalu siap ekspor jika modul PDF aktif.";
  }

  return {
    journalReady,
    readinessLevel,
    canGenerateJournalDraft,
    canGenerateJournalPdfNow: false,
    reasons,
    missingRequirements,
    recommendedNextAction,
  };
}
