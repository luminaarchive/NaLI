export const PUBLIC_REPORT_DISCLAIMER =
  "Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh digunakan untuk memalsukan data, mengarang referensi, melakukan plagiarisme, atau mengklaim karya AI sebagai karya final tanpa revisi.";

export const DRAFT_LABEL = "Draft bantuan belajar/penulisan berbasis bukti.";
export const SOURCE_VERIFICATION_MVP_STATUS = "Source verification belum aktif di MVP ini.";

export const reportTemplates = [
  "Laporan Praktikum Biologi",
  "Laporan Observasi Lingkungan",
  "Laporan Kerja Lapangan Geografi",
  "Laporan Kegiatan Proyek Lingkungan",
  "Laporan Field Trip Sekolah",
  "Laporan KKN Lingkungan",
  "Laporan Survei Flora/Fauna Dasar",
] as const;

export const userRoles = [
  "siswa",
  "mahasiswa",
  "guru",
  "staf lapangan",
  "NGO/CSR",
  "peneliti junior",
  "komunitas",
] as const;

export type ReportTemplate = (typeof reportTemplates)[number];
export type UserRole = (typeof userRoles)[number];

export type ReportRequestInput = {
  template?: string;
  title?: string;
  role?: string;
  notes?: string;
  sourceUrls?: string;
  location?: string;
  uploadedFileNote?: string;
  integrityAccepted?: boolean;
};

export type ReportRequest = {
  template: ReportTemplate;
  title: string;
  role: UserRole;
  notes: string;
  sourceUrls: string[];
  location: string;
  uploadedFileNote: string;
  integrityAccepted: true;
};

export type EvidenceRow = {
  id: string;
  material_type: "catatan" | "url" | "lokasi" | "file_placeholder";
  summary: string;
  user_provided: true;
  verification_status: string;
};

export type EvidenceReport = {
  id: string;
  title: string;
  report_type: string;
  draft_label: typeof DRAFT_LABEL;
  executive_summary: string;
  background: string;
  objective: string;
  method_or_materials: string;
  findings: string[];
  discussion: string;
  conclusion: string;
  evidence_table: EvidenceRow[];
  source_notes: string[];
  source_verification_status: typeof SOURCE_VERIFICATION_MVP_STATUS;
  uncertainty_note: string;
  disclaimer: typeof PUBLIC_REPORT_DISCLAIMER;
  next_user_steps: string[];
  is_mock: boolean;
  generated_at: string;
};

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

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isReportTemplate(value: string): value is ReportTemplate {
  return reportTemplates.includes(value as ReportTemplate);
}

function isUserRole(value: string): value is UserRole {
  return userRoles.includes(value as UserRole);
}

