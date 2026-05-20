export const PUBLIC_REPORT_DISCLAIMER =
  "Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh digunakan untuk memalsukan data, mengarang referensi, melakukan plagiarisme, atau mengklaim karya AI sebagai karya final tanpa revisi.";

export const START_FROM_ZERO_DISCLAIMER =
  "Panduan ini belum menjadi draft laporan berbasis bukti karena bahan observasi atau sumber belum tersedia. Pengguna perlu mengumpulkan data, catatan, foto, sumber, atau hasil pengamatan terlebih dahulu sebelum NaLI dapat menyusun draft laporan.";

export const DRAFT_LABEL = "Draft bantuan belajar/penulisan berbasis bukti.";
export const START_FROM_ZERO_LABEL = "Panduan awal, belum menjadi draft laporan berbasis bukti.";
export const SOURCE_VERIFICATION_MVP_STATUS = "Source verification belum aktif di MVP ini.";

export const reportTemplates = [
  "Laporan Observasi Lingkungan",
  "Laporan Praktikum Biologi",
  "Laporan Kerja Lapangan Geografi",
  "Laporan Kegiatan Proyek Lingkungan",
  "Laporan Field Trip Sekolah",
  "Laporan KKN Lingkungan",
  "Laporan Survei Flora/Fauna Dasar",
] as const;

export const userRoles = [
  "pengguna",
  "siswa",
  "mahasiswa",
  "guru",
  "staf lapangan",
  "NGO/CSR",
  "peneliti junior",
  "komunitas",
] as const;

export type ReportMode = "draft_from_materials" | "start_from_zero";
export type ReportTemplate = (typeof reportTemplates)[number];
export type UserRole = (typeof userRoles)[number];

export type ReportRequestInput = {
  mode?: string;
  reportTemplate?: string;
  selectedTemplate?: string;
  template?: string;
  mainText?: string;
  notes?: string;
  topic?: string;
  title?: string;
  userRole?: string;
  role?: string;
  sourceUrls?: string | string[];
  location?: string;
  fileDescription?: string;
  uploadedFileNote?: string;
  integrityConsent?: boolean;
  integrityAccepted?: boolean;
};

export type ReportRequest = {
  mode: ReportMode;
  reportTemplate: ReportTemplate;
  title: string;
  role: UserRole;
  mainText: string;
  topic: string;
  sourceUrls: string[];
  location: string;
  fileDescription: string;
  integrityConsent: true;
};

export type EvidenceRow = {
  id: string;
  material_type: "catatan" | "url" | "lokasi" | "file_placeholder";
  summary: string;
  user_provided: true;
  verification_status: string;
};

export type DraftReport = {
  id: string;
  mode: "draft_from_materials";
  title: string;
  report_type: string;
  created_at: string;
  generated_at: string;
  status: string;
  model_used: string;
  draft_label: typeof DRAFT_LABEL;
  executive_summary: string;
  background: string;
  objective: string;
  method_or_materials: string;
  findings: string[];
  preliminary_analysis: string;
  discussion: string;
  conclusion: string;
  evidence_table: EvidenceRow[];
  source_notes: string[];
  source_verification_status: typeof SOURCE_VERIFICATION_MVP_STATUS;
  uncertainty_note: string;
  additional_evidence_needed: string[];
  user_review_checklist: string[];
  human_review_reminder: string;
  disclaimer: typeof PUBLIC_REPORT_DISCLAIMER;
  next_user_steps: string[];
  is_mock: boolean;
};

export type StartFromZeroGuide = {
  id: string;
  mode: "start_from_zero";
  title: string;
  report_type: string;
  created_at: string;
  generated_at: string;
  status: string;
  model_used: string;
  label: typeof START_FROM_ZERO_LABEL;
  topic_framing: string;
  suggested_outline: string[];
  observation_questions: string[];
  field_note_template: string[];
  evidence_checklist: string[];
  source_search_checklist: string[];
  safety_or_ethics_note: string;
  integrity_note: string;
  disclaimer: typeof START_FROM_ZERO_DISCLAIMER;
  next_steps: string[];
  is_mock: boolean;
};

export type ReportResult = DraftReport | StartFromZeroGuide;
export type EvidenceReport = ReportResult;

type ValidationResult =
  | {
      success: true;
      data: ReportRequest;
    }
  | {
      success: false;
      error: string;
      field?: keyof ReportRequestInput;
    };

