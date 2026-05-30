export interface EvidenceRow {
  claim: string;
  source: string;
  status: string;
}

export interface ReportSection {
  title: string;
  content: string;
  isTable: boolean;
  tableRows: EvidenceRow[];
}

export interface ParsedReport {
  reportTitle: string;
  sections: ReportSection[];
}

export function parseReportMarkdown(markdown: string): ParsedReport {
  const lines = markdown.split("\n");
  let reportTitle = "";
  const sections: ReportSection[] = [];
  let current: ReportSection | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("# ")) {
      reportTitle = line.replace(/^# /, "").trim();
      continue;
    }

    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { title: line.replace(/^## /, "").trim(), content: "", isTable: false, tableRows: [] };
      continue;
    }

    if (line.startsWith("| ") && current) {
      if (line.includes("---")) continue; // separator
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      // skip header row
      if (cells.length >= 1 && cells[0].toLowerCase() === "klaim") continue;
      if (cells.length >= 3) {
        current.isTable = true;
        current.tableRows.push({ claim: cells[0], source: cells[1], status: cells[2] });
      }
      continue;
    }

    if (current) {
      // Strip italic/bold markdown for plain text in PDF
      const plain = line
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/^[-*]\s+/, "• ")
        .replace(/^\d+\.\s+/, "");
      if (plain.trim() === "---") continue; // hr
      current.content += plain + "\n";
    }
  }

  if (current) sections.push(current);

  return { reportTitle: reportTitle || "Laporan NaLI", sections };
}
