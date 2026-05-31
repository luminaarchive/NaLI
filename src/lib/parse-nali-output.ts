export interface PalantirScore {
  overall: number;
  level: string;
  geneticPillar: number;
  visualPillar: number;
  habitatPillar: number;
  integrityPillar: number;
  linguisticMultiplier: number;
  temporalDecayFactor: number;
  entityResolution: string;
}

export interface NaLIIntelligenceHeader {
  tipeLaporan: string;
  domain: string;
  palantir: PalantirScore;
  kualitasBukti: "Rendah" | "Sedang" | "Kuat" | "Forensik Grade";
  risikoKlaim: "Rendah" | "Sedang" | "Tinggi";
  kesiapanPublikasi: string;
  entitasOPL: {
    taxon: string;
    lokasi: string;
    waktu: string;
    observer: string;
    sampel: string;
  };
}

export interface EvidenceRow {
  klaim: string;
  pilarBukti: string;
  sumber: string;
  status: "Terkonfirmasi" | "Inferensi AI" | "Bukti kurang";
  risiko: "Rendah" | "Sedang" | "Tinggi";
  kelemahan: string;
}

export interface MissingEvidenceItem {
  impactScore: number;
  number: number;
  item: string;
  impact: string;
  cara: string;
}

export interface FollowUpQuestion {
  number: number;
  question: string;
  gapType: string;
}

export interface ParsedNaLIOutput {
  version: "v1" | "v2";
  header: NaLIIntelligenceHeader | null;
  reportMarkdown: string;
  evidenceTable: EvidenceRow[];
  missingEvidence: MissingEvidenceItem[];
  followUpQuestions: FollowUpQuestion[];
  integrityStatement: string;
  hasStructuredOutput: boolean;
}

