import type { ReportRequestInput } from "@/lib/reports/reportGenerator";
import { hasAtLeastOneMaterial } from "@/lib/reports/reportGenerator";

export type IntegritySeverity = "low" | "medium" | "high";

export type IntegrityReasonCode =
  | "ALLOWED"
  | "EMPTY_DRAFT_MATERIAL"
  | "FINAL_ASSIGNMENT_WITHOUT_MATERIAL"
  | "FAKE_CITATION_REQUEST"
  | "FAKE_DATA_REQUEST"
  | "PLAGIARISM_EVASION"
  | "DO_MY_WORK";

export type IntegrityPolicyDecision = {
  allowed: boolean;
  code?: IntegrityReasonCode;
  matchedSignals: string[];
  message?: string;
  reasonCode: IntegrityReasonCode;
  severity: IntegritySeverity;
  userMessage: string;
};

type SignalRule = {
  code: Exclude<IntegrityReasonCode, "ALLOWED">;
  message: string;
  patterns: Array<{ label: string; pattern: RegExp }>;
  severity: IntegritySeverity;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s./:-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function combinedInput(input: ReportRequestInput) {
  return normalize(
    [
      input.mode,
      input.reportTemplate,
      input.selectedTemplate,
      input.template,
      input.mainText,
      input.notes,
      input.topic,
      input.title,
      input.location,
      input.fileDescription,
      input.uploadedFileNote,
      Array.isArray(input.sourceUrls) ? input.sourceUrls.join(" ") : input.sourceUrls,
    ]
      .map((value) => clean(value))
      .filter(Boolean)
      .join(" "),
  );
}

function collectSignals(value: string, patterns: SignalRule["patterns"]) {
  return patterns.filter((item) => item.pattern.test(value)).map((item) => item.label);
}

function blocked(rule: SignalRule, matchedSignals: string[]): IntegrityPolicyDecision {
  return {
    allowed: false,
    code: rule.code,
    matchedSignals,
    message: rule.message,
    reasonCode: rule.code,
    severity: rule.severity,
    userMessage: rule.message,
  };
}

function allowed(): IntegrityPolicyDecision {
  return {
    allowed: true,
    matchedSignals: [],
    reasonCode: "ALLOWED",
    severity: "low",
    userMessage: "",
  };
}

const emptyDraftRule: SignalRule = {
  code: "EMPTY_DRAFT_MATERIAL",
  message: "Masukkan minimal satu bahan dulu: catatan, lokasi, URL, atau ringkasan file.",
  patterns: [{ label: "draft_mode_without_material", pattern: /.*/ }],
  severity: "medium",
};

const doMyWorkRule: SignalRule = {
  code: "DO_MY_WORK",
  message:
    "NaLI tidak bisa mengerjakan tugas sebagai pengganti pengguna. Tambahkan bahan nyata, lalu NaLI dapat membantu menyusun draft berbasis bukti atau panduan review.",
  patterns: [
    { label: "kerjakan_tugas_saya", pattern: /\b(kerjakan|selesaikan|buatkan|bikinkan)\s+(semua\s+)?tugas\s+(saya|aku|ku)\b/i },
    { label: "do_my_homework", pattern: /\b(do|finish|complete|write)\s+my\s+(homework|assignment|paper|thesis)\b/i },
    { label: "gantikan_pengguna", pattern: /\bsebagai\s+pengganti\s+(saya|aku|mahasiswa|siswa)\b/i },
  ],
  severity: "high",
};

const finalAssignmentRule: SignalRule = {
  code: "FINAL_ASSIGNMENT_WITHOUT_MATERIAL",
  message:
    "NaLI tidak membuat karya akademik final tanpa bahan. Pilih mode panduan awal, atau tambahkan catatan, sumber, data pengamatan, dan bahan yang dapat diperiksa.",
  patterns: [
    {
      label: "final_ready_to_submit",
      pattern:
        /\b(tugas|laporan|skripsi|paper|makalah|homework|assignment|thesis|submission).{0,40}(final|selesai|langsung\s+jadi|siap\s+kumpul|siap\s+submit|ready\s+to\s+submit|finished)\b/i,
    },
    {
      label: "generate_final_work",
      pattern:
        /\b(generate|buat|buatkan|bikinkan|write|create).{0,28}(final|finished|ready\s+to\s+submit|siap\s+kumpul).{0,28}(assignment|homework|paper|report|tugas|laporan|skripsi|makalah)\b/i,
    },
    { label: "skripsi_selesai", pattern: /\bskripsi\s+(selesai|langsung\s+jadi|siap\s+sidang|full\s+bab)\b/i },
    { label: "full_bab", pattern: /\bfull\s+bab\s*1\s*[-–]\s*5\b/i },
    { label: "automatic_paper", pattern: /\b(paper|skripsi|thesis)\s+(otomatis|automatic)\b/i },
  ],
  severity: "high",
};

const fakeCitationRule: SignalRule = {
  code: "FAKE_CITATION_REQUEST",
  message:
    "NaLI tidak bisa membuat data atau sitasi palsu. Tambahkan bahan nyata, lalu NaLI dapat membantu menyusun draft berbasis bukti.",
  patterns: [
    {
      label: "fake_reference_intent",
      pattern:
        /\b(buat|buatkan|bikinkan|karang|generate|invent|fabricate|create).{0,36}(referensi|daftar\s+pustaka|sitasi|citation|bibliography|reference).{0,44}(palsu|fiktif|asal|fake|fabricated|made\s+up|terlihat\s+ilmiah)\b/i,
    },
    {
      label: "citation_without_source",
      pattern:
        /\b(buat|buatkan|bikinkan|generate|invent|fabricate|create).{0,30}(referensi|sitasi|citation|bibliography|reference)\s+(tanpa|without)\s+(sumber|source)\b/i,
    },
    { label: "fake_doi", pattern: /\b(doi).{0,24}(palsu|fiktif|asal|fake|fabricated|made\s+up)\b/i },
    { label: "invent_doi", pattern: /\b(invent|fabricate|buat|buatkan|generate|create).{0,24}\bdoi\b/i },
    { label: "fake_references_phrase", pattern: /\b(referensi|sitasi|citation|reference|daftar\s+pustaka)\s+(palsu|fiktif|fake)\b/i },
  ],
  severity: "high",
};

const fakeDataRule: SignalRule = {
  code: "FAKE_DATA_REQUEST",
  message:
    "NaLI tidak bisa membuat data, statistik, koordinat, timestamp, atau hasil observasi palsu. Kumpulkan data nyata terlebih dahulu, atau gunakan mode panduan awal.",
  patterns: [
    {
      label: "fake_data_intent",
      pattern:
        /\b(isi|buat|buatkan|bikinkan|karang|generate|invent|fabricate|create).{0,36}(data|angka|statistik|statistics|dataset|hasil\s+observasi|observation\s+data).{0,44}(palsu|fiktif|asal|fake|fabricated|made\s+up|sekalian)\b/i,
    },
    {
      label: "field_observation_fabrication",
      pattern:
        /\b(buat|buatkan|bikinkan|karang|generate|invent|fabricate).{0,36}(data\s+observasi|hasil\s+observasi|catatan\s+lapangan|field\s+observation|observation\s+record)\b/i,
    },
    {
      label: "fake_coordinates_timestamp",
      pattern:
        /\b(koordinat|coordinate|gps|timestamp|waktu\s+observasi|tanggal\s+observasi).{0,36}(palsu|fiktif|asal|fake|fabricated|made\s+up|karang|buatkan)\b/i,
    },
    { label: "karang_data", pattern: /\b(karang|fabricate|invent)\s+(data|statistics|statistik|dataset)\b/i },
    { label: "official_data_without_source", pattern: /\bbuatkan\s+data\s+resmi\s+tanpa\s+sumber\b/i },
  ],
  severity: "high",
};

const plagiarismRule: SignalRule = {
  code: "PLAGIARISM_EVASION",
  message:
    "NaLI tidak dapat membantu menyamarkan plagiarisme. NaLI dapat membantu membuat outline, checklist sumber, atau draft berbasis bahan yang dapat diperiksa.",
  patterns: [
    { label: "anti_ketahuan", pattern: /\b(anti|tidak|ga|gak|jangan|supaya\s+tidak|supaya\s+gak)\s+ketahuan\b/i },
    { label: "detector_evasion", pattern: /\b(ai\s+detector|deteksi\s+ai|turnitin|plagiarism\s+checker).{0,36}(lolos|bypass|hindari|avoid|tidak\s+ketahuan|gak\s+ketahuan)\b/i },
    {
      label: "paraphrase_to_hide",
      pattern:
        /\b(parafrase|paraphrase|ubah|rewrite).{0,40}(lolos|anti|bypass|tidak\s+ketahuan|gak\s+ketahuan|ga\s+ketahuan|hide|avoid\s+detection)\b/i,
    },
    { label: "guaranteed_no_plagiarism", pattern: /\b(bebas|zero|lolos)\s+plagiarisme\s+(dijamin|guaranteed)\b/i },
  ],
  severity: "high",
};

const explicitFinalAssignmentSignals = new Set(["skripsi_selesai", "full_bab", "automatic_paper"]);

export function evaluateIntegrityPolicy(input: ReportRequestInput): IntegrityPolicyDecision {
  const mode = clean(input.mode) === "start_from_zero" ? "start_from_zero" : "draft_from_materials";
  const text = combinedInput(input);
  const hasMaterial =
    mode === "draft_from_materials"
      ? hasAtLeastOneMaterial(input)
      : hasAtLeastOneMaterial({
          fileDescription: input.fileDescription,
          location: input.location,
          mainText: "",
          notes: "",
          sourceUrls: input.sourceUrls,
          uploadedFileNote: input.uploadedFileNote,
        });

  if (mode === "draft_from_materials" && !hasMaterial) {
    return blocked(emptyDraftRule, ["draft_mode_without_material"]);
  }

  const alwaysBlockRules = [doMyWorkRule, fakeCitationRule, fakeDataRule, plagiarismRule];
  for (const rule of alwaysBlockRules) {
    const matchedSignals = collectSignals(text, rule.patterns);
    if (matchedSignals.length > 0) {
      return blocked(rule, matchedSignals);
    }
  }

  const finalAssignmentSignals = collectSignals(text, finalAssignmentRule.patterns);
  const explicitFinalAssignment = finalAssignmentSignals.some((signal) => explicitFinalAssignmentSignals.has(signal));
  if (finalAssignmentSignals.length > 0 && (!hasMaterial || explicitFinalAssignment)) {
    return blocked(finalAssignmentRule, finalAssignmentSignals);
  }

  return allowed();
}
