export type SafeErrorCategory =
  | "RATE_LIMIT"
  | "INTEGRITY_BLOCK"
  | "WEAK_INPUT"
  | "NETWORK_OR_SERVER"
  | "EXPORT_LOCKED"
  | "MODEL_ENTITLEMENT_REQUIRED"
  | "UNAUTHORIZED"
  | "GENERIC";

export type SafeErrorState = {
  category: SafeErrorCategory;
  title: string;
  explanation: string;
  nextStep: string;
  retryAfterSeconds?: number;
  severity: "info" | "warning" | "error" | "locked";
};

/**
 * Sanitizes input text, removing common server/API secret patterns, stack traces,
 * and internal provider jargon to prevent user exposure.
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message) return "";

  // Remove potential OpenRouter/API key fragments
  let sanitized = message
    .replace(/sk-[a-zA-Z0-9_-]{24,}/gi, "[API_KEY]")
    .replace(/[a-zA-Z0-9_-]{32,}/gi, (match) => {
      // Redact long hex/alphanumeric hashes that might be API keys or secret tokens
      return match.length > 40 ? "[SECRET]" : match;
    })
    .replace(/(openrouter|supabase|midtrans|openai|claude|gpt|gemini)/gi, "NaLI Engine");

  // Remove local stack traces
  sanitized = sanitized.replace(/at\s+[\w\d\s\.\\\/:\(\)-]+:\d+:\d+/g, "");
  // Remove absolute paths in the workspace
  sanitized = sanitized.replace(/\/Users\/[\w\d\s\.\\\/:-]+/g, "[internal_path]");

  return sanitized;
}

/**
 * Maps backend error status codes and error code strings into user-safe display structures.
 */
