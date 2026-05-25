import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ReportResult } from "./reportGenerator";
import { PUBLIC_REPORT_DISCLAIMER } from "./reportGenerator";
import { buildJournalArticle, type JournalArticle } from "./journalArticleTemplate";

const PAPER = "FDFCF8";
const FOREST = "10231B";
const CANOPY = "315F45";
const AUDIT = "314752";
const GOLD = "87662C";
const MUTED = "59645E";
const STONE = "EEE9DD";
const LINE = "CFC6B7";
const TABLE_WIDTH = 9250;
const TABLE_INDENT = 120;
const CELL_MARGIN = { top: 100, bottom: 100, left: 120, right: 120 };
const PAGE_LAYOUT = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1134, right: 1328, bottom: 1134, left: 1328, header: 620, footer: 620 },
};

type DocNode = Paragraph | Table;

function accent(article: JournalArticle) {
  return article.modelId === "obsidian" ? AUDIT : article.modelId === "zephyr" ? GOLD : CANOPY;
}

function text(value: string, options: { bold?: boolean; color?: string; italics?: boolean; size?: number } = {}) {
  return new TextRun({
    text: value,
    bold: options.bold,
    color: options.color || FOREST,
    font: "Georgia",
    italics: options.italics,
    size: options.size || 20,
  });
}

function paragraph(value: string, options: { after?: number; bold?: boolean; color?: string; size?: number } = {}) {
  return new Paragraph({
    children: [text(value, options)],
    spacing: { after: options.after ?? 150, line: 292 },
  });
}

function prose(value: string): Paragraph[] {
  return value
    .split(/\n\n+/)
    .filter(Boolean)
    .map(
      (part) =>
        new Paragraph({
          children: [text(part)],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 170, line: 300 },
        }),
    );
}

function heading(article: JournalArticle, value: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [text(value, { bold: true, color: accent(article), size: 25 })],
    spacing: { before: 270, after: 145, line: 280 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
    keepNext: true,
  });
}

function bulletList(items: string[]) {
  return items.map(
    (item) =>
      new Paragraph({
        bullet: { level: 0 },
        children: [text(item)],
        spacing: { after: 105, line: 285 },
      }),
  );
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function callout(article: JournalArticle, title: string, body: string) {
  return new Paragraph({
    shading: {
      fill: article.modelId === "zephyr" ? "F3ECDD" : article.modelId === "obsidian" ? "EDF1F2" : "EFF2E8",
      type: ShadingType.CLEAR,
    },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: accent(article), space: 9 } },
    children: [
      text(`${title.toUpperCase()}  `, { bold: true, color: accent(article), size: 18 }),
      text(body, { size: 18 }),
    ],
    spacing: { before: 120, after: 190, line: 285 },
    indent: { left: 150, right: 150 },
  });
}

function cell(value: string, width: number, header = false, fill?: string) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: CELL_MARGIN,
    shading: { fill: header ? fill || CANOPY : PAPER, type: ShadingType.CLEAR },
    verticalAlign: "center",
    children: [
      new Paragraph({
        children: [text(value, { bold: header, color: header ? "F7F5EE" : FOREST, size: 18 })],
        spacing: { after: 0, line: 270 },
      }),
    ],
  });
}

function fixedTable(rows: TableRow[], widths: number[]) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    indent: { size: TABLE_INDENT, type: WidthType.DXA },
    margins: CELL_MARGIN,
    borders: {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: border,
      insideVertical: border,
    },
    rows,
  });
}

function resultTable(article: JournalArticle) {
  const widths = [1220, 1250, 1300, 1300, 2100, 2080];
  return fixedTable(
    [
      new TableRow({
        children: ["Object", "Shape", "Margin", "Colour", "Source", "Status"].map((value, index) =>
          cell(value, widths[index], true, accent(article)),
        ),
      }),
      ...article.results.comparisonTable.map(
        (row) =>
          new TableRow({
            children: [row.object, row.shape, row.margin, row.color, row.source, row.evidenceStatus].map(
              (value, index) => cell(value, widths[index]),
            ),
          }),
      ),
    ],
    widths,
  );
}