const forbiddenWording = [
  /generate\s+tugas\s+final/i,
  /buat\s+skripsi\s+selesai/i,
  /kerjakan\s+tugas\s+saya/i,
  /anti\s+ketahuan\s+dosen/i,
  /bebas\s+plagiarisme\s+dijamin/i,
  /paper\s+otomatis/i,
  /skripsi\s+otomatis/i,
  /dijamin\s+aman/i,
  /verified\s+source/i,
  /payment\s+aktif/i,
];

const issueProfiles = [
  {
    key: "erosi",
    match: /erosi|terkikis|longsor|tebing sungai|abrasi/i,
    label: "Erosi",
    evidence: [
      "Foto kondisi tebing sungai",
      "Titik lokasi pengamatan lebih spesifik",
      "Tanggal dan waktu observasi",
      "Perkiraan panjang area terdampak",
      "Kondisi cuaca saat pengamatan",
      "Aktivitas manusia di sekitar lokasi",
      "Perubahan aliran air yang terlihat",
      "Sumber pendukung tentang erosi sungai atau pengelolaan kawasan",
    ],
  },
  {
    key: "sampah",
    match: /sampah|plastik|limbah|pencemar|keruh|bau|kualitas air/i,
    label: "Kualitas Lingkungan",
    evidence: [
      "Foto kondisi sampah atau air",
      "Tanggal dan waktu observasi",
      "Deskripsi warna, bau, dan kondisi visual air",
      "Perkiraan sumber sampah atau limbah jika terlihat",
      "Catatan aktivitas manusia di sekitar lokasi",
      "Sumber pendukung tentang pencemaran sungai atau kualitas air",
    ],
  },
  {
    key: "banjir",
    match: /banjir|genangan|air naik|drainase/i,
    label: "Risiko Banjir",
    evidence: [
      "Foto area genangan",
      "Tanggal dan waktu observasi",
      "Kondisi hujan sebelum pengamatan",
      "Tinggi genangan secara perkiraan visual",
      "Kondisi drainase atau aliran air",
      "Sumber pendukung tentang banjir lokal atau drainase kawasan",
    ],
  },
  {
    key: "biodiversitas",
    match: /flora|fauna|satwa|burung|ikan|serangga|pohon|mangrove|habitat/i,
    label: "Biodiversitas",
    evidence: [
      "Foto organisme atau habitat",
      "Tanggal dan waktu pengamatan",
      "Lokasi umum pengamatan",
      "Deskripsi ciri visual yang benar-benar terlihat",
      "Jumlah individu jika dihitung langsung",
      "Sumber pendukung identifikasi dari referensi yang dapat diperiksa",
    ],
  },
];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isReportTemplate(value: string): value is ReportTemplate {
  return reportTemplates.includes(value as ReportTemplate);
}

function isUserRole(value: string): value is UserRole {
  return userRoles.includes(value as UserRole);
}

function normalizeTemplate(value: string) {
  return isReportTemplate(value) ? value : "Laporan Observasi Lingkungan";
}

function normalizeMode(value: string): ReportMode {
  return value === "start_from_zero" ? "start_from_zero" : "draft_from_materials";
}

function normalizeRole(value: string): UserRole {
  return isUserRole(value) ? value : "pengguna";
}

