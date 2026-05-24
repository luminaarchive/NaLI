export type ValidationSeverity = "none" | "info" | "warning" | "error";

export interface ValidationIssue {
  canSubmit: boolean;
  severity: ValidationSeverity;
  code: string;
  title: string;
  message: string;
  suggestions: string[];
}

const OK_ISSUE: ValidationIssue = {
  canSubmit: true,
  severity: "none",
  code: "OK",
  title: "",
  message: "",
  suggestions: [],
};

/**
 * Checks for contiguous repetitive characters or pattern spams.
 */
function hasRepetitiveSpam(text: string): boolean {
  if (text.length < 15) return false;
  // Match any character repeated 10+ times (e.g. aaaaaaaaaa)
  if (/(.)\1{9,}/.test(text)) return true;
  // Match any pattern of 1-3 characters repeated 5+ times (e.g. abcabcabcabcabc)
  if (/(.{1,3})\1{5,}/.test(text)) return true;
  return false;
}

/**
 * Performs client-side validation of report composer form inputs.
 */
export function validateReportInput(input: {
  mainText?: string;
  mode?: "draft_from_materials" | "start_from_zero";
  reportTemplate?: string;
  location?: string;
  sourceUrls?: string;
  fileDescription?: string;
  integrityConsent?: boolean;
}): ValidationIssue {
  const mode = input.mode || "draft_from_materials";
  const mainText = (input.mainText || "").trim();
  const location = (input.location || "").trim();
  const sourceUrls = (input.sourceUrls || "").trim();
  const fileDescription = (input.fileDescription || "").trim();
  const integrityConsent = Boolean(input.integrityConsent);

  // 1. Integrity Consent Check
  if (!integrityConsent) {
    return {
      canSubmit: false,
      severity: "error",
      code: "INTEGRITY_CONSENT_REQUIRED",
      title: "Centang persetujuan integritas",
      message: "Kamu harus menyetujui pernyataan integritas akademik sebelum membuat laporan.",
      suggestions: ["Silakan centang kotak persetujuan akademik di bagian bawah form."],
    };
  }

  // 2. Empty Input Check
  const hasInputMaterial = mainText.length > 0 || location.length > 0 || sourceUrls.length > 0 || fileDescription.length > 0;
  if (mode === "draft_from_materials" && !hasInputMaterial) {
    return {
      canSubmit: false,
      severity: "error",
      code: "EMPTY_INPUT",
      title: "Materi masih kosong",
      message: "Masukkan minimal satu bahan dulu: catatan observasi, deskripsi file, URL, atau lokasi pengamatan.",
      suggestions: [
        "Tulis catatan singkat di kolom utama.",
        "Masukkan lokasi koordinat atau wilayah observasi.",
        "Tempel rujukan URL bahan kajian.",
      ],
    };
  }

  if (mode === "start_from_zero" && mainText.length === 0) {
    return {
      canSubmit: false,
      severity: "error",
      code: "EMPTY_INPUT",
      title: "Materi masih kosong",
      message: "Tulis dulu topik, pertanyaan, atau arahan laporan yang ingin kamu mulai.",
      suggestions: [
        "Masukkan topik laporan yang ditugaskan, contoh: Laporan suksesi tumbuhan gumuk pasir.",
      ],
    };
  }

  // 3. Repeated spam check
  if (hasRepetitiveSpam(mainText) || hasRepetitiveSpam(location) || hasRepetitiveSpam(fileDescription)) {
    return {
      canSubmit: false,
      severity: "error",
      code: "SPAM_DETECTED",
      title: "Input terdeteksi spam",
      message: "Isi teks mengandung karakter berulang yang mencurigakan. Masukkan catatan observasi yang riil.",
      suggestions: ["Periksa kembali teks input Anda dan hapus karakter sampah."],
    };
  }

  // 4. Academic Integrity Violations (Evasion/Cheat keywords)
  const fullContent = `${mainText} ${fileDescription} ${location}`.toLowerCase();
  const integrityKeywords = [
    "humanizer",
    "bypass turnitin",
    "evasi detektor",
    "plagiarism bypass",
    "sitasi palsu",
    "skripsi otomatis",
    "buat data palsu",
    "jasa skripsi",
    "evasion helper",
  ];
  if (integrityKeywords.some((kw) => fullContent.includes(kw))) {
    return {
      canSubmit: false,
      severity: "error",
      code: "INTEGRITY_VIOLATION",
      title: "Pelanggaran integritas akademik",
      message: "Input Anda mengandung kata kunci manipulasi data, bypass plagiarisme, atau manipulasi sitasi yang dilarang keras di NaLI.",
      suggestions: [
        "Gunakan bahan kajian riil hasil penelitian/praktikum mandiri.",
        "Gunakan referensi asli yang valid.",
      ],
    };
  }

  // 5. Unsupported Features (Uploads, Payments, Source Verification)
  const uploadKeywords = ["unggah pdf", "upload pdf", "upload file", "unggah doc", "unggah berkas"];
  if (uploadKeywords.some((kw) => fullContent.includes(kw))) {
    return {
      canSubmit: true, // Warn but do not block completely
      severity: "warning",
      code: "UNSUPPORTED_UPLOAD",
      title: "Unggah file belum aktif di CP1",
      message: "Sistem observasi berkas file masih dalam tahap persiapan. Harap langsung tempelkan (copy-paste) teks isi catatan observasi Anda di kolom input utama.",
      suggestions: ["Salin isi berkas kajian ke dalam text area utama."],
    };
  }

  const verifKeywords = ["verifikasi database resmi", "ncbi live lookup", "crossref lookup", "source check active"];
  if (verifKeywords.some((kw) => fullContent.includes(kw))) {
    return {
      canSubmit: true,
      severity: "info",
      code: "UNSUPPORTED_VERIFICATION",
      title: "Verifikasi sumber belum aktif di CP1",
      message: "Fitur lookup literatur eksternal belum diaktifkan di MVP ini. Rujukan akan ditulis sebagai penanda draf internal.",
      suggestions: ["Periksa kebenaran rujukan sumber secara manual."],
    };
  }

  const paymentKeywords = ["bayar pro", "beli kredit", "top up pack", "midtrans checkout"];
  if (paymentKeywords.some((kw) => fullContent.includes(kw))) {
    return {
      canSubmit: true,
      severity: "warning",
      code: "UNSUPPORTED_PAYMENTS",
      title: "Sistem pembayaran belum aktif",
      message: "Sistem checkout Midtrans ditangguhkan. Fitur salin laporan Markdown/HTML gratis digunakan di workspace.",
      suggestions: ["Gunakan tombol 'Salin Markdown' di workspace laporan."],
    };
  }

  // 6. URL validation
  if (sourceUrls.length > 0) {
    const urls = sourceUrls.split(/[\s,;\n]+/).filter(Boolean);
    const badUrl = urls.find((u) => !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(u));
    if (badUrl) {
      return {
        canSubmit: false,
        severity: "error",
        code: "MALFORMED_URL",
        title: "Format URL rujukan salah",
        message: `Tautan "${badUrl.slice(0, 30)}${badUrl.length > 30 ? "..." : ""}" tidak valid. URL harus diawali dengan http:// atau https://.`,
        suggestions: ["Pastikan menyalin tautan web rujukan secara utuh dengan protokol http/https."],
      };
    }
  }

  // 7. Too Short validation
  // MainText is provided but too short
  if (mainText.length > 0 && mainText.length < 15) {
    return {
      canSubmit: false,
      severity: "error",
      code: "TOO_SHORT",
      title: "Materi terlalu singkat",
      message: "Catatan atau petunjuk laporan terlalu pendek (minimal 15 karakter). Berikan objek dan rincian awal kajian Anda.",
      suggestions: ["Tambahkan detail observasi, metode pengamatan, atau tujuan laporan."],
    };
  }

  // 8. Weak Beginner Input (Warn, but allowed to submit)
  if (mainText.length > 0 && mainText.length < 40) {
    return {
      canSubmit: true,
      severity: "warning",
      code: "WEAK_INPUT",
      title: "Materi observasi minim",
      message: "Bahan kajian kurang dari 40 karakter. NaLI tetap dapat menyusun draft panduan, namun draf akan menjadi sangat mendasar.",
      suggestions: ["Tambahkan minimal satu paragraf data deskripsi agar draf laporan lebih kuat."],
    };
  }

  // 9. Overlong Input Warning (Allow but warn about clipping/performance)
  if (mainText.length > 6000) {
    return {
      canSubmit: true,
      severity: "warning",
      code: "INPUT_TOO_LONG",
      title: "Input sangat panjang",
      message: `Teks Anda (${mainText.length} karakter) melebihi rekomendasi 6.000 karakter. Bagian akhir teks mungkin terpotong.`,
      suggestions: ["Ringkas catatan lapangan Anda atau buat draf per bagian."],
    };
  }

  return OK_ISSUE;
}