function statsTable(article: JournalArticle) {
  const widths = [2360, 2300, 2300, 2290];
  return fixedTable(
    [
      new TableRow({
        children: ["Group", "Mean Length", "Mean Width", "Mean Petiole"].map((value, index) =>
          cell(value, widths[index], true, accent(article)),
        ),
      }),
      ...(article.results.statsTable || []).map(
        (row) =>
          new TableRow({
            children: [
              row.groupName,
              row.meanLength.toFixed(2),
              row.meanWidth.toFixed(2),
              row.meanPetiole.toFixed(2),
            ].map((value, index) => cell(value, widths[index])),
          }),
      ),
    ],
    widths,
  );
}

function replicatesTable(article: JournalArticle) {
  const widths = [1050, 1700, 1500, 1500, 1700, 1800];
  return fixedTable(
    [
      new TableRow({
        children: ["ID", "Length", "Width", "Petiole", "Shape", "Margin"].map((value, index) =>
          cell(value, widths[index], true, accent(article)),
        ),
      }),
      ...(article.results.replicatesTable || []).map(
        (row) =>
          new TableRow({
            children: [
              row.id,
              row.lengthCm.toFixed(1),
              row.widthCm.toFixed(1),
              row.petioleLengthCm.toFixed(1),
              row.shape,
              row.marginType,
            ].map((value, index) => cell(value, widths[index])),
          }),
      ),
    ],
    widths,
  );
}

function evidenceTable(article: JournalArticle) {
  const widths = [800, 1550, 4650, 2250];
  return fixedTable(
    [
      new TableRow({
        children: ["ID", "Type", "Material summary", "Status"].map((value, index) =>
          cell(value, widths[index], true, accent(article)),
        ),
      }),
      ...article.annexure.evidenceTable.map(
        (row) =>
          new TableRow({
            children: [row.id, row.material_type, row.summary, row.verification_status].map((value, index) =>
              cell(value, widths[index]),
            ),
          }),
      ),
    ],
    widths,
  );
}

function editorialReadinessTable(article: JournalArticle) {
  const widths = [6500, 2850];
  return fixedTable(
    [
      new TableRow({
        children: ["Editorial control", "Status"].map((value, index) =>
          cell(value, widths[index], true, accent(article)),
        ),
      }),
      ...(article.premium?.reviewerReadinessChecklist ?? []).map(
        (item) =>
          new TableRow({
            children: [item, "Perlu verifikasi pengguna"].map((value, index) => cell(value, widths[index])),
          }),
      ),
    ],
    widths,
  );
}

function figurePlate(article: JournalArticle, id: string, caption: string) {
  return fixedTable(
    [
      new TableRow({
        children: [
          new TableCell({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            margins: { top: 330, bottom: 280, left: 300, right: 300 },
            shading: { fill: article.modelId === "zephyr" ? "F3ECDD" : "F1F3E9", type: ShadingType.CLEAR },
            verticalAlign: "center",
            children: [
              paragraph(`${id} / ${article.capabilities.badge}`, { bold: true, color: accent(article), size: 21 }),
              paragraph("[ synthetic QA placeholder - not specimen evidence ]", { bold: true, color: MUTED, size: 18 }),
              paragraph(caption, { size: 18 }),
            ],
          }),
        ],
      }),
    ],
    [TABLE_WIDTH],
  );
}