export function parseSourceUrls(value: string) {
  return value
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

export function hasAtLeastOneMaterial(input: Pick<ReportRequestInput, "notes" | "sourceUrls" | "location" | "uploadedFileNote">) {
  return [input.notes, input.sourceUrls, input.location, input.uploadedFileNote].some((value) => clean(value).length > 0);
}

export function validateReportRequest(input: ReportRequestInput): ValidationResult {
  const template = clean(input.template);
  const title = clean(input.title);
  const role = clean(input.role);
  const notes = clean(input.notes);
  const sourceUrlsText = clean(input.sourceUrls);
  const location = clean(input.location);
  const uploadedFileNote = clean(input.uploadedFileNote);
  const sourceUrls = parseSourceUrls(sourceUrlsText);

  if (!isReportTemplate(template)) {
    return {
      error: "Pilih template laporan yang tersedia.",
      field: "template",
      success: false,
    };
  }

  if (!title) {
    return {
      error: "Isi judul laporan agar draft bisa disusun dengan konteks yang jelas.",
      field: "title",
      success: false,
    };
  }

  if (!isUserRole(role)) {
    return {
      error: "Pilih peran pengguna yang sesuai.",
      field: "role",
      success: false,
    };
  }

  if (!hasAtLeastOneMaterial({ location, notes, sourceUrls: sourceUrlsText, uploadedFileNote })) {
    return {
      error: "Masukkan minimal satu bahan: catatan, URL sumber, lokasi, atau keterangan file.",
      field: "notes",
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

  if (input.integrityAccepted !== true) {
    return {
      error: "Centang pernyataan integritas akademik sebelum membuat draft.",
      field: "integrityAccepted",
      success: false,
    };
  }

  return {
    data: {
      integrityAccepted: true,
      location,
      notes,
      role,
      sourceUrls,
      template,
      title,
      uploadedFileNote,
    },
    success: true,
  };
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `report-${Date.now().toString(36)}`;
}

function summarize(value: string, fallback: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

export function buildEvidenceTable(input: ReportRequest): EvidenceRow[] {
  const rows: EvidenceRow[] = [];

  if (input.notes) {
    rows.push({
      id: "EV-01",
      material_type: "catatan",
      summary: summarize(input.notes, "Catatan utama pengguna"),
      user_provided: true,
      verification_status: "Provided by user; not independently verified in this MVP.",
    });
  }

  for (const url of input.sourceUrls) {
    rows.push({
      id: `EV-${String(rows.length + 1).padStart(2, "0")}`,
      material_type: "url",
      summary: url,
      user_provided: true,
      verification_status: "Provided by user; not yet verified by Crossref/NCBI in this MVP.",
    });
  }

  if (input.location) {
    rows.push({
      id: `EV-${String(rows.length + 1).padStart(2, "0")}`,
      material_type: "lokasi",
      summary: input.location,
      user_provided: true,
      verification_status: "Provided by user; location is not independently verified in this MVP.",
    });
  }

  if (input.uploadedFileNote) {
    rows.push({
      id: `EV-${String(rows.length + 1).padStart(2, "0")}`,
      material_type: "file_placeholder",
      summary: input.uploadedFileNote,
      user_provided: true,
      verification_status: "Upload belum aktif; keterangan file dicatat sebagai bahan dari pengguna.",
    });
  }

  return rows.map((row, index) => ({
    ...row,
    id: `EV-${String(index + 1).padStart(2, "0")}`,
  }));
}

export function buildMockEvidenceReport(input: ReportRequest): EvidenceReport {
  const evidenceTable = buildEvidenceTable(input);
  const hasUrls = input.sourceUrls.length > 0;
  const locationPhrase = input.location ? ` di ${input.location}` : "";

  return {
    background: `Draft ini disusun dari bahan yang diberikan pengguna untuk ${input.template}${locationPhrase}. Bagian latar belakang perlu diperiksa dan diperkaya oleh pengguna dengan sumber yang benar-benar dibaca.`,
    conclusion:
      "Berdasarkan bahan awal, laporan dapat diarahkan menjadi dokumen observasi yang rapi, tetapi kesimpulan akhir harus menunggu pemeriksaan sumber, koreksi data, dan review manusia.",
    disclaimer: PUBLIC_REPORT_DISCLAIMER,
    discussion:
      "Pembahasan sementara harus menjaga batas bukti. NaLI tidak menambahkan sitasi, DOI, statistik, atau data observasi baru di luar bahan pengguna. Hubungkan temuan dengan sumber yang sudah diverifikasi sebelum dokumen dipakai untuk sekolah, kampus, atau pekerjaan.",
    draft_label: DRAFT_LABEL,
    evidence_table: evidenceTable,
    executive_summary: `NaLI menyusun draft awal untuk "${input.title}" berdasarkan ${evidenceTable.length} bahan yang diberikan pengguna. Draft ini membantu merapikan struktur, bukan menggantikan pemeriksaan akademik.`,
    findings: [
      input.notes
        ? `Catatan utama pengguna: ${summarize(input.notes, "belum ada ringkasan catatan")}`
        : "Catatan utama belum ditulis; draft hanya memakai bahan non-teks yang diberikan.",
      hasUrls
        ? "URL yang diberikan dicatat sebagai bahan pengguna, tetapi belum diverifikasi oleh Source Verification Bridge."
        : "Tidak ada URL sumber yang diberikan; pengguna perlu menambahkan sumber yang dapat diperiksa.",
      input.location
        ? `Lokasi yang diberikan: ${input.location}. Lokasi ini belum diverifikasi sebagai data lapangan.`
        : "Lokasi tidak diberikan; konteks tempat masih perlu dilengkapi jika relevan.",
    ],
    generated_at: new Date().toISOString(),
    id: makeId(),
    is_mock: true,
    method_or_materials:
      "Bahan yang digunakan hanya berasal dari input pengguna pada form MVP: catatan, URL, lokasi, dan/atau keterangan file. Upload file, ekstraksi PDF, dan verifikasi sumber otomatis belum aktif.",
    next_user_steps: [
      "Periksa ulang semua bagian draft dan sesuaikan dengan format sekolah, kampus, atau lembaga.",
      "Buka setiap URL yang diberikan dan verifikasi apakah benar relevan sebelum dimasukkan ke daftar pustaka.",
      "Tambahkan data, foto, tabel, atau pengamatan asli jika laporan membutuhkan bukti tambahan.",
      "Hapus bagian yang tidak sesuai dengan bahan nyata yang kamu miliki.",
    ],
    objective: `Menyusun ${input.template.toLowerCase()} berbasis bahan pengguna, dengan evidence table, uncertainty note, dan batasan sumber yang jelas.`,
    report_type: input.template,
    source_notes: hasUrls
      ? input.sourceUrls.map((url) => `${url} - provided by user, not yet verified.`)
      : ["Belum ada URL sumber. Source verification belum aktif di MVP ini."],
    source_verification_status: SOURCE_VERIFICATION_MVP_STATUS,
    title: input.title,
    uncertainty_note:
      "Uncertainty note: draft ini bergantung pada kelengkapan bahan pengguna. NaLI belum memverifikasi URL, lokasi, file, angka, atau klaim ilmiah. Jangan menambahkan sitasi, statistik, atau kesimpulan final tanpa pemeriksaan manusia.",
  };
}

export function buildReportPrompt(input: ReportRequest) {
  return [
    "Susun JSON laporan untuk NaLI Learn & Report.",
    "Gunakan Bahasa Indonesia.",
    "Output wajib menjadi draft bantuan belajar/penulisan berbasis bukti, bukan karya final.",
    "Jangan membuat sitasi, DOI, statistik, data observasi, nama penulis, penerbit, timestamp, atau koordinat yang tidak diberikan pengguna.",
    "Jika pengguna memberi URL, labeli sebagai provided by user, not yet verified.",
    `draft_label harus persis: ${DRAFT_LABEL}`,
    `disclaimer harus persis: ${PUBLIC_REPORT_DISCLAIMER}`,
    `source_verification_status harus persis: ${SOURCE_VERIFICATION_MVP_STATUS}`,
    "Balas hanya JSON valid tanpa markdown.",
    "Schema: { title, report_type, draft_label, executive_summary, background, objective, method_or_materials, findings: string[], discussion, conclusion, evidence_table: { id, material_type, summary, user_provided, verification_status }[], source_notes: string[], source_verification_status, uncertainty_note, disclaimer, next_user_steps: string[] }",
    "",
    `Template: ${input.template}`,
    `Judul: ${input.title}`,
    `Peran pengguna: ${input.role}`,
    `Catatan: ${input.notes || "(tidak ada catatan teks)"}`,
    `URL sumber: ${input.sourceUrls.length ? input.sourceUrls.join("; ") : "(tidak ada URL)"}`,
    `Lokasi: ${input.location || "(tidak ada lokasi)"}`,
    `Keterangan file: ${input.uploadedFileNote || "(upload belum aktif / tidak ada keterangan file)"}`,
  ].join("\n");
}

export function normalizeProviderReport(report: Partial<EvidenceReport>, input: ReportRequest): EvidenceReport {
  const fallback = buildMockEvidenceReport(input);

  return {
    ...fallback,
    ...report,
    disclaimer: PUBLIC_REPORT_DISCLAIMER,
    draft_label: DRAFT_LABEL,
    evidence_table: Array.isArray(report.evidence_table) && report.evidence_table.length > 0 ? report.evidence_table : fallback.evidence_table,
    findings: Array.isArray(report.findings) && report.findings.length > 0 ? report.findings : fallback.findings,
    generated_at: new Date().toISOString(),
    id: makeId(),
    is_mock: false,
    next_user_steps:
      Array.isArray(report.next_user_steps) && report.next_user_steps.length > 0
        ? report.next_user_steps
        : fallback.next_user_steps,
    source_notes:
      Array.isArray(report.source_notes) && report.source_notes.length > 0 ? report.source_notes : fallback.source_notes,
    source_verification_status: SOURCE_VERIFICATION_MVP_STATUS,
  };
}