function toTitleCase(value: string) {
  return normalizeWhitespace(value)
    .split(" ")
    .map((word) => {
      if (word.length <= 2 && word === word.toUpperCase()) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function parseSourceUrls(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value.join("\n") : clean(value);

  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateUrls(urls: string[]) {
  for (const url of urls) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

export function containsForbiddenWording(value: string) {
  return forbiddenWording.some((pattern) => pattern.test(value));
}

export function hasAtLeastOneMaterial(
  input: Pick<ReportRequestInput, "mainText" | "notes" | "sourceUrls" | "location" | "fileDescription" | "uploadedFileNote">,
) {
  return [
    input.mainText,
    input.notes,
    Array.isArray(input.sourceUrls) ? input.sourceUrls.join("\n") : input.sourceUrls,
    input.location,
    input.fileDescription,
    input.uploadedFileNote,
  ].some((value) => clean(value).length > 0);
}

function detectIssue(value: string) {
  return issueProfiles.find((profile) => profile.match.test(value)) ?? null;
}

function detectLocation(value: string) {
  const explicit = value.match(/\b(?:di|ke|dari)\s+([A-Za-zÀ-ÿ0-9\s.-]{3,48})(?:[.,;]|\s(?:dan|dengan|yang|setelah)\b|$)/i);
  if (!explicit) {
    return "";
  }

  return toTitleCase(explicit[1].replace(/\b(tapi|belum|karena)\b.*$/i, "").trim());
}

function summarize(value: string, maxLength = 180) {
  const normalized = normalizeWhitespace(value);

  if (!normalized) {
    return "";
  }

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
}

function inferTitle(input: {
  explicitTitle: string;
  mode: ReportMode;
  reportTemplate: ReportTemplate;
  mainText: string;
  topic: string;
  location: string;
}) {
  if (input.explicitTitle) {
    return input.explicitTitle;
  }

  const source = input.mainText || input.topic;
  const issue = detectIssue(source);
  const location = input.location || detectLocation(source);

  if (input.mode === "draft_from_materials" && issue && location) {
    return `Observasi ${issue.label} di ${location}`;
  }

  if (input.mode === "draft_from_materials" && issue) {
    return `Observasi ${issue.label}`;
  }

  if (input.mode === "start_from_zero") {
    if (/belum tahu topik|cari topik|mulai dari nol/i.test(source)) {
      return `Panduan Awal ${input.reportTemplate}`;
    }
    const first = summarize(source, 58);
    return first ? `Panduan Awal: ${toTitleCase(first)}` : `Panduan Awal ${input.reportTemplate}`;
  }

  const firstSentence = source.split(/[.!?]/)[0] ?? "";
  return firstSentence ? toTitleCase(summarize(firstSentence, 68)) : input.reportTemplate;
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `report-${Date.now().toString(36)}`;
}

export function formatJakartaDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "long",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}.${get("minute")} WIB`;
}

export function validateReportRequest(input: ReportRequestInput): ValidationResult {
  const mode = normalizeMode(clean(input.mode));
  const reportTemplate = normalizeTemplate(clean(input.reportTemplate) || clean(input.selectedTemplate) || clean(input.template));
  const mainText = clean(input.mainText) || clean(input.notes);
  const topic = clean(input.topic) || (mode === "start_from_zero" ? mainText : "");
  const sourceUrls = parseSourceUrls(input.sourceUrls);
  const location = clean(input.location);
  const fileDescription = clean(input.fileDescription) || clean(input.uploadedFileNote);
  const role = normalizeRole(clean(input.userRole) || clean(input.role));
  const integrityConsent = input.integrityConsent === true || input.integrityAccepted === true;
  const title = inferTitle({
    explicitTitle: clean(input.title),
    location,
    mainText,
    mode,
    reportTemplate,
    topic,
  });

  if (!integrityConsent) {
    return {
      error: "Centang pernyataan integritas dulu sebelum melanjutkan.",
      field: "integrityConsent",
      success: false,
    };
  }

  if (mode === "draft_from_materials" && !hasAtLeastOneMaterial({ fileDescription, location, mainText, sourceUrls, uploadedFileNote: "" })) {
    return {
      error: "Masukkan minimal satu bahan dulu: catatan, lokasi, URL, atau ringkasan file.",
      field: "mainText",
      success: false,
    };
  }

  if (mode === "start_from_zero" && !mainText && !topic) {
    return {
      error: "Tulis dulu topik atau jenis laporan yang ingin kamu mulai.",
      field: "mainText",
      success: false,
    };
  }

  if (sourceUrls.length > 0 && !validateUrls(sourceUrls)) {
    return {
      error: "URL sumber harus diawali http:// atau https:// dan dapat dibaca sebagai URL.",
      field: "sourceUrls",
      success: false,
    };
  }

  return {
    data: {
      fileDescription,
      integrityConsent: true,
      location,
      mainText,
      mode,
      reportTemplate,
      role,
      sourceUrls,
      title,
      topic,
    },
    success: true,
  };
}

export function buildEvidenceTable(input: ReportRequest): EvidenceRow[] {
  const rows: EvidenceRow[] = [];

  if (input.mainText) {
    rows.push({
      id: "EV-01",
      material_type: "catatan",
      summary: summarize(input.mainText),
      user_provided: true,
      verification_status: "Diberikan oleh pengguna; belum diverifikasi secara independen di MVP ini.",
    });
  }

  for (const url of input.sourceUrls) {
    rows.push({
      id: `EV-${String(rows.length + 1).padStart(2, "0")}`,
      material_type: "url",
      summary: url,
      user_provided: true,
      verification_status: "Diberikan oleh pengguna; belum diverifikasi oleh Source Verification di MVP ini.",
    });
  }

  if (input.location) {
    rows.push({
      id: `EV-${String(rows.length + 1).padStart(2, "0")}`,
      material_type: "lokasi",
      summary: toTitleCase(input.location),
      user_provided: true,
      verification_status: "Diberikan oleh pengguna; lokasi belum diverifikasi secara independen di MVP ini.",
    });
  }

  if (input.fileDescription) {
    rows.push({
      id: `EV-${String(rows.length + 1).padStart(2, "0")}`,
      material_type: "file_placeholder",
      summary: input.fileDescription,
      user_provided: true,
      verification_status: "Upload belum aktif; ringkasan file dicatat sebagai bahan pengguna.",
    });
  }

  return rows.map((row, index) => ({
    ...row,
    id: `EV-${String(index + 1).padStart(2, "0")}`,
  }));
}

function additionalEvidenceFor(input: ReportRequest) {
  const profile = detectIssue(`${input.mainText} ${input.title} ${input.topic}`);

  return (
    profile?.evidence ?? [
      "Tanggal dan waktu observasi",
      "Foto atau dokumentasi kondisi lapangan",
      "Lokasi umum pengamatan",
      "Catatan cuaca atau kondisi sekitar",
      "Deskripsi objek yang diamati",
      "Sumber pendukung yang dapat diperiksa",
    ]
  );
}

function findingsFromInput(input: ReportRequest) {
  const findings = [];
  const text = input.mainText;

  if (text) {
    findings.push(`Pengguna memberikan catatan: ${summarize(text, 220)}`);
  }

  if (input.sourceUrls.length > 0) {
    findings.push("Pengguna memberikan URL sumber; URL dicatat sebagai bahan tetapi belum diverifikasi otomatis.");
  }

  if (input.location) {
    findings.push(`Pengguna menyebut lokasi: ${toTitleCase(input.location)}. Lokasi belum diverifikasi sebagai data lapangan.`);
  }

  if (input.fileDescription) {
    findings.push(`Pengguna menyebut lampiran/file: ${input.fileDescription}. Upload file belum aktif di MVP ini.`);
  }

  return findings.length > 0 ? findings : ["Belum ada temuan faktual yang dapat disusun dari bahan pengguna."];
}

export function buildMockDraftReport(input: ReportRequest, modelUsed = "NaLI Preview Engine"): DraftReport {
  const evidenceTable = buildEvidenceTable(input);
  const issue = detectIssue(`${input.mainText} ${input.title}`);
  const location = input.location || detectLocation(input.mainText);
  const createdAt = formatJakartaDate();

  return {
    additional_evidence_needed: additionalEvidenceFor(input),
    background: `Draft ini disusun dari bahan yang diberikan pengguna untuk ${input.reportTemplate}${location ? ` di ${toTitleCase(location)}` : ""}. Bagian ini belum menambahkan sumber eksternal, statistik, atau klaim ilmiah baru.`,
    conclusion:
      "Kesimpulan sementara hanya menyatakan bahwa bahan pengguna sudah dapat dijadikan awal laporan. Kesimpulan akhir membutuhkan bukti tambahan, verifikasi sumber, dan review manusia.",
    created_at: createdAt,
    disclaimer: PUBLIC_REPORT_DISCLAIMER,
    discussion:
      "Pembahasan perlu menjaga batas bahan. NaLI dapat merapikan struktur dan menunjukkan kebutuhan bukti, tetapi tidak menyatakan penyebab, angka, atau validitas akademik tanpa data pendukung yang diperiksa pengguna.",
    draft_label: DRAFT_LABEL,
    evidence_table: evidenceTable,
    executive_summary: `NaLI menyusun draft awal "${input.title}" dari ${evidenceTable.length} bahan pengguna. Draft ini membantu menyusun struktur laporan dan menandai bagian yang masih perlu bukti tambahan.`,
    findings: findingsFromInput(input),
    generated_at: new Date().toISOString(),
    human_review_reminder: "Validasi akhir tetap berada pada pengguna, guru, dosen, pembimbing, reviewer, atau ahli yang relevan.",
    id: makeId(),
    is_mock: true,
    method_or_materials:
      "Metode/bahan dalam draft ini hanya berasal dari input pengguna: catatan, URL, lokasi, atau ringkasan file. Upload file, ekstraksi PDF, dan source verification otomatis belum aktif.",
    mode: "draft_from_materials",
    model_used: modelUsed,
    next_user_steps: [
      "Periksa apakah semua temuan benar-benar berasal dari bahan yang kamu punya.",
      "Tambahkan foto, tanggal, lokasi umum, atau data pengamatan jika tersedia.",
      "Buka dan cek setiap URL sebelum dipakai sebagai sumber.",
      "Edit bahasa dan format sesuai aturan sekolah, kampus, atau lembaga.",
    ],
    objective: `Menyusun ${input.reportTemplate.toLowerCase()} berbasis bahan pengguna, dengan evidence table, uncertainty note, dan checklist review.`,
    preliminary_analysis: issue
      ? `Berdasarkan catatan pengguna, isu utama yang dapat ditelusuri adalah ${issue.label.toLowerCase()}. Draft ini belum dapat menyimpulkan penyebab atau dampak karena bukti pendukung masih terbatas.`
      : "Berdasarkan bahan pengguna, NaLI baru dapat menyusun struktur awal dan daftar kebutuhan bukti. Analisis harus diperkuat dengan catatan observasi, dokumentasi, dan sumber yang diperiksa.",
    report_type: input.reportTemplate,
    source_notes:
      input.sourceUrls.length > 0
        ? input.sourceUrls.map((url) => `${url} - diberikan oleh pengguna; belum diverifikasi otomatis.`)
        : ["Belum ada URL sumber. Source verification belum aktif di MVP ini."],
    source_verification_status: SOURCE_VERIFICATION_MVP_STATUS,
    status: "DEMO/MOCK - NaLI preview engine unavailable or not configured.",
    title: input.title,
    uncertainty_note:
      "Uncertainty note: draft ini bergantung pada bahan pengguna. NaLI belum memverifikasi URL, lokasi, file, angka, atau klaim ilmiah. Jangan menambahkan sitasi, statistik, atau kesimpulan final tanpa pemeriksaan manusia.",
    user_review_checklist: [
      "Apakah setiap temuan berasal dari catatan, URL, lokasi, atau lampiran yang benar-benar ada?",
      "Apakah ada klaim yang perlu dihapus karena belum punya bukti?",
      "Apakah sumber yang diberikan sudah dibuka dan diperiksa manual?",
      "Apakah format laporan sesuai instruksi guru, dosen, atau lembaga?",
      "Apakah disclaimer tetap disertakan saat dokumen dipakai atau diekspor?",
    ],
  };
}

export function buildMockStartGuide(input: ReportRequest, modelUsed = "NaLI Preview Engine"): StartFromZeroGuide {
  const createdAt = formatJakartaDate();
  const source = input.mainText || input.topic || input.reportTemplate;
  const riverTopic = /sungai|air|banjir|erosi|limbah|sampah/i.test(source);
  const biodiversityTopic = /flora|fauna|satwa|burung|pohon|mangrove|habitat/i.test(source);

  return {
    created_at: createdAt,
    disclaimer: START_FROM_ZERO_DISCLAIMER,
    evidence_checklist: riverTopic
      ? [
          "Foto lokasi pengamatan",
          "Tanggal dan waktu observasi",
          "Catatan cuaca saat pengamatan",
          "Deskripsi kondisi air secara visual",
          "Catatan sampah, erosi, bau, atau aktivitas sekitar",
          "Lokasi umum tanpa membahayakan privasi atau keselamatan",
        ]
      : biodiversityTopic
        ? [
            "Foto organisme atau habitat",
            "Tanggal dan waktu pengamatan",
            "Ciri visual yang benar-benar terlihat",
            "Jumlah individu jika dihitung langsung",
            "Lokasi umum pengamatan",
            "Catatan kondisi habitat sekitar",
          ]
        : [
            "Foto atau dokumentasi objek observasi",
            "Tanggal dan waktu pengamatan",
            "Lokasi umum",
            "Catatan kondisi sekitar",
            "Data sederhana yang bisa diamati langsung",
            "Sumber pendukung yang dapat diperiksa",
          ],
    field_note_template: [
      "Tanggal dan waktu:",
      "Lokasi umum:",
      "Objek atau kondisi yang diamati:",
      "Apa yang terlihat secara langsung:",
      "Bukti yang dikumpulkan:",
      "Pertanyaan atau hal yang belum pasti:",
    ],
    generated_at: new Date().toISOString(),
    id: makeId(),
    integrity_note:
      "Panduan ini membantu kamu memulai observasi. NaLI belum menyusun temuan, analisis, atau kesimpulan laporan karena bahan belum tersedia.",
    is_mock: true,
    label: START_FROM_ZERO_LABEL,
    mode: "start_from_zero",
    model_used: modelUsed,
    next_steps: [
      "Pilih satu topik yang bisa diamati langsung dalam waktu dekat.",
      "Kumpulkan catatan, foto, lokasi umum, dan sumber pendukung.",
      "Kembali ke mode Saya sudah punya bahan untuk membuat draft berbasis bukti.",
    ],
    observation_questions: riverTopic
      ? [
          "Apa kondisi air secara visual?",
          "Apakah ada sampah?",
          "Apakah ada erosi di tepi sungai?",
          "Apakah ada bau menyengat?",
          "Apa aktivitas manusia di sekitar sungai?",
        ]
      : [
          "Apa objek atau kondisi yang bisa diamati langsung?",
          "Apa perubahan atau masalah yang terlihat?",
          "Bukti apa yang bisa dikumpulkan tanpa mengganggu lingkungan?",
          "Apa informasi yang masih belum pasti?",
          "Sumber apa yang perlu dicari untuk memahami konteks?",
        ],
    report_type: input.reportTemplate,
    safety_or_ethics_note:
      "Utamakan keselamatan, jangan masuk area berbahaya, jangan mengganggu satwa atau habitat, dan jangan membuka koordinat sensitif di ruang publik.",
    source_search_checklist: riverTopic
      ? [
          "Sumber tentang pencemaran sungai",
          "Sumber tentang erosi sungai",
          "Data pemerintah lokal jika tersedia",
          "Pedoman observasi lingkungan sederhana",
        ]
      : [
          "Sumber pengantar sesuai topik laporan",
          "Data pemerintah atau lembaga resmi jika tersedia",
          "Artikel edukasi dari institusi kredibel",
          "Pedoman metode observasi sederhana",
        ],
    status: "DEMO/MOCK - NaLI preview engine unavailable or not configured.",
    suggested_outline: [
      "Pendahuluan",
      "Tujuan observasi",
      "Lokasi dan waktu pengamatan",
      "Metode observasi sederhana",
      "Hasil pengamatan",
      "Pembahasan",
      "Kesimpulan",
    ],
    title: input.title,
    topic_framing: riverTopic
      ? "Topik dapat diarahkan pada kondisi fisik sungai, sampah, erosi, kualitas air visual, atau aktivitas manusia di sekitar bantaran. Ini masih panduan awal, bukan temuan lapangan."
      : "Topik perlu dipilih dari hal yang bisa diamati langsung dan dibuktikan. Mulai dari objek, tempat, kondisi, atau perubahan yang dapat kamu catat sendiri.",
  };
}

export const buildMockEvidenceReport = buildMockDraftReport;

export function buildMockResult(input: ReportRequest, modelUsed = "NaLI Preview Engine"): ReportResult {
  return input.mode === "start_from_zero" ? buildMockStartGuide(input, modelUsed) : buildMockDraftReport(input, modelUsed);
}

export function buildReportPrompt(input: ReportRequest) {
  const commonRules = [
    "You are NaLI by NatIve.",
    "Use Bahasa Indonesia.",
    "Return JSON only. No markdown fences. No prose outside JSON.",
    "Do not invent citations, DOI, statistics, field observations, coordinates, source verification, authors, publishers, or timestamps.",
    "If URLs are provided, label them as user-provided and not yet verified.",
    `Source verification limitation: ${SOURCE_VERIFICATION_MVP_STATUS}`,
    "Human review remains required.",
  ];

  if (input.mode === "start_from_zero") {
    return [
      ...commonRules,
      `label must be exactly: ${START_FROM_ZERO_LABEL}`,
      `disclaimer must be exactly: ${START_FROM_ZERO_DISCLAIMER}`,
      "Generate guidance only, not report findings, not a final report draft.",
      "Schema: { mode, title, report_type, created_at, status, model_used, label, topic_framing, suggested_outline: string[], observation_questions: string[], field_note_template: string[], evidence_checklist: string[], source_search_checklist: string[], safety_or_ethics_note, integrity_note, disclaimer, next_steps: string[] }",
      "",
      `Mode: ${input.mode}`,
      `Template: ${input.reportTemplate}`,
      `User request/topic: ${input.mainText || input.topic}`,
    ].join("\n");
  }

  return [
    ...commonRules,
    `draft_label must be exactly: ${DRAFT_LABEL}`,
    `disclaimer must be exactly: ${PUBLIC_REPORT_DISCLAIMER}`,
    "Use only user-provided materials for facts. You may structure, clarify, infer safe title/topic, and suggest missing evidence.",
    "Schema: { mode, title, report_type, created_at, status, model_used, draft_label, executive_summary, background, objective, method_or_materials, findings: string[], preliminary_analysis, evidence_table: { id, material_type, summary, user_provided, verification_status }[], source_notes: string[], source_verification_status, uncertainty_note, additional_evidence_needed: string[], user_review_checklist: string[], disclaimer, next_user_steps: string[] }",
    "",
    `Mode: ${input.mode}`,
    `Template: ${input.reportTemplate}`,
    `Title: ${input.title}`,
    `Role: ${input.role}`,
    `Main material: ${input.mainText || "(none)"}`,
    `URLs: ${input.sourceUrls.length ? input.sourceUrls.join("; ") : "(none)"}`,
    `Location: ${input.location || "(none)"}`,
    `File description: ${input.fileDescription || "(none)"}`,
  ].join("\n");
}

function safeStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((item) => typeof item === "string") && value.length > 0 ? value : fallback;
}

export function normalizeProviderResult(raw: Record<string, unknown>, input: ReportRequest, modelUsed: string): ReportResult {
  const fallback = buildMockResult(input, modelUsed);
  const rawText = JSON.stringify(raw);

  if (containsForbiddenWording(rawText)) {
    return fallback;
  }

  if (input.mode === "start_from_zero") {
    const guideFallback = fallback as StartFromZeroGuide;
    const guideRaw = raw as Partial<StartFromZeroGuide>;

    return {
      ...guideFallback,
      ...guideRaw,
      disclaimer: START_FROM_ZERO_DISCLAIMER,
      generated_at: new Date().toISOString(),
      id: makeId(),
      is_mock: false,
      label: START_FROM_ZERO_LABEL,
      mode: "start_from_zero",
      model_used: modelUsed,
      next_steps: safeStringArray(guideRaw.next_steps, guideFallback.next_steps),
      status: "AI_GENERATED_NALI",
      suggested_outline: safeStringArray(guideRaw.suggested_outline, guideFallback.suggested_outline),
    };
  }

  const draftFallback = fallback as DraftReport;
  const draftRaw = raw as Partial<DraftReport>;

  return {
    ...draftFallback,
    ...draftRaw,
    additional_evidence_needed: safeStringArray(
      draftRaw.additional_evidence_needed,
      draftFallback.additional_evidence_needed,
    ),
    disclaimer: PUBLIC_REPORT_DISCLAIMER,
    draft_label: DRAFT_LABEL,
    evidence_table:
      Array.isArray(draftRaw.evidence_table) && draftRaw.evidence_table.length > 0
        ? draftRaw.evidence_table
        : draftFallback.evidence_table,
    findings: safeStringArray(draftRaw.findings, draftFallback.findings),
    generated_at: new Date().toISOString(),
    human_review_reminder:
      typeof draftRaw.human_review_reminder === "string" && draftRaw.human_review_reminder
        ? draftRaw.human_review_reminder
        : draftFallback.human_review_reminder,
    id: makeId(),
    is_mock: false,
    mode: "draft_from_materials",
    model_used: modelUsed,
    next_user_steps: safeStringArray(draftRaw.next_user_steps, draftFallback.next_user_steps),
    source_notes: safeStringArray(draftRaw.source_notes, draftFallback.source_notes),
    source_verification_status: SOURCE_VERIFICATION_MVP_STATUS,
    status: "AI_GENERATED_NALI",
    user_review_checklist: safeStringArray(draftRaw.user_review_checklist, draftFallback.user_review_checklist),
  };
}