function coverPanel(article: JournalArticle) {
  const background = article.modelId === "zephyr" ? GOLD : article.modelId === "obsidian" ? AUDIT : CANOPY;
  return fixedTable(
    [
      new TableRow({
        children: [
          new TableCell({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            margins: { top: 500, bottom: 520, left: 430, right: 430 },
            shading: { fill: background, type: ShadingType.CLEAR },
            children: [
              paragraph("NALI / NATURE / EVIDENCE", { bold: true, color: "E7ECD9", size: 20, after: 620 }),
              paragraph(article.capabilities.badge.toUpperCase(), {
                bold: true,
                color: "F0D38D",
                size: 20,
                after: 500,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: article.cover.journalTitle,
                    bold: true,
                    color: "F7F5EE",
                    font: "Georgia",
                    size: article.modelId === "peregrine" ? 47 : 60,
                  }),
                ],
                spacing: { after: 300, line: 300 },
              }),
              paragraph(article.metadata.articleCategory.toUpperCase(), {
                bold: true,
                color: "E7ECD9",
                size: 19,
                after: 290,
              }),
              paragraph(article.metadata.title, {
                bold: true,
                color: "F7F5EE",
                size: 34,
                after: article.modelId === "peregrine" ? 1600 : 2250,
              }),
              paragraph(article.metadata.editorialNote, { color: "E7ECD9", size: 18, after: 350 }),
              paragraph(article.cover.brandNote, { bold: true, color: "E7ECD9", size: 17, after: 80 }),
              paragraph(article.cover.truthNote, { color: "E7ECD9", size: 16, after: 0 }),
            ],
          }),
        ],
      }),
    ],
    [TABLE_WIDTH],
  );
}

function journalHeader(article: JournalArticle) {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
        children: [
          text(`NALI NATURE & EVIDENCE JOURNAL  |  ${article.capabilities.badge.toUpperCase()}`, {
            color: MUTED,
            size: 15,
          }),
        ],
        spacing: { after: 0 },
      }),
    ],
  });
}

function journalFooter(article: JournalArticle) {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
        children: [
          text(`${article.capabilities.costLabel} draft | Page `, { color: MUTED, size: 16 }),
          new TextRun({ children: [PageNumber.CURRENT], color: MUTED, font: "Georgia", size: 16 }),
          text(" of ", { color: MUTED, size: 16 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], color: MUTED, font: "Georgia", size: 16 }),
          text(" | local QA fixture, not externally verified", { color: MUTED, size: 15 }),
        ],
      }),
    ],
  });
}

function starterBody(article: JournalArticle): DocNode[] {
  return [
    heading(article, "STARTER ABSTRACT"),
    ...prose(article.abstract.text),
    callout(
      article,
      "Limited Starter Output",
      "Output cepat untuk praktikum dasar; sengaja bukan jurnal panjang atau audit penuh.",
    ),
    pageBreak(),
    heading(article, "1. BACKGROUND FOR PRACTICUM"),
    ...prose(article.introduction),
    heading(article, "2. SIMPLE MATERIALS AND METHOD"),
    paragraph(article.materialsAndMethods.method),
    paragraph(article.materialsAndMethods.profileEmphasis),
    pageBreak(),
    heading(article, "3. STARTER RESULTS"),
    paragraph("Table 1. Simple visual comparison from user-provided notes (local QA fixture).", { bold: true }),
    resultTable(article),
    ...prose(article.results.narrative),
    figurePlate(
      article,
      "Figure 1",
      "Starter visual plate only; illustrative local QA placeholder, not specimen evidence.",
    ),
    pageBreak(),
    heading(article, "4. SHORT LIMITATION CHECKLIST"),
    ...bulletList(article.limitations),
    heading(article, "CONCLUSION"),
    ...prose(article.conclusion),
    callout(article, "Upgrade path", article.upgradeNote || ""),
    heading(article, "REFERENCES PROVIDED BY USER"),
    ...article.references.map((reference) => paragraph(reference, { size: 18 })),
    callout(article, "Integrity", PUBLIC_REPORT_DISCLAIMER),
  ];
}

