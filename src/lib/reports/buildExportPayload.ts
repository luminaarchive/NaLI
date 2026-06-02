import { parseNaLIOutput } from "@/lib/parse-nali-output";
import { calculatePalantirScore } from "@/lib/calculate-palantir-score";

/**
 * Builds the JSON payload consumed by /api/export-pdf and /api/export-docx from a
 * raw NaLI report markdown string. Shared by the in-app report view and the public
 * read-only /r/[id] page so both export identical documents.
 */
export function buildExportPayloadFromMarkdown(rawMarkdown: string, fallbackTitle?: string) {
  const parsedOut = parseNaLIOutput(rawMarkdown);
  const score = calculatePalantirScore(parsedOut);

  const titleMatch = rawMarkdown.match(/^#\s+(.+)/m);
  const reportTitle = titleMatch?.[1]?.trim() || fallbackTitle?.slice(0, 80) || "Laporan NaLI";

  const sections: Array<[string, string]> = [];
  const headingRe = /^##\s+(.+)\n([\s\S]*?)(?=^##\s|\n---NALI|$)/gm;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(rawMarkdown)) !== null) {
    const heading = m[1].trim().toUpperCase();
    const sbody = m[2].trim();
    const skip = ["ABSTRAK", "ABSTRACT", "KATA KUNCI", "KEYWORDS"];
    if (sbody && !skip.some((s) => heading.includes(s))) sections.push([heading, sbody]);
  }

  const abstractId = /##\s+Abstrak\s*\n([\s\S]*?)(?=^##\s|---NALI)/im.exec(rawMarkdown)?.[1]?.trim() ?? "";
  const abstractEn = /##\s+Abstract\s*\n([\s\S]*?)(?=^##\s|---NALI)/im.exec(rawMarkdown)?.[1]?.trim() ?? "";

  const evTable: string[][] = [["Klaim", "Pilar Bukti", "Status", "Catatan"]];
  for (const row of parsedOut.evidenceTable) {
    evTable.push([row.klaim || "", row.sumber || "", row.status || "", row.keterangan || ""]);
  }
  const missing = parsedOut.missingEvidence.map((item, i) => [
    String(item.number ?? i + 1),
    item.item ?? "",
    item.reason ?? "",
  ]);
  const questions = parsedOut.followUpQuestions.map((q) => q.question ?? "");
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return {
    title: reportTitle,
    subtitle: "Draft Laporan Berbasis Bukti — NaLI Evidence Intelligence OS v2.0",
    date: today,
    score: score.overall,
    level: score.level,
    kualitas: parsedOut.header?.kualitasBukti ?? "Sedang",
    risiko: parsedOut.header?.risikoKlaim ?? "Sedang",
    tipe: parsedOut.header?.tipeLaporan ?? "Laporan",
    g: score.genetic,
    v: score.visual,
    h: score.habitat,
    i: score.integrity,
    li: score.linguisticMultiplier,
    decay: score.temporalDecay,
    abstract_id: abstractId,
    abstract_en: abstractEn,
    keywords: (parsedOut.header?.tipeLaporan ?? "") + ", NaLI, laporan berbasis bukti",
    sections:
      sections.length > 0
        ? sections
        : [
            [
              "LAPORAN",
              rawMarkdown
                .replace(/^#+.+$/gm, "")
                .trim()
                .slice(0, 2000),
            ],
          ],
    ev_table: evTable.length > 1 ? evTable : [["Klaim", "Pilar Bukti", "Status", "Catatan"]],
    missing,
    questions,
    refs: [],
  };
}
