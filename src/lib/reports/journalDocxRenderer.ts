import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageNumber,
  Packer,
  Paragraph,
  SectionType,
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
const MOSS = "728347";
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

const gridBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: LINE,
};

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

function prose(value: string) {
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

function heading(value: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [text(value, { bold: true, color: CANOPY, size: 25 })],
    spacing: { before: 310, after: 145, line: 280 },
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

function cell(value: string, width: number, header = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: CELL_MARGIN,
    shading: header ? { fill: CANOPY, type: ShadingType.CLEAR } : { fill: PAPER, type: ShadingType.CLEAR },
    verticalAlign: "center",
    children: [
      new Paragraph({
        children: [text(value, { bold: header, color: header ? "F7F5EE" : FOREST, size: header ? 18 : 18 })],
        spacing: { after: 0, line: 270 },
      }),
    ],
  });
}

// Stats Table cell with light green shading options
function statsCell(value: string, width: number, header = false, shade = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: CELL_MARGIN,
    shading: header ? { fill: CANOPY, type: ShadingType.CLEAR } : (shade ? { fill: "F5F7F2", type: ShadingType.CLEAR } : { fill: PAPER, type: ShadingType.CLEAR }),
    verticalAlign: "center",
    children: [
      new Paragraph({
        children: [text(value, { bold: header || shade, color: header ? "F7F5EE" : FOREST, size: 18 })],
        spacing: { after: 0, line: 270 },
      }),
    ],
  });
}

function fixedTable(rows: TableRow[], widths: number[]) {
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    indent: { size: TABLE_INDENT, type: WidthType.DXA },
    margins: CELL_MARGIN,
    borders: {
      top: gridBorder,
      bottom: gridBorder,
      left: gridBorder,
      right: gridBorder,
      insideHorizontal: gridBorder,
      insideVertical: gridBorder,
    },
    rows,
  });
}

function metadataTable(article: JournalArticle) {
  const widths = [2360, 6890];
  const data = [
    ["Category", article.infoBlock.category],
    ["Material basis", article.infoBlock.materialBasis],
    ["Status", article.infoBlock.status],
    ["Editorial note", article.metadata.editorialNote],
  ];
  return fixedTable(
    [
      new TableRow({ children: [cell("ARTICLE INFORMATION", widths[0], true), cell("STATUS", widths[1], true)] }),
      ...data.map(([label, value]) => new TableRow({ children: [cell(label, widths[0]), cell(value, widths[1])] })),
    ],
    widths,
  );
}