function auditBody(article: JournalArticle): DocNode[] {
  const audit = article.audit!;
  return [
    heading(article, "AUDIT ABSTRACT"),
    ...prose(article.abstract.text),
    callout(article, "Evidence Audit", audit.evidenceSufficiencyAssessment),
    pageBreak(),
    heading(article, "1. INTRODUCTION / SCOPE AND CLAIM BOUNDARY"),
    ...prose(article.introduction),
    pageBreak(),
    heading(article, "2. LITERATURE REVIEW / CITATION BOUNDARY AUDIT"),
    ...prose(article.literatureReview),
    callout(article, "Citation Boundary Audit", audit.citationBoundaryAudit),
    pageBreak(),
    heading(article, "3. MATERIALS AND METHODS / AUDIT PROTOCOL"),
    paragraph(article.materialsAndMethods.method),
    paragraph(article.materialsAndMethods.profileEmphasis),
    heading(article, "EVIDENCE DOCUMENTATION / INVENTORY"),
    evidenceTable(article),
    pageBreak(),
    heading(article, "4. RESULTS AND DISCUSSION / MEASUREMENT TABLES"),
    paragraph("Table 1. Reported visual characters retained with source boundary.", { bold: true }),
    resultTable(article),
    paragraph("Table 2. Summary measurements statistics per group (local QA fixture).", { bold: true }),
    statsTable(article),
    pageBreak(),
    heading(article, "FIGURE PLATES"),
    figurePlate(article, "Figure 1", "Reported morphology comparison; illustrative QA plate only."),
    figurePlate(article, "Figure 2", "Measurement protocol guide; illustrative QA plate only."),
    pageBreak(),
    heading(article, "EVIDENCE SUFFICIENCY ASSESSMENT"),
    callout(article, "Sufficiency", audit.evidenceSufficiencyAssessment),
    paragraph(audit.reliabilityScore),
    heading(article, "CANNOT BE CONCLUDED"),
    callout(article, "Cannot Be Concluded", article.cannotBeConcluded),
    heading(article, "DATA RISK REGISTER"),
    ...bulletList(audit.dataRiskRegister),
    pageBreak(),
    heading(article, "METHODOLOGICAL VULNERABILITY"),
    ...prose(audit.methodologicalVulnerability),
    heading(article, "SOURCE GAP ANALYSIS"),
    ...prose(audit.sourceGapAnalysis),
    heading(article, "CONCLUSIONS"),
    ...prose(article.conclusion),
    callout(article, "Next editorial tier", article.upgradeNote || ""),
    pageBreak(),
    heading(article, "ANNEXURE"),
    paragraph("Annex Table A2. Raw replicate measurements per group (local QA fixture).", { bold: true }),
    replicatesTable(article),
    heading(article, "REFERENCES"),
    ...article.references.map((reference) => paragraph(reference, { size: 18 })),
    callout(article, "Integrity", PUBLIC_REPORT_DISCLAIMER),
  ];
}