export function normalizePublicError(options: {
  status?: number;
  code?: string;
  message?: string;
  retryAfterSeconds?: number;
}): SafeErrorState {
  const code = options.code || "";
  const status = options.status || 200;
  const rawMsg = options.message || "";
  const retryAfter = options.retryAfterSeconds;

  // 1. RATE LIMIT / 429
  if (
    status === 429 ||
    code === "RATE_LIMIT" ||
    code === "rate_limit" ||
    rawMsg.toLowerCase().includes("terlalu banyak percobaan") ||
    rawMsg.toLowerCase().includes("rate limit")
  ) {
    const retryHint = retryAfter && retryAfter > 0 ? ` Coba lagi dalam ${retryAfter} detik.` : "";
    return {
      category: "RATE_LIMIT",
      title: "Batas percobaan tercapai",
      explanation: `Kamu telah mengirimkan terlalu banyak permintaan ke server dalam waktu singkat.${retryHint}`,
      nextStep: "Silakan tunggu beberapa saat sebelum mencoba kembali. Jangan me-refresh halaman berulang kali.",
      retryAfterSeconds: retryAfter,
      severity: "warning",
    };
  }

  // 2. INTEGRITY BLOCK / ACADEMIC BLOCKED (e.g. FAKE_CITATION_REQUEST, PLAGIARISM_EVASION, etc.)
  const integrityCodes = [
    "FAKE_CITATION_REQUEST",
    "PLAGIARISM_EVASION",
    "ACADEMIC_DISHONESTY",
    "DATA_FABRICATION",
    "INTEGRITY_VIOLATION",
  ];
  if (
    integrityCodes.includes(code.toUpperCase()) ||
    (status === 400 &&
      (rawMsg.toLowerCase().includes("plagiarisme") ||
        rawMsg.toLowerCase().includes("integritas") ||
        rawMsg.toLowerCase().includes("sitasi palsu") ||
        rawMsg.toLowerCase().includes("data palsu")))
  ) {
    return {
      category: "INTEGRITY_BLOCK",
      title: "Permintaan tidak bisa diproses",
      explanation:
        "NaLI tidak dapat memproses permintaan yang bertujuan membuat sitasi palsu, data palsu, menyamarkan plagiarisme, atau melanggar integritas akademik lainnya.",
      nextStep:
        "Gunakan catatan, data, atau referensi asli hasil pengamatanmu sendiri, atau buat draf panduan terlebih dahulu.",
      severity: "error",
    };
  }

  // 3. WEAK INPUT / MINIMAL CONTENT (e.g., length validations)
  if (
    code === "WEAK_INPUT" ||
    code === "INPUT_TOO_SHORT" ||
    rawMsg.toLowerCase().includes("minimal satu bahan") ||
    rawMsg.toLowerCase().includes("terlalu minim") ||
    rawMsg.toLowerCase().includes("tulis dulu topik")
  ) {
    return {
      category: "WEAK_INPUT",
      title: "Data masih terlalu minim",
      explanation:
        "Catatan atau bahan yang kamu masukkan masih terlalu pendek untuk dapat disusun menjadi draf laporan berbasis bukti.",
      nextStep:
        "Tambahkan detail observasi seperti metode, hasil pengamatan, lokasi, atau deskripsi bahan yang lebih lengkap.",
      severity: "info",
    };
  }

  // 4. EXPORT LOCKED / 402
  if (code === "MODEL_ENTITLEMENT_REQUIRED") {
    return {
      category: "MODEL_ENTITLEMENT_REQUIRED",
      title: "Model premium terkunci",
      explanation:
        "Obsidian dan Zephyr memerlukan entitlement atau kredit premium yang terverifikasi. Akses premium dan checkout/pembayaran belum diaktifkan di CP1.",
      nextStep: "Gunakan Peregrine untuk membuat starter draft yang tersedia saat ini.",
      severity: "locked",
    };
  }

  // 5. EXPORT LOCKED / 402
  if (
    status === 402 ||
    code === "insufficient_credits" ||
    code === "EXPORT_LOCKED" ||
    rawMsg.toLowerCase().includes("kredit") ||
    rawMsg.toLowerCase().includes("pembayaran")
  ) {
    return {
      category: "EXPORT_LOCKED",
      title: "Ekspor dokumen premium terkunci",
      explanation:
        "Fitur ekspor dokumen rapi (Markdown/PDF) saat ini belum diaktifkan karena sistem pembayaran masih dalam tahap persiapan (Midtrans ditangguhkan).",
      nextStep:
        "Draf laporan atau panduan awal tetap bisa dibaca dan disalin langsung melalui tombol 'Salin Markdown' di workspace.",
      severity: "locked",
    };
  }

  // 6. UNAUTHORIZED / 401 / 403
  if (status === 401 || status === 403 || code === "UNAUTHORIZED" || code === "ACCESS_DENIED") {
    return {
      category: "UNAUTHORIZED",
      title: "Akses tidak valid",
      explanation: "Kunci akses (token) laporan ini tidak valid atau sesi browser tidak sah untuk membaca dokumen.",
      nextStep: "Pastikan tautan yang kamu buka sudah benar, atau buka kembali dari halaman utama pembuat laporan.",
      severity: "error",
    };
  }

  // 7. SERVER / NETWORK FAILS (e.g. 502 Bad Gateway, 500, fetch errors)
  if (
    status >= 500 ||
    code === "SERVER_ERROR" ||
    rawMsg.toLowerCase().includes("koneksi") ||
    rawMsg.toLowerCase().includes("gagal menghubungi") ||
    rawMsg.toLowerCase().includes("fetch")
  ) {
    return {
      category: "NETWORK_OR_SERVER",
      title: "Koneksi atau server bermasalah",
      explanation: "Terjadi gangguan jaringan atau server AI sedang tidak merespons kueri saat ini.",
      nextStep: "Salin teks masukanmu terlebih dahulu untuk cadangan, lalu coba kirim ulang beberapa saat lagi.",
      severity: "error",
    };
  }

  // 8. GENERIC / DEFAULT
  return {
    category: "GENERIC",
    title: "Terjadi kesalahan",
    explanation: sanitizeErrorMessage(rawMsg) || "Terjadi kesalahan yang tidak terduga saat memproses permintaanmu.",
    nextStep: "Silakan coba lagi beberapa saat lagi. Jika kendala berlanjut, hubungi admin sistem.",
    severity: "error",
  };
}
