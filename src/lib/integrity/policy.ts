import type { ReportRequestInput } from "@/lib/reports/reportGenerator";
import { hasAtLeastOneMaterial } from "@/lib/reports/reportGenerator";

export type IntegrityPolicyDecision =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      code:
        | "EMPTY_DRAFT_MATERIAL"
        | "FINAL_ASSIGNMENT_WITHOUT_MATERIAL"
        | "FAKE_CITATION_REQUEST"
        | "FAKE_DATA_REQUEST"
        | "PLAGIARISM_EVASION"
        | "DO_MY_WORK";
      message: string;
    };

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
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

function matchesAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

const doMyWorkPatterns = [
  /\bkerjakan\s+tugas\s+(saya|aku|ku)\b/i,
  /\bbikinkan\s+semua\s+tugas\b/i,
  /\bselesaikan\s+tugas\s+(saya|aku|ku)\b/i,
  /\bbuatkan\s+tugas\s+(saya|aku|ku)\b/i,
];

const finalAssignmentPatterns = [
  /\b(generate|buat|bikinkan|tuliskan)\s+(tugas|laporan|skripsi|paper|makalah).{0,28}\b(final|selesai|langsung\s+jadi|siap\s+kumpul)\b/i,
  /\b(tugas|laporan|skripsi|paper|makalah)\s+(final|selesai|langsung\s+jadi|siap\s+kumpul)\b/i,
  /\bfull\s+bab\s*1\s*[-–]\s*5\b/i,
  /\bsemua\s+bab(nya)?\s+(langsung\s+)?jadi\b/i,
  /\bskripsi\s+(selesai|langsung\s+jadi|siap\s+sidang)\b/i,
  /\bpaper\s+otomatis\b/i,
  /\bskripsi\s+otomatis\b/i,
];

const fakeCitationPatterns = [
  /\b(buat|karang|generate|bikinkan).{0,24}(referensi|daftar\s+pustaka|sitasi|citation).{0,32}(palsu|fiktif|asal|terlihat\s+ilmiah)\b/i,
  /\bdoi\s+(palsu|fiktif|asal)\b/i,
  /\bbuat\s+doi\b/i,
  /\breferensi\s+yang\s+terlihat\s+ilmiah\b/i,
  /\bsitasi\s+palsu\b/i,
];

const fakeDataPatterns = [
  /\b(isi|buat|karang|generate).{0,28}(data|angka|statistik|hasil\s+observasi|koordinat).{0,32}(palsu|fiktif|asal|sekalian)\b/i,
  /\bbuatkan\s+data\s+penelitian\b/i,
  /\bkarang\s+data\b/i,
  /\bkoordinat\s+palsu\b/i,
  /\bstatistik\s+palsu\b/i,
  /\bhasil\s+observasi\s+(sekalian|palsu|fiktif)\b/i,
];

const plagiarismPatterns = [
  /\b(anti|tidak|ga|gak)\s+ketahuan\b/i,
  /\blolos\s+plagiarisme\b/i,
  /\bbebas\s+plagiarisme\s+dijamin\b/i,
  /\bparafrase.{0,32}(lolos|anti|tidak\s+ketahuan|gak\s+ketahuan|ga\s+ketahuan)\b/i,
  /\bubah.{0,32}(tidak\s+ketahuan|gak\s+ketahuan|ga\s+ketahuan)\s+(ai|dosen|turnitin)?\b/i,
];

export function evaluateIntegrityPolicy(input: ReportRequestInput): IntegrityPolicyDecision {
  const mode = clean(input.mode) === "start_from_zero" ? "start_from_zero" : "draft_from_materials";
  const text = combinedInput(input);
  const hasMaterial = hasAtLeastOneMaterial(input);

  if (mode === "draft_from_materials" && !hasMaterial) {
    return {
      allowed: false,
      code: "EMPTY_DRAFT_MATERIAL",
      message: "Masukkan minimal satu bahan dulu: catatan, lokasi, URL, atau ringkasan file.",
    };
  }

  if (matchesAny(text, doMyWorkPatterns)) {
    return {
      allowed: false,
      code: "DO_MY_WORK",
      message:
        "NaLI tidak bisa mengerjakan tugas sebagai pengganti pengguna. Masukkan bahanmu sendiri, lalu NaLI dapat membantu menyusun draft atau panduan review.",
    };
  }

  if (matchesAny(text, finalAssignmentPatterns)) {
    return {
      allowed: false,
      code: "FINAL_ASSIGNMENT_WITHOUT_MATERIAL",
      message:
        "NaLI tidak membuat karya akademik final tanpa bahan. Mulai dengan catatan, sumber, data pengamatan, atau pilih mode panduan awal.",
    };
  }

  if (matchesAny(text, fakeCitationPatterns)) {
    return {
      allowed: false,
      code: "FAKE_CITATION_REQUEST",
      message:
        "NaLI tidak boleh membuat sitasi, referensi, atau DOI palsu. Berikan sumber yang benar-benar ada agar NaLI dapat mencatatnya sebagai bahan pengguna.",
    };
  }

  if (matchesAny(text, fakeDataPatterns)) {
    return {
      allowed: false,
      code: "FAKE_DATA_REQUEST",
      message:
        "NaLI tidak boleh membuat data, statistik, koordinat, atau hasil observasi palsu. Kumpulkan data nyata terlebih dahulu atau gunakan mode panduan awal.",
    };
  }

  if (matchesAny(text, plagiarismPatterns)) {
    return {
      allowed: false,
      code: "PLAGIARISM_EVASION",
      message:
        "NaLI tidak membantu menyamarkan plagiarisme atau menghindari deteksi. NaLI hanya membantu menyusun dan mereview bahan yang sah.",
    };
  }

  return { allowed: true };
}