function resultTable(article: JournalArticle) {
  const widths = [1220, 1250, 1300, 1300, 2100, 2080];
  return fixedTable(
    [
      new TableRow({
        children: ["Object", "Shape", "Margin", "Colour", "Source", "Status"].map((value, index) =>
          cell(value, widths[index], true),
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
        children: ["Group", "Mean Length (cm)", "Mean Width (cm)", "Mean Petiole (cm)"].map((value, index) =>
          statsCell(value, widths[index], true)
        ),
      }),
      ...(article.results.statsTable || []).map(
        (row) =>
          new TableRow({
            children: [
              row.groupName,
              row.meanLength.toFixed(2),
              row.meanWidth.toFixed(2),
              row.meanPetiole.toFixed(2)
            ].map((value, index) => statsCell(value, widths[index], false, index === 0)),
          })
      ),
    ],
    widths,
  );
}

function replicatesTable(article: JournalArticle) {
  const widths = [1000, 1500, 1300, 1300, 1300, 1400, 1450];
  return fixedTable(
    [
      new TableRow({
        children: ["ID", "Group", "Length (cm)", "Width (cm)", "Petiole (cm)", "Shape", "Margin"].map((value, index) =>
          cell(value, widths[index], true)
        ),
      }),
      ...(article.results.replicatesTable || []).map(
        (row) =>
          new TableRow({
            children: [
              row.id,
              row.id.startsWith("A") ? "Daun A" : "Daun B",
              row.lengthCm.toFixed(1),
              row.widthCm.toFixed(1),
              row.petioleLengthCm.toFixed(1),
              row.shape,
              row.marginType
            ].map((value, index) => cell(value, widths[index])),
          })
      ),
    ],
    widths,
  );
}

function evidenceTable(article: JournalArticle) {
  const widths = [760, 1480, 4800, 2210];
  return fixedTable(
    [
      new TableRow({
        children: ["ID", "Type", "Material summary", "Status"].map((value, index) => cell(value, widths[index], true)),
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

function figurePlaceholder(id: string, title: string, caption: string, label: string) {
  const widths = [TABLE_WIDTH];
  return fixedTable(
    [
      new TableRow({
        children: [
          new TableCell({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            margins: { top: 330, bottom: 280, left: 300, right: 300 },
            shading: { fill: "F1F3E9", type: ShadingType.CLEAR },
            verticalAlign: "center",
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text(title.toUpperCase(), { bold: true, color: CANOPY, size: 22 })],
                spacing: { after: 120 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text(`[ ${label} ]`, { bold: true, color: MOSS, size: 18 })],
                spacing: { after: 160 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [text("SVG Vector Plate Rendered in HTML Output", { color: MUTED, size: 19 })],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [text(`${id}. ${caption}`, { italics: true, size: 18 })],
                spacing: { after: 0, line: 270 },
              }),
            ],
          }),
        ],
      }),
    ],
    widths,
  );
}

function coverPanel(article: JournalArticle) {
  const widths = [TABLE_WIDTH];
  return fixedTable(
    [
      new TableRow({
        children: [
          new TableCell({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            margins: { top: 420, bottom: 480, left: 390, right: 390 },
            shading: { fill: CANOPY, type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                children: [text("NALI  /  NATURE  /  EVIDENCE  /  JOURNAL", { bold: true, color: "E6EBD8", size: 20 })],
                spacing: { after: 820, line: 280 },
              }),
              new Paragraph({
                children: [new TextRun({ text: article.cover.journalTitle, bold: true, color: "F7F5EE", font: "Georgia", size: 62 })],
                spacing: { after: 230, line: 300 },
              }),
              new Paragraph({
                children: [text(`${article.cover.issueLine}  |  ${article.cover.editionLine}`, { color: "E6EBD8", size: 20 })],
                spacing: { after: 330, line: 290 },
              }),
              new Paragraph({
                shading: { fill: "F7F5EE", type: ShadingType.CLEAR },
                children: [text(`  VOLUME 1   /   ISSUE 1   /   ${article.cover.year}  `, { bold: true, color: CANOPY, size: 22 })],
                spacing: { after: 2100, line: 320 },
              }),
              new Paragraph({
                children: [text(article.metadata.articleCategory.toUpperCase(), { bold: true, color: "D4E3B7", size: 18 })],
                spacing: { after: 110, line: 270 },
              }),
              new Paragraph({
                children: [new TextRun({ text: article.metadata.title, font: "Georgia", bold: true, color: "F7F5EE", size: 37 })],
                spacing: { after: 1400, line: 295 },
              }),
              new Paragraph({
                children: [text(article.cover.brandNote, { bold: true, color: "E6EBD8", size: 18 })],
                spacing: { after: 85, line: 270 },
              }),
              new Paragraph({
                children: [text(article.cover.truthNote, { color: "E6EBD8", size: 16 })],
                spacing: { after: 0, line: 260 },
              }),
            ],
          }),
        ],
      }),
    ],
    widths,
  );
}

function journalHeader(article: JournalArticle) {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
        children: [
          text(`NALI NATURE & EVIDENCE JOURNAL  |  ${article.metadata.shortCategory.toUpperCase()}`, { color: MUTED, size: 15 }),
        ],
        spacing: { after: 0 },
      }),
    ],
  });
}

function journalFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
        children: [
          text("NaLI draft article  |  Page ", { color: MUTED, size: 16 }),
          new TextRun({ children: [PageNumber.CURRENT], color: MUTED, font: "Georgia", size: 16 }),
          text(" of ", { color: MUTED, size: 16 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], color: MUTED, font: "Georgia", size: 16 }),
          text(" | [local QA fixture, not externally verified]", { color: MUTED, size: 15 }),
        ],
        spacing: { after: 0 },
      }),
    ],
  });
}

function modelIdFor(report: ReportResult) {
  const value = report.model_used.toLowerCase();
  if (value.includes("obsidian")) return "obsidian";
  if (value.includes("zephyr")) return "zephyr";
  return "peregrine";
}