export function parseNaLIOutput(raw: string): ParsedNaLIOutput {
  const isV2 = raw.includes("---NALI-INTELLIGENCE-HEADER---");
  const isV1 = !isV2 && raw.includes("---NALI-HEADER---");

  if (!isV2 && !isV1) {
    return {
      version: "v1",
      header: null,
      reportMarkdown: raw,
      evidenceTable: [],
      missingEvidence: [],
      followUpQuestions: [],
      integrityStatement: "",
      hasStructuredOutput: false,
    };
  }

  const result: ParsedNaLIOutput = {
    version: isV2 ? "v2" : "v1",
    header: null,
    reportMarkdown: "",
    evidenceTable: [],
    missingEvidence: [],
    followUpQuestions: [],
    integrityStatement: "",
    hasStructuredOutput: true,
  };

  if (isV2) {
    const headerMatch = raw.match(/---NALI-INTELLIGENCE-HEADER---([\s\S]*?)---END-INTELLIGENCE-HEADER---/);
    if (headerMatch) {
      const h = headerMatch[1];

      const overallMatch = h.match(/PALANTIR CONFIDENCE SCORE:\s*([\d.]+)%/);
      const levelMatch = h.match(/PALANTIR CONFIDENCE SCORE:.*?[—\-]\s*(.+)/);
      const geneticMatch = h.match(/Pilar Genetik.*?:\s*([\d.]+)\//);
      const visualMatch = h.match(/Pilar Visual.*?:\s*([\d.]+)\//);
      const habitatMatch = h.match(/Pilar Habitat.*?:\s*([\d.]+)\//);
      const integrityMatch = h.match(/Pilar Integritas.*?:\s*([\d.]+)\//);
      const liMatch = h.match(/Linguistic Integrity Multiplier:\s*([\d.]+)/);
      const decayMatch = h.match(/Temporal Decay Factor: P\(t\) = ([\d.]+)/);
      const entityMatch = h.match(/Entity Resolution:\s*(.+)/);
      const tipeLaporanMatch = h.match(/Tipe Laporan:\s*(.+)/);
      const domainMatch = h.match(/Domain:\s*(.+)/);
      const kualitasMatch = h.match(/Kualitas Bukti:\s*(.+)/);
      const risikoMatch = h.match(/Risiko Klaim:\s*(.+)/);
      const publikasiMatch = h.match(/Kesiapan Publikasi:\s*(.+)/);
      const taxonMatch = h.match(/- Taxon:\s*(.+)/);
      const lokasiMatch = h.match(/- Lokasi:\s*(.+)/);
      const waktuMatch = h.match(/- Waktu:\s*(.+)/);
      const observerMatch = h.match(/- Observer:\s*(.+)/);
      const sampelMatch = h.match(/- Sampel:\s*(.+)/);

      result.header = {
        tipeLaporan: tipeLaporanMatch?.[1]?.trim() ?? "",
        domain: domainMatch?.[1]?.trim() ?? "",
        palantir: {
          overall: parseFloat(overallMatch?.[1] ?? "0"),
          level: levelMatch?.[1]?.trim() ?? "",
          geneticPillar: parseFloat(geneticMatch?.[1] ?? "0"),
          visualPillar: parseFloat(visualMatch?.[1] ?? "0"),
          habitatPillar: parseFloat(habitatMatch?.[1] ?? "0"),
          integrityPillar: parseFloat(integrityMatch?.[1] ?? "0"),
          linguisticMultiplier: parseFloat(liMatch?.[1] ?? "1"),
          temporalDecayFactor: parseFloat(decayMatch?.[1] ?? "1"),
          entityResolution: entityMatch?.[1]?.trim() ?? "",
        },
        kualitasBukti: (kualitasMatch?.[1]?.trim() ?? "Rendah") as NaLIIntelligenceHeader["kualitasBukti"],
        risikoKlaim: (risikoMatch?.[1]?.trim() ?? "Sedang") as NaLIIntelligenceHeader["risikoKlaim"],
        kesiapanPublikasi: publikasiMatch?.[1]?.trim() ?? "",
        entitasOPL: {
          taxon: taxonMatch?.[1]?.trim() ?? "tidak disebutkan",
          lokasi: lokasiMatch?.[1]?.trim() ?? "tidak disebutkan",
          waktu: waktuMatch?.[1]?.trim() ?? "tidak disebutkan",
          observer: observerMatch?.[1]?.trim() ?? "tidak disebutkan",
          sampel: sampelMatch?.[1]?.trim() ?? "tidak ada",
        },
      };
    }
  }

  const headerEndTag = isV2 ? "---END-INTELLIGENCE-HEADER---" : "---END-HEADER---";
  const afterHeader = raw.split(headerEndTag)[1] ?? "";
  const evidenceStartTag = "---NALI-EVIDENCE-TABLE---";
  result.reportMarkdown = afterHeader.split(evidenceStartTag)[0].trim();

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
      if (cells.length >= 4) {
        result.evidenceTable.push({
          klaim: cells[0] ?? "",
          pilarBukti: cells[1] ?? "",
          sumber: cells[2] ?? "",
          status: (cells[3] as EvidenceRow["status"]) ?? "Bukti kurang",
          risiko: (cells[4] as EvidenceRow["risiko"]) ?? "Sedang",
          kelemahan: cells[5] ?? cells[3] ?? "",
        });
      }
    }
  }

  const missingMatch = raw.match(/---NALI-MISSING-EVIDENCE---([\s\S]*?)---END-MISSING-EVIDENCE---/);
  if (missingMatch) {
    const lines = missingMatch[1].trim().split("\n").filter(Boolean);
    lines.forEach((line, i) => {
      const cleaned = line.replace(/^\[[\d.]+\]\s*\d+\.\s*/, "").replace(/^\d+\.\s*/, "");
      const parts = cleaned.split(" — ");
      result.missingEvidence.push({
        impactScore: parseFloat(line.match(/\[([\d.]+)\]/)?.[1] ?? "0"),
        number: i + 1,
        item: parts[0]?.trim() ?? cleaned,
        impact: parts[1]?.trim() ?? "",
        cara: parts[2]?.trim() ?? "",
      });
    });
  }

  const fupMatch = raw.match(/---NALI-FOLLOWUP-QUESTIONS---([\s\S]*?)---END-FOLLOWUP-QUESTIONS---/);
  if (fupMatch) {
    const lines = fupMatch[1]
      .trim()
      .split("\n")
      .filter((l) => l.match(/^Q\d:/));
    lines.forEach((line, i) => {
      const question = line.replace(/^Q\d:\s*/, "").trim();
      result.followUpQuestions.push({
        number: i + 1,
        question,
        gapType: "auto-detected",
      });
    });
  }

  const integrityMatch = raw.match(/---NALI-INTEGRITY-STATEMENT---([\s\S]*?)---END-INTEGRITY-STATEMENT---/);
  if (integrityMatch) {
    result.integrityStatement = integrityMatch[1].trim();
  }

  return result;
}