/**
 * Performs client-side validation of follow-up chat query inputs in workspace.
 */
export function validateComposerInput(query: string): ValidationIssue {
  const trimmed = query.trim();

  // 1. Empty check
  if (trimmed.length === 0) {
    return {
      canSubmit: false,
      severity: "error",
      code: "EMPTY_QUERY",
      title: "Kueri kosong",
      message: "Masukkan pesan instruksi atau revisi laporan terlebih dahulu.",
      suggestions: ["Tulis instruksi seperti: 'Tambahkan analisis vegetasi di bab 2'."],
    };
  }

  // 2. Too short
  if (trimmed.length < 4) {
    return {
      canSubmit: false,
      severity: "error",
      code: "QUERY_TOO_SHORT",
      title: "Instruksi terlalu pendek",
      message: "Tuliskan revisi yang jelas agar asisten AI mengerti maksud perubahan laporan.",
      suggestions: ["Tambahkan setidaknya 4 karakter rincian instruksi."],
    };
  }

  // 3. Spam check
  if (hasRepetitiveSpam(trimmed)) {
    return {
      canSubmit: false,
      severity: "error",
      code: "SPAM_DETECTED",
      title: "Kueri mengandung spam",
      message: "Instruksi mengandung karakter berulang berlebihan.",
      suggestions: ["Tulis revisi dalam bahasa manusia normal."],
    };
  }

  // 4. Integrity check
  const lowerQuery = trimmed.toLowerCase();
  const integrityKeywords = [
    "humanizer",
    "bypass turnitin",
    "evasi detektor",
    "plagiarism bypass",
    "sitasi palsu",
    "buat data palsu",
    "jasa skripsi",
  ];
  if (integrityKeywords.some((kw) => lowerQuery.includes(kw))) {
    return {
      canSubmit: false,
      severity: "error",
      code: "INTEGRITY_VIOLATION",
      title: "Pelanggaran integritas akademik",
      message: "Instruksi Anda melanggar ketentuan integritas akademik NaLI (misal menyamarkan plagiarisme atau membuat sitasi palsu).",
      suggestions: ["Fokuslah pada perbaikan struktur bahasa atau penambahan bab pembahasan rujukan riil."],
    };
  }

  // 5. Unsupported Features
  if (lowerQuery.includes("upload") || lowerQuery.includes("unggah")) {
    return {
      canSubmit: true,
      severity: "warning",
      code: "UNSUPPORTED_UPLOAD",
      title: "Unggah file belum aktif",
      message: "Pengunggahan berkas rujukan tidak didukung dalam chat interaktif. Silakan salin isi teks secara manual.",
      suggestions: ["Salin isi referensi dan tempelkan langsung ke chat."],
    };
  }

  return OK_ISSUE;
}

/**
 * Maps validation issues to SafeErrorState for simple NaliAlert compatibility.
 */
export function normalizeValidationIssue(issue: ValidationIssue): {
  message: string;
  code: string;
  status: number;
} {
  return {
    message: `${issue.title}: ${issue.message}`,
    code: issue.code,
    status: 400,
  };
}

/**
 * Returns severity of input validation.
 */
export function getValidationSeverity(issue: ValidationIssue): ValidationSeverity {
  return issue.severity;
}