function premiumBody(article: JournalArticle): DocNode[] {
  const premium = article.premium!;
  return [
    heading(article, "EXECUTIVE EDITORIAL SUMMARY"),
    callout(article, "Premium Journal Draft", premium.executiveEditorialSummary),
    heading(article, "EDITORIAL ABSTRACT"),
    ...prose(article.abstract.text),
    pageBreak(),
    heading(article, "1. INTRODUCTION"),
    ...prose(article.introduction),
    pageBreak(),
    heading(article, "2. INTEGRATED LITERATURE FRAMING"),
    ...prose(premium.integratedLiteratureFraming),
    ...prose(article.literatureReview),
    pageBreak(),
    heading(article, "3. MATERIALS AND METHODS"),
    paragraph(article.materialsAndMethods.method),
    paragraph(article.materialsAndMethods.profileEmphasis),
    ...prose(article.materialsAndMethods.observationDesign),
    callout(article, "Traceability Boundary", article.materialsAndMethods.missingDetails),
    pageBreak(),
    heading(article, "4. RESULTS"),
    paragraph(premium.refinedTableCaptions[0], { bold: true }),
    resultTable(article),
    paragraph(premium.refinedTableCaptions[1], { bold: true }),
    statsTable(article),
    pageBreak(),
    heading(article, "REFINED FIGURE CAPTIONS AND PLATES"),
    figurePlate(article, "Figure 1", premium.refinedFigureCaptions[0]),
    figurePlate(article, "Figure 2", premium.refinedFigureCaptions[1]),
    pageBreak(),
    heading(article, "EDITORIAL STRUCTURE HARMONIZATION"),
    figurePlate(article, "Figure 3", premium.refinedFigureCaptions[2]),
    callout(
      article,
      "Editorial control",
      "The premium structure links supplied material, declared limits, and revision work without treating editorial organization as verification.",
    ),
    pageBreak(),
    heading(article, "5. INTEGRATED DISCUSSION"),
    ...prose(article.discussion),
    callout(article, "Editorial Synthesis", premium.integratedDiscussion),
    pageBreak(),
    heading(article, "6. EVIDENCE AND SOURCE LIMITS"),
    ...bulletList(article.limitations),
    callout(article, "Cannot Be Concluded", article.cannotBeConcluded),
    pageBreak(),
    heading(article, "7. PREMIUM CONCLUSION"),
    ...prose(article.conclusion),
    heading(article, "EDUCATION AND CONSERVATION RELEVANCE"),
    ...prose(article.conservationRelevance),
    pageBreak(),
    heading(article, "8. PUBLICATION-STYLE REVISION NOTES"),
    ...bulletList(premium.publicationStyleRevisionNotes),
    heading(article, "9. REVIEWER-READINESS CHECKLIST"),
    ...bulletList(premium.reviewerReadinessChecklist),
    paragraph("Table E1. Premium reviewer-readiness controls before editorial use.", { bold: true }),
    editorialReadinessTable(article),
    pageBreak(),
    heading(article, "10. ANNEXURE AND REFERENCES PRESENTATION"),
    evidenceTable(article),
    paragraph("Annex Table A2. Supplied replicate entries (local QA fixture).", { bold: true }),
    replicatesTable(article),
    pageBreak(),
    heading(article, "EDITORIAL INTEGRITY SHEET"),
    callout(
      article,
      "Document Status",
      `${article.metadata.sourceVerificationStatus}. ${article.metadata.publicExportStatus}.`,
    ),
    heading(article, "REFERENCES"),
    ...article.references.map((reference) => paragraph(reference, { size: 18 })),
    callout(article, "Final Responsibility", PUBLIC_REPORT_DISCLAIMER),
  ];
}

function modelIdFor(report: ReportResult) {
  const value = report.model_used.toLowerCase();
  if (value.includes("obsidian")) return "obsidian";
  if (value.includes("zephyr")) return "zephyr";
  return "peregrine";
}

export async function buildReportDocxBuffer(report: ReportResult): Promise<Buffer> {
  const sourceSummary =
    report.mode === "draft_from_materials"
      ? `${report.findings.join(" ")} references Botany Guide Flora Kampus`
      : "Guidance result; no observational material was supplied.";
  const article = buildJournalArticle(
    {
      title: report.title,
      reportTemplate: report.report_type,
      mainText: sourceSummary,
      created_at: report.created_at,
      location: "Sekitar halaman kampus",
    },
    modelIdFor(report),
  );
  const body =
    article.modelId === "peregrine"
      ? starterBody(article)
      : article.modelId === "obsidian"
        ? auditBody(article)
        : premiumBody(article);
  const document = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Georgia", size: 20, color: FOREST },
          paragraph: { spacing: { after: 150, line: 300 } },
        },
        heading1: { run: { font: "Georgia", bold: true, size: 25, color: accent(article) } },
      },
    },
    sections: [
      {
        properties: { page: PAGE_LAYOUT },
        headers: { default: journalHeader(article) },
        footers: { default: journalFooter(article) },
        children: [coverPanel(article), pageBreak(), ...body],
      },
    ],
  });

  return Packer.toBuffer(document);
}
