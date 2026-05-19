import {
  DRAFT_LABEL,
  PUBLIC_REPORT_DISCLAIMER,
  SOURCE_VERIFICATION_MVP_STATUS,
  START_FROM_ZERO_DISCLAIMER,
  START_FROM_ZERO_LABEL,
  containsForbiddenWording,
  type DraftReport,
  type ReportResult,
  type StartFromZeroGuide,
} from "@/lib/reports/reportGenerator";

export type OutputGuardWarning = {
  code: string;
  message: string;
};

export type OutputGuardResult =
  | {
      allowed: true;
      report: ReportResult;
      warnings: OutputGuardWarning[];
    }
  | {
      allowed: false;
      reasonCode: "UNSAFE_OUTPUT";
      userMessage: string;
      warnings: OutputGuardWarning[];
    };

type OutputGuardOptions = {
  sourceVerificationActive?: boolean;
};

const doiPattern = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/gi;
const coordinatePattern = /-?\d{1,2}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/g;
const sensitiveContextPattern = /\b(satwa|burung|flora|fauna|spesies|species|habitat|konservasi|ranger|field intelligence|profesional|observation)\b/i;
const suspiciousCitationPattern =
  /\b(menurut|berdasarkan)\s+(jurnal|penelitian|studi|paper|artikel|riset)\s+[^.]{0,80}\b/gi;

const overclaimReplacements: Array<{ code: string; pattern: RegExp; replacement: string }> = [
  { code: "overclaim_terbukti", pattern: /\bterbukti\b/gi, replacement: "perlu diperiksa" },
  { code: "overclaim_pasti", pattern: /\bpasti\b/gi, replacement: "masih perlu diperiksa" },
  { code: "overclaim_dijamin", pattern: /\bdijamin\b/gi, replacement: "tidak dijamin otomatis" },
  { code: "overclaim_verified", pattern: /\bverified\b/gi, replacement: "belum diverifikasi" },
  {
    code: "overclaim_scientific_validity",
    pattern: /\bvalid\s+secara\s+ilmiah\b/gi,
    replacement: "belum divalidasi secara ilmiah",
  },
  {
    code: "overclaim_official_data",
    pattern: /\bdata\s+resmi\b/gi,
    replacement: "data yang disebut pengguna dan belum diverifikasi",
  },
];

function cloneReport(report: ReportResult): ReportResult {
  return JSON.parse(JSON.stringify(report)) as ReportResult;
}

function pushWarning(warnings: OutputGuardWarning[], code: string, message: string) {
  if (!warnings.some((warning) => warning.code === code)) {
    warnings.push({ code, message });
  }
}

function sanitizeString(value: string, warnings: OutputGuardWarning[], options: OutputGuardOptions) {
  let next = value;

  if (!options.sourceVerificationActive && doiPattern.test(next)) {
    next = next.replace(doiPattern, "[DOI dihapus karena Source Verification belum aktif]");
    pushWarning(warnings, "doi_without_verification", "DOI-like output was removed because source verification is inactive.");
  }
  doiPattern.lastIndex = 0;

  if (!options.sourceVerificationActive && suspiciousCitationPattern.test(next)) {
    next = next.replace(suspiciousCitationPattern, "Menurut sumber yang perlu diperiksa manual");
    pushWarning(
      warnings,
      "citation_claim_without_verification",
      "Suspicious citation claim was softened because source verification is inactive.",
    );
  }
  suspiciousCitationPattern.lastIndex = 0;

  if (sensitiveContextPattern.test(next) && coordinatePattern.test(next)) {
    next = next.replace(coordinatePattern, "[lokasi rinci disamarkan]");
    pushWarning(warnings, "coordinate_redaction", "Exact coordinate-like text was redacted in a species/professional context.");
  }
  coordinatePattern.lastIndex = 0;

  for (const replacement of overclaimReplacements) {
    if (replacement.pattern.test(next)) {
      next = next.replace(replacement.pattern, replacement.replacement);
      pushWarning(warnings, replacement.code, "Overclaim wording was softened.");
    }
    replacement.pattern.lastIndex = 0;
  }

  return next;
}

function walk(value: unknown, warnings: OutputGuardWarning[], options: OutputGuardOptions): unknown {
  if (typeof value === "string") {
    return sanitizeString(value, warnings, options);
  }

  if (Array.isArray(value)) {
    return value.map((item) => walk(item, warnings, options));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, walk(item, warnings, options)]),
    );
  }

  return value;
}

function appendGuardWarning(report: ReportResult, warnings: OutputGuardWarning[]) {
  if (warnings.length === 0) return report;
  const note = "Catatan keamanan output: beberapa klaim otomatis dilunakkan karena belum ada verifikasi sumber aktif.";

  if (report.mode === "start_from_zero") {
    return {
      ...report,
      integrity_note: report.integrity_note.includes(note) ? report.integrity_note : `${report.integrity_note} ${note}`,
    } satisfies StartFromZeroGuide;
  }

  return {
    ...report,
    uncertainty_note: report.uncertainty_note.includes(note) ? report.uncertainty_note : `${report.uncertainty_note} ${note}`,
  } satisfies DraftReport;
}

function preserveRequiredFields(report: ReportResult): ReportResult {
  if (report.mode === "start_from_zero") {
    return {
      ...report,
      disclaimer: START_FROM_ZERO_DISCLAIMER,
      label: START_FROM_ZERO_LABEL,
    };
  }

  return {
    ...report,
    disclaimer: PUBLIC_REPORT_DISCLAIMER,
    draft_label: DRAFT_LABEL,
    source_verification_status: SOURCE_VERIFICATION_MVP_STATUS,
  };
}

export function guardReportOutput(report: ReportResult, options: OutputGuardOptions = {}): OutputGuardResult {
  const rawText = JSON.stringify(report);

  if (containsForbiddenWording(rawText)) {
    return {
      allowed: false,
      reasonCode: "UNSAFE_OUTPUT",
      userMessage:
        "NaLI tidak dapat mengembalikan output ini karena berisi permintaan atau klaim yang melanggar integritas akademik.",
      warnings: [{ code: "forbidden_academic_wording", message: "Forbidden academic cheating wording was detected." }],
    };
  }

  const warnings: OutputGuardWarning[] = [];
  const sanitized = walk(cloneReport(report), warnings, options) as ReportResult;
  const withWarning = appendGuardWarning(sanitized, warnings);

  return {
    allowed: true,
    report: preserveRequiredFields(withWarning),
    warnings,
  };
}
