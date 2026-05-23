/**
 * Deterministic task type classifier for NaLI CP1.
 * No LLM call — pure regex/keyword heuristics.
 */

export type TaskType =
  | "environmental_observation_report"
  | "biology_practicum_report"
  | "activity_report"
  | "evidence_check"
  | "rewrite"
  | "summary"
  | "export_request"
  | "general";

export type SuggestedAction = {
  label: string;
  prompt: string;
};

// ---------------------------------------------------------------------------
// Keyword patterns (Indonesian + English)
// ---------------------------------------------------------------------------

const PATTERNS: Array<{ type: TaskType; pattern: RegExp }> = [
  // Evidence check first — explicit user request overrides report type
  {
    type: "evidence_check",
    pattern:
      /cek\s+bukti|kualitas\s+bukti|evidence\s+check|klaim\s+lemah|sumber\s+lemah|data\s+kurang|verifikasi\s+bukti|overclaim|periksa\s+bukti|audit\s+bukti/i,
  },
  // Rewrite / refine
  {
    type: "rewrite",
    pattern:
      /\b(buat\s+(lebih\s+)?formal|rapikan|revisi|kesimpulan|rekomendasi|improve|rewrite|tambah(kan)?\s+rekomendasi|ubah\s+gaya|perbaiki\s+bahasa)\b/i,
  },
  // Summary / shorten
  {
    type: "summary",
    pattern:
      /\b(perpendek|ringkas|singkat|1\s+halaman|summarize|rangkum|persingkat)\b/i,
  },
  // Export request
  {
    type: "export_request",
    pattern: /\b(export|pdf|download|markdown|unduh)\b/i,
  },
  // Biology practicum
  {
    type: "biology_practicum_report",
    pattern:
      /praktikum|mikroskop|sel\s+bawang|osmosis|difusi|fotosintesis|biologi|microscope|cell\s+observation|alat\s+dan\s+bahan|langkah\s+kerja|hasil\s+pengamatan/i,
  },
  // Activity / KKN
  {
    type: "activity_report",
    pattern:
      /\bkkn\b|kegiatan|sosialisasi|desa|evaluasi\s+kegiatan|kendala|pelaksanaan|program\s+kerja|activity\s+report|laporan\s+kegiatan/i,
  },
  // Environmental observation (broadest — last among report types)
  {
    type: "environmental_observation_report",
    pattern:
      /sungai|sampah|lingkungan|observasi|air\s+keruh|vegetasi|erosi|polusi|hutan|burung|habitat|biodiversity|river|pollution|mangrove|flora|fauna|pencemaran|limbah/i,
  },
];

// ---------------------------------------------------------------------------
// Classification functions
// ---------------------------------------------------------------------------

export function classifyTask(input: {
  mainText: string;
  topic?: string;
  reportTemplate?: string;
}): TaskType {
  const combined = [input.mainText, input.topic ?? "", input.reportTemplate ?? ""].join(" ");

  for (const { type, pattern } of PATTERNS) {
    if (pattern.test(combined)) {
      return type;
    }
  }

  return "general";
}

export function classifyChatAction(query: string): TaskType {
  // Chat follow-ups: check action-oriented patterns first
  for (const { type, pattern } of PATTERNS) {
    if (pattern.test(query)) {
      return type;
    }
  }

  return "general";
}

// ---------------------------------------------------------------------------
// Template sections per task type
// ---------------------------------------------------------------------------

const SECTION_MAP: Record<TaskType, string[]> = {
  environmental_observation_report: [
    "Judul",
    "Latar Belakang",
    "Tujuan Observasi",
    "Metode Singkat",
    "Hasil Observasi",
    "Pembahasan",
    "Keterbatasan Bukti",
    "Kesimpulan",
    "Rekomendasi Lanjutan",
  ],
  biology_practicum_report: [
    "Judul Praktikum",
    "Tujuan",
    "Alat dan Bahan",
    "Langkah Kerja",
    "Hasil Pengamatan",
    "Pembahasan",
    "Kesimpulan",
    "Keterbatasan / Catatan Bukti",
  ],
  activity_report: [
    "Judul Kegiatan",
    "Latar Belakang",
    "Tujuan",
    "Waktu dan Lokasi",
    "Pelaksanaan Kegiatan",
    "Hasil Kegiatan",
    "Kendala",
    "Evaluasi",
    "Kesimpulan",
    "Rekomendasi",
  ],
  evidence_check: [
    "Ringkasan Klaim",
    "Klaim yang Didukung",
    "Klaim yang Lemah",
    "Bukti yang Hilang",
    "Risiko Overclaim",
    "Saran Penguatan Bukti",
    "Versi Klaim yang Lebih Aman",
  ],
  rewrite: [
    "Ringkasan Perubahan",
    "Hasil Revisi",
    "Catatan Bukti",
  ],
  summary: [
    "Ringkasan",
    "Poin Utama",
    "Catatan Bukti yang Dipertahankan",
  ],
  export_request: [
    "Status Ekspor",
  ],
  general: [
    "Ringkasan",
    "Hasil",
    "Catatan Bukti",
    "Langkah Lanjutan",
  ],
};