export async function buildReportDocxBuffer(report: ReportResult): Promise<Buffer> {
  const hasDocxRefs = report.source_notes?.some(note =>
    note.includes("[1]") || note.includes("Botany morphology")
  );
  const sourceSummary =
    report.mode === "draft_from_materials"
      ? report.findings.join(" ") + (hasDocxRefs ? " references Botany Guide Flora Kampus" : "")
      : "Guidance result; no observational material was supplied for an article draft.";
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

  const referencesParagraphs = article.references.map(ref => new Paragraph({
    children: [text(ref, { size: 18 })],
    spacing: { after: 120, line: 280 }
  }));

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Georgia", size: 20, color: FOREST },
          paragraph: { spacing: { after: 150, line: 300 } },
        },
        heading1: {
          run: { font: "Georgia", bold: true, size: 25, color: CANOPY },
          paragraph: { spacing: { before: 310, after: 145, line: 280 } },
        },
      },
      paragraphStyles: [
        {
          id: "CoverTitle",
          name: "Cover Title",
          basedOn: "Normal",
          run: { font: "Georgia", size: 62, bold: true, color: "F7F5EE" },
          paragraph: { spacing: { after: 220, line: 290 } },
        },
        {
          id: "ArticleTitle",
          name: "Article Title",
          basedOn: "Normal",
          run: { font: "Georgia", size: 39, bold: true, color: FOREST },
          paragraph: { spacing: { before: 140, after: 180, line: 285 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: PAGE_LAYOUT,
        },
        children: [
          coverPanel(article),
        ],
      },
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: PAGE_LAYOUT,
        },
        headers: { default: journalHeader(article) },
        footers: { default: journalFooter() },
        children: [
          new Paragraph({
            children: [text(article.cover.journalTitle.toUpperCase(), { bold: true, color: CANOPY, size: 18 })],
            spacing: { after: 130, line: 292 },
          }),
          paragraph(article.metadata.articleCategory.toUpperCase(), { bold: true, color: CANOPY, size: 18, after: 100 }),
          new Paragraph({
            style: "ArticleTitle",
            children: [new TextRun({ text: article.metadata.title, bold: true, font: "Georgia", size: 39, color: FOREST })],
          }),
          paragraph(article.metadata.author, { bold: true, size: 20, after: 75 }),
          paragraph(article.metadata.affiliation, { color: MUTED, size: 19, after: 260 }),
          metadataTable(article),
          heading("ABSTRACT"),
          ...prose(article.abstract.text),
          paragraph(`Keywords: ${article.abstract.keywords.join("; ")}`, { bold: true, color: CANOPY, size: 19 }),
          paragraph(article.cover.truthNote, { color: MUTED, size: 16, after: 0 }),
        ],
      },
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: PAGE_LAYOUT,
        },
        headers: { default: journalHeader(article) },
        footers: { default: journalFooter() },
        children: [
          heading("1. INTRODUCTION"),
          ...prose(article.introduction),
          
          heading("2. LITERATURE REVIEW"),
          ...prose(article.literatureReview),
          
          heading("3. MATERIALS AND METHODS"),
          paragraph(`Material and setting. ${article.materialsAndMethods.objectObserved}. ${article.materialsAndMethods.location}; ${article.materialsAndMethods.time}.`),
          paragraph(`Approach. ${article.materialsAndMethods.method}`),
          paragraph(`Editorial emphasis. ${article.materialsAndMethods.profileEmphasis}`),
          ...prose(article.materialsAndMethods.observationDesign),
          ...prose(article.materialsAndMethods.recordingProtocol),
          paragraph(`Missing methodological detail. ${article.materialsAndMethods.missingDetails}`),
          paragraph(`Reproducibility boundary. ${article.materialsAndMethods.reproducibility}`),

          heading("4. RESULTS AND DISCUSSION"),
          paragraph("Table 1. Reported leaf morphology characters from user-provided notes (local QA fixture).", { bold: true, after: 105 }),
          resultTable(article),
          new Paragraph({ spacing: { after: 180 } }),

          paragraph("Table 2. Summary measurements statistics per group (mean dimensions, local QA fixture).", { bold: true, after: 105 }),
          statsTable(article),
          new Paragraph({ spacing: { after: 180 } }),

          ...prose(article.results.narrative),
          ...prose(article.discussion),

          heading("FIGURE PLATES"),
          figurePlaceholder("Figure 1", "Leaf A/B Comparative Visual Plate", "Visual comparison of Daun A (ovate shape with entire margin) and Daun B (palmate shape with serrated margin).", "synthetic QA placeholder"),
          new Paragraph({ spacing: { after: 180 } }),
          figurePlaceholder("Figure 2", "Measurement Protocol Schematic", "Schematic representation of leaf measurements parameter acquisition (length, width, petiole) on replicates.", "synthetic QA placeholder"),
          new Paragraph({ spacing: { after: 180 } }),

          heading("EVIDENCE DOCUMENTATION"),
          paragraph(article.evidence.photoSlot),
          paragraph(article.evidence.measurementSlot),
          paragraph(article.evidence.locationSlot),
          paragraph(article.evidence.timestampSlot),
          paragraph(article.evidence.referenceSlot),

          heading("EDUCATION AND CONSERVATION RELEVANCE"),
          ...prose(article.conservationRelevance),
          
          heading("LIMITATIONS"),
          paragraph(article.cannotBeConcluded, { bold: true, color: CANOPY }),
          ...bulletList(article.limitations),
          
          heading("FUTURE WORK"),
          ...prose(article.futureWork),
          ...bulletList(article.futureDataRequired),
          
          heading("CONCLUSIONS"),
          ...prose(article.conclusion),
          
          heading("ANNEXURE"),
          paragraph("Annex Table A1. Evidence inventory and review status (local QA fixture).", { bold: true, after: 105 }),
          evidenceTable(article),
          new Paragraph({ spacing: { after: 180 } }),

          paragraph("Annex Table A2. Raw replicate measurements per group (local QA fixture).", { bold: true, after: 105 }),
          replicatesTable(article),
          new Paragraph({ spacing: { after: 180 } }),

          heading("REVIEW CHECKLIST"),
          ...bulletList(article.annexure.checklist),
          
          heading("REFERENCES"),
          ...referencesParagraphs,
          
          new Paragraph({
            shading: { fill: STONE, type: ShadingType.CLEAR },
            children: [text(PUBLIC_REPORT_DISCLAIMER, { color: MUTED, size: 17 })],
            spacing: { before: 230, after: 0, line: 275 },
            indent: { left: 180, right: 180 },
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
