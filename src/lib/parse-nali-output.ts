export type AvailStatus = "ADA" | "TIDAK_ADA" | "KURANG";

export interface NaLIHeader {
  tipeLaporan: string;
  kualitasBukti: "Rendah" | "Sedang" | "Kuat" | "Forensik" | string;
  risikoKlaim: "Rendah" | "Sedang" | "Tinggi" | string;
  bahasaUser: "Objektif" | "Campuran" | "Bias" | string;
  evidenceAvailability: {
    genetik: AvailStatus;
    visual: AvailStatus;
    lokasi_gps: AvailStatus;
    timestamp: AvailStatus;
    metode: AvailStatus;
    multiple_observer: AvailStatus;
  };
}

export interface EvidenceRow {
  klaim: string;
  sumber: string;
  status: "Terkonfirmasi" | "Inferensi AI" | "Bukti kurang" | string;
  keterangan: string;
}

export interface MissingEvidenceItem {
  number: number;
  item: string;
  reason: string;
}

export interface FollowUpQuestion {
  number: number;
  question: string;
  gapType: string;
}

export interface ParsedNaLIOutput {
  version: "v1" | "v2";
  header: NaLIHeader | null;
  reportMarkdown: string;
  evidenceTable: EvidenceRow[];
  missingEvidence: MissingEvidenceItem[];
  followUpQuestions: FollowUpQuestion[];
  hasStructuredOutput: boolean;
}

function parseAvailStatus(val: string | undefined): AvailStatus {
  const v = (val ?? "").trim().toUpperCase();
  if (v === "ADA") return "ADA";
  if (v === "KURANG") return "KURANG";
  return "TIDAK_ADA";
}

function extractField(text: string, key: string): string {
  const m = text.match(new RegExp(`${key}:\\s*(.+)`));
  return m?.[1]?.trim() ?? "";
}

export function parseNaLIOutput(raw: string): ParsedNaLIOutput {
  // Detect new simple format (---NALI-HEADER---) or old complex format
  const hasNewHeader = raw.includes("---NALI-HEADER---");
  const hasOldHeader = raw.includes("---NALI-INTELLIGENCE-HEADER---");
  const isStructured = hasNewHeader || hasOldHeader;

  if (!isStructured) {
    return {
      version: "v1",
      header: null,
      reportMarkdown: raw,
      evidenceTable: [],
      missingEvidence: [],
      followUpQuestions: [],
      hasStructuredOutput: false,
    };
  }

  const result: ParsedNaLIOutput = {
    version: "v2",
    header: null,
    reportMarkdown: "",
    evidenceTable: [],
    missingEvidence: [],
    followUpQuestions: [],
    hasStructuredOutput: true,
  };

  if (hasNewHeader) {
    // Parse new simple ---NALI-HEADER--- format
    const headerMatch = raw.match(/---NALI-HEADER---([\s\S]*?)---END-HEADER---/);
    if (headerMatch) {
      const h = headerMatch[1];
      result.header = {
        tipeLaporan: extractField(h, "Tipe"),
        kualitasBukti: extractField(h, "Kualitas_Bukti"),
        risikoKlaim: extractField(h, "Risiko_Klaim"),
        bahasaUser: extractField(h, "Bahasa_User"),
        evidenceAvailability: {
          genetik: parseAvailStatus(extractField(h, "Genetik")),
          visual: parseAvailStatus(extractField(h, "Visual")),
          lokasi_gps: parseAvailStatus(extractField(h, "Lokasi_GPS")),
          timestamp: parseAvailStatus(extractField(h, "Timestamp")),
          metode: parseAvailStatus(extractField(h, "Metode")),
          multiple_observer: parseAvailStatus(extractField(h, "Observer")),
        },
      };
    }

    const afterHeader = raw.split("---END-HEADER---")[1] ?? "";
    result.reportMarkdown = afterHeader.split("---NALI-EVIDENCE-TABLE---")[0].trim();
  } else {
    // Old ---NALI-INTELLIGENCE-HEADER--- format: extract what we can
    const headerMatch = raw.match(/---NALI-INTELLIGENCE-HEADER---([\s\S]*?)---END-INTELLIGENCE-HEADER---/);
    if (headerMatch) {
      const h = headerMatch[1];
      const kualitas = extractField(h, "Kualitas Bukti");
      result.header = {
        tipeLaporan: extractField(h, "Tipe Laporan"),
        kualitasBukti: kualitas,
        risikoKlaim: extractField(h, "Risiko Klaim"),
        bahasaUser: "Campuran",
        evidenceAvailability: {
          genetik: "TIDAK_ADA",
          visual: "TIDAK_ADA",
          lokasi_gps: "TIDAK_ADA",
          timestamp: "TIDAK_ADA",
          metode: "TIDAK_ADA",
          multiple_observer: "TIDAK_ADA",
        },
      };
    }

    const afterHeader = raw.split("---END-INTELLIGENCE-HEADER---")[1] ?? "";
    result.reportMarkdown = afterHeader.split("---NALI-EVIDENCE-TABLE---")[0].trim();
  }

  // Parse evidence table (shared logic — handles 3-4 column format)
  const tableMatch = raw.match(/---NALI-EVIDENCE-TABLE---([\s\S]*?)---END-EVIDENCE-TABLE---/);
  if (tableMatch) {
    const rows = tableMatch[1]
      .trim()
      .split("\n")
      .filter((r) => r.startsWith("|") && !r.includes("---"))
      .slice(1);
    for (const row of rows) {
      const cells = row
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length >= 3) {
        result.evidenceTable.push({
          klaim: cells[0] ?? "",
          sumber: cells[1] ?? "",
          status: cells[2] ?? "Bukti kurang",
          keterangan: cells[3] ?? "",
        });
      }
    }
  }

  // Parse missing evidence
  const missingMatch = raw.match(/---NALI-MISSING-EVIDENCE---([\s\S]*?)---END-MISSING-EVIDENCE---/);
  if (missingMatch) {
    const lines = missingMatch[1].trim().split("\n").filter(Boolean);
    lines.forEach((line, i) => {
      const cleaned = line.replace(/^\d+\.\s*/, "");
      const dashIdx = cleaned.indexOf(" — ");
      const item = dashIdx >= 0 ? cleaned.slice(0, dashIdx).trim() : cleaned.trim();
      const reason = dashIdx >= 0 ? cleaned.slice(dashIdx + 3).trim() : "";
      result.missingEvidence.push({ number: i + 1, item, reason });
    });
  }

  // Parse follow-up questions: support both ---NALI-QUESTIONS--- and ---NALI-FOLLOWUP-QUESTIONS---
  const fupMatch =
    raw.match(/---NALI-QUESTIONS---([\s\S]*?)---END-QUESTIONS---/) ??
    raw.match(/---NALI-FOLLOWUP-QUESTIONS---([\s\S]*?)---END-FOLLOWUP-QUESTIONS---/);

  if (fupMatch) {
    const lines = fupMatch[1]
      .trim()
      .split("\n")
      .filter((l) => /^Q\d:/.test(l));
    lines.forEach((line, i) => {
      result.followUpQuestions.push({
        number: i + 1,
        question: line.replace(/^Q\d:\s*/, "").trim(),
        gapType: "auto-detected",
      });
    });
  }

  return result;
}