export function getReportSections(taskType: TaskType): string[] {
  return SECTION_MAP[taskType] ?? SECTION_MAP.general;
}

// ---------------------------------------------------------------------------
// Default suggested actions per task type
// ---------------------------------------------------------------------------

const ACTION_MAP: Record<TaskType, SuggestedAction[]> = {
  environmental_observation_report: [
    { label: "Perkuat bukti", prompt: "Cek dan perkuat bagian bukti yang masih lemah." },
    { label: "Buat lebih formal", prompt: "Buat laporan ini lebih formal dan akademis." },
    { label: "Perpendek", prompt: "Buat ringkasan laporan ini menjadi lebih pendek." },
    { label: "Tambah rekomendasi", prompt: "Tambahkan poin rekomendasi praktis." },
    { label: "Cek bukti", prompt: "Cek kualitas bukti dan tandai klaim yang lemah." },
  ],
  biology_practicum_report: [
    { label: "Perkuat pembahasan", prompt: "Perkuat bagian pembahasan berdasarkan hasil pengamatan." },
    { label: "Buat lebih formal", prompt: "Buat laporan praktikum ini lebih formal." },
    { label: "Perpendek", prompt: "Buat ringkasan laporan ini menjadi lebih pendek." },
    { label: "Tambah kesimpulan", prompt: "Tulis kesimpulan yang lebih kuat dan spesifik." },
    { label: "Cek bukti", prompt: "Cek kualitas bukti dan tandai klaim yang lemah." },
  ],
  activity_report: [
    { label: "Tambah evaluasi", prompt: "Tambahkan evaluasi kegiatan yang lebih mendalam." },
    { label: "Buat lebih formal", prompt: "Rapikan format dan gaya bahasa menjadi lebih formal." },
    { label: "Perpendek", prompt: "Perpendek laporan menjadi ringkasan 1 halaman." },
    { label: "Tambah rekomendasi", prompt: "Tambahkan poin rekomendasi tindak lanjut." },
    { label: "Cek bukti", prompt: "Cek kualitas bukti dan tandai klaim yang lemah." },
  ],
  evidence_check: [
    { label: "Perkuat bukti lemah", prompt: "Sarankan cara memperkuat bukti yang masih lemah." },
    { label: "Buat versi aman", prompt: "Buat versi klaim yang lebih aman dan terbukti." },
    { label: "Buat draf laporan", prompt: "Susun draf laporan lengkap berdasarkan bukti yang ada." },
  ],
  rewrite: [
    { label: "Perpendek", prompt: "Perpendek hasil revisi ini menjadi lebih ringkas." },
    { label: "Cek bukti", prompt: "Cek kualitas bukti di versi revisi ini." },
    { label: "Tambah rekomendasi", prompt: "Tambahkan poin rekomendasi praktis." },
  ],
  summary: [
    { label: "Buat lebih formal", prompt: "Buat ringkasan ini lebih formal." },
    { label: "Cek bukti", prompt: "Cek apakah bukti penting tetap tercantum di ringkasan." },
    { label: "Perluas kembali", prompt: "Perluas kembali ringkasan ini dengan detail yang relevan." },
  ],
  export_request: [
    { label: "Lihat paket kredit", prompt: "Lihat paket kredit untuk export." },
  ],
  general: [
    { label: "Perkuat bukti", prompt: "Cek dan perkuat bagian bukti yang masih lemah." },
    { label: "Buat lebih formal", prompt: "Buat hasilnya lebih formal dan akademis." },
    { label: "Perpendek", prompt: "Buat ringkasan yang lebih pendek." },
    { label: "Tambah rekomendasi", prompt: "Tambahkan poin rekomendasi praktis." },
    { label: "Cek bukti", prompt: "Cek kualitas bukti dan tandai klaim yang lemah." },
  ],
};

export function getDefaultSuggestedActions(taskType: TaskType): SuggestedAction[] {
  return ACTION_MAP[taskType] ?? ACTION_MAP.general;
}

// ---------------------------------------------------------------------------
// Evidence strength heuristic (for mock/short-input detection)
// ---------------------------------------------------------------------------

export function estimateEvidenceStrength(input: {
  mainText: string;
  sourceUrls: string[];
  location: string;
  fileDescription: string;
}): { strength: "weak" | "medium" | "strong"; coverage: "limited" | "adequate" | "strong" } {
  const textLen = input.mainText.trim().length;
  const hasUrls = input.sourceUrls.length > 0;
  const hasLocation = input.location.trim().length > 0;
  const hasFile = input.fileDescription.trim().length > 0;
  const supportCount = [hasUrls, hasLocation, hasFile].filter(Boolean).length;

  if (textLen < 50) {
    return { strength: "weak", coverage: "limited" };
  }

  if (textLen < 200 && supportCount === 0) {
    return { strength: "weak", coverage: "limited" };
  }

  if (textLen >= 200 && supportCount >= 2) {
    return { strength: "strong", coverage: "strong" };
  }

  if (textLen >= 200 || supportCount >= 1) {
    return { strength: "medium", coverage: "adequate" };
  }

  return { strength: "medium", coverage: "limited" };
}
