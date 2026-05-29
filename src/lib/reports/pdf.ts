import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ReportResult } from "@/lib/reports/reportGenerator";
import { buildReportMarkdown, type ReportMarkdownOptions } from "@/lib/reports/markdown";
import { buildJournalArticle, mapJournalArticleToDraftReport } from "./journalArticleTemplate";

type TextStyle = {
  color: ReturnType<typeof rgb>;
  font: PDFFont;
  lineGap: number;
  size: number;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 48;
const MARGIN_TOP = 48;
const MARGIN_BOTTOM = 56;
const BASE_TEXT = rgb(0.15, 0.15, 0.15);
const MUTED_TEXT = rgb(0.4, 0.4, 0.4);
const HEADING_TEXT = rgb(0.02, 0.12, 0.18);
const ACCENT_COLOR = rgb(0.1, 0.45, 0.45); // NaLI dark teal

function toPdfSafeText(value: string) {
  return value
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2022/g, "-")
    .replace(/[^\x09\x0a\x0d\x20-\x7e\xa0-\xff]/g, "?")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkdown(line: string) {
  return toPdfSafeText(
    line
      .replace(/^#{1,6}\s*/, "")
      .replace(/^\|\s*/, "")
      .replace(/\s*\|$/g, "")
      .replace(/\s*\|\s*/g, "  ")
      .replace(/^\s*[-*]\s+/, "- ")
      .replace(/\*\*/g, "")
      .replace(/`/g, ""),
  );
}

function getLineStyle(line: string, fonts: { bold: PDFFont; regular: PDFFont }): TextStyle {
  if (line.startsWith("# ")) {
    return { color: HEADING_TEXT, font: fonts.bold, lineGap: 8, size: 14 };
  }

  if (line.startsWith("## ")) {
    return { color: HEADING_TEXT, font: fonts.bold, lineGap: 6, size: 11 };
  }

  if (line.startsWith("### ")) {
    return { color: HEADING_TEXT, font: fonts.bold, lineGap: 5, size: 9.5 };
  }

  return { color: BASE_TEXT, font: fonts.regular, lineGap: 5, size: 8.5 };
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (!text) return [];

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);

    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word;
      continue;
    }

    let chunk = "";
    for (const char of word) {
      const next = `${chunk}${char}`;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        chunk = next;
      } else {
        if (chunk) lines.push(chunk);
        chunk = char;
      }
    }
    current = chunk;
  }

  if (current) lines.push(current);
  return lines;
}

function addPage(pdf: PDFDocument) {
  return pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
}

function drawTableRow(
  pdf: PDFDocument,
  page: PDFPage,
  y: number,
  cells: string[],
  isHeader: boolean,
  fonts: { bold: PDFFont; regular: PDFFont },
  colWidths: number[]
): { nextY: number; page: PDFPage } {
  const font = isHeader ? fonts.bold : fonts.regular;
  const size = isHeader ? 8 : 7.5;
  const padding = 5;
  const lineHeight = size + 3;
  
  const cellLines = cells.map((cell, idx) => wrapText(cell.trim(), font, size, colWidths[idx] - padding * 2));
  const maxLines = Math.max(...cellLines.map(lines => lines.length), 1);
  const rowHeight = maxLines * lineHeight + padding * 2;
  
  if (y - rowHeight < MARGIN_BOTTOM) {
    page = addPage(pdf);
    y = PAGE_HEIGHT - MARGIN_TOP;
  }
  
  const bg = isHeader ? rgb(0.92, 0.94, 0.96) : (Math.floor(y) % 2 === 0 ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1));
  page.drawRectangle({
    x: MARGIN_X,
    y: y - rowHeight,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: rowHeight,
    color: bg,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.5
  });
  
  let currentX = MARGIN_X;
  for (let idx = 0; idx < cells.length; idx++) {
    const lines = cellLines[idx];
    const colWidth = colWidths[idx];
    
    if (idx > 0) {
      page.drawLine({
        start: { x: currentX, y: y },
        end: { x: currentX, y: y - rowHeight },
        color: rgb(0.85, 0.85, 0.85),
        thickness: 0.5
      });
    }
    
    let textY = y - padding - size;
    for (const line of lines) {
      page.drawText(line, {
        x: currentX + padding,
        y: textY,
        font,
        size,
        color: BASE_TEXT
      });
      textY -= lineHeight;
    }
    currentX += colWidth;
  }
  
  return { nextY: y - rowHeight, page };
}

export async function buildReportPdfBytes(report: ReportResult, options: ReportMarkdownOptions = {}) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fonts = { bold, regular };
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2;

  // Extract model ID for specific profiles
  const modelId = report.model_used.toLowerCase().includes("obsidian") ? "obsidian" :
                  report.model_used.toLowerCase().includes("zephyr") ? "zephyr" : "peregrine";

  // Build the complete academic journal article object using our template
  const isDraft = report.mode === "draft_from_materials";
  const draftReport = isDraft ? (report as any) : null;
  const mainText = draftReport ? (draftReport.findings || []).join("\n") + "\n" + (draftReport.preliminary_analysis || "") : report.title;
  const location = draftReport && draftReport.method_or_materials && draftReport.method_or_materials.includes("Lokasi:") ? "Halaman Kampus" : "";

  const article = buildJournalArticle(
    {
      title: report.title,
      reportTemplate: report.report_type,
      mainText,
      location,
      created_at: report.created_at
    },
    modelId
  );

  // ==========================================
  // PAGE 1: JOURNAL COVER PAGE
  // ==========================================
  let page = addPage(pdf);
  let y = PAGE_HEIGHT - MARGIN_TOP;

  // Top header rule
  page.drawLine({
    start: { x: MARGIN_X, y: y },
    end: { x: PAGE_WIDTH - MARGIN_X, y: y },
    color: ACCENT_COLOR,
    thickness: 2,
  });

  // Journal name
  page.drawText(article.cover.journalTitle.toUpperCase(), {
    x: MARGIN_X,
    y: y - 25,
    size: 16,
    font: bold,
    color: HEADING_TEXT,
  });

  page.drawText(article.cover.issueLine, {
    x: MARGIN_X,
    y: y - 42,
    size: 9,
    font: regular,
    color: MUTED_TEXT,
  });

  // Visual Theme Block (Decorative Nature Outline / Visual Placeholder)
  page.drawRectangle({
    x: MARGIN_X,
    y: y - 320,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: 250,
    color: rgb(0.95, 0.97, 0.96),
    borderColor: ACCENT_COLOR,
    borderWidth: 1,
  });

  // Visual theme text inside the decorative block
  page.drawText("NaLI Field Observations & Flora Morphology Documentation Series", {
    x: MARGIN_X + 24,
    y: y - 180,
    size: 11,
    font: bold,
    color: ACCENT_COLOR,
  });

  page.drawText("[ Visual Evidence & Biological Pattern Draft ]", {
    x: MARGIN_X + 24,
    y: y - 205,
    size: 9.5,
    font: regular,
    color: MUTED_TEXT,
  });

  // Metadata block on cover
  page.drawText(`Tahun Volume: ${article.cover.year}`, {
    x: MARGIN_X + 24,
    y: y - 280,
    size: 9,
    font: regular,
    color: BASE_TEXT,
  });

  // Article title on cover page
  y = y - 350;
  const coverTitleLines = wrapText(article.metadata.title, bold, 18, maxWidth);
  for (const line of coverTitleLines) {
    page.drawText(line, {
      x: MARGIN_X,
      y,
      size: 18,
      font: bold,
      color: HEADING_TEXT,
    });
    y -= 22;
  }

  // Cover subtitle
  y -= 8;
  page.drawText(article.cover.coverSubtitle, {
    x: MARGIN_X,
    y,
    size: 10.5,
    font: regular,
    color: MUTED_TEXT,
  });

  // Publisher details at the bottom of the cover page
  page.drawText(article.cover.brandNote.toUpperCase(), {
    x: MARGIN_X,
    y: MARGIN_BOTTOM + 55,
    size: 9,
    font: bold,
    color: ACCENT_COLOR,
  });

  // Cover disclaimer / truth note
  const coverDisclaimerLines = wrapText(article.cover.truthNote, regular, 7.5, maxWidth);
  let coverDisclaimerY = MARGIN_BOTTOM + 35;
  for (const line of coverDisclaimerLines) {
    page.drawText(line, {
      x: MARGIN_X,
      y: coverDisclaimerY,
      size: 7.5,
      font: regular,
      color: MUTED_TEXT,
    });
    coverDisclaimerY -= 10;
  }

  // ==========================================
  // PAGE 2: ARTICLE FIRST PAGE (Banner + Abstract + Metadata)
  // ==========================================
  page = addPage(pdf);
  y = PAGE_HEIGHT - MARGIN_TOP;

  // Running Journal Header
  page.drawText(`${article.cover.journalTitle} | Vol. 1 No. 1 (${article.cover.year})`, {
    x: MARGIN_X,
    y: y - 10,
    size: 8,
    font: bold,
    color: MUTED_TEXT,
  });

  page.drawText(`${article.metadata.doi} | ${article.metadata.issn}`, {
    x: PAGE_WIDTH - MARGIN_X - bold.widthOfTextAtSize(`${article.metadata.doi} | ${article.metadata.issn}`, 8),
    y: y - 10,
    size: 8,
    font: bold,
    color: MUTED_TEXT,
  });

  page.drawLine({
    start: { x: MARGIN_X, y: y - 16 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: y - 16 },
    color: rgb(0.8, 0.8, 0.8),
    thickness: 0.5,
  });

  y -= 35;

  // Main Article Title
  const titleLines = wrapText(article.metadata.title, bold, 14, maxWidth);
  for (const line of titleLines) {
    page.drawText(line, {
      x: MARGIN_X,
      y,
      size: 14,
      font: bold,
      color: HEADING_TEXT,
    });
    y -= 18;
  }

  y -= 6;

  // Author and affiliation
  page.drawText(article.metadata.author, {
    x: MARGIN_X,
    y,
    size: 9,
    font: bold,
    color: BASE_TEXT,
  });
  y -= 12;

  page.drawText(article.metadata.affiliation, {
    x: MARGIN_X,
    y,
    size: 8,
    font: regular,
    color: MUTED_TEXT,
  });
  y -= 20;

  // Shaded Abstract Block
  const abstractHeaderY = y;
  const abstractLines = wrapText(article.abstract.text, regular, 8, maxWidth - 40);
  const abstractBoxHeight = abstractLines.length * 11 + 35;

  page.drawRectangle({
    x: MARGIN_X,
    y: y - abstractBoxHeight,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: abstractBoxHeight,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.85, 0.88, 0.9),
    borderWidth: 0.5,
  });

  page.drawText("ABSTRAK", {
    x: MARGIN_X + 20,
    y: abstractHeaderY - 14,
    size: 8.5,
    font: bold,
    color: HEADING_TEXT,
  });

  let abstractTextY = abstractHeaderY - 26;
  for (const line of abstractLines) {
    page.drawText(line, {
      x: MARGIN_X + 20,
      y: abstractTextY,
      size: 8,
      font: regular,
      color: BASE_TEXT,
    });
    abstractTextY -= 11;
  }

  // Keywords block
  page.drawText(`Keywords: ${article.abstract.keywords.join(", ")}`, {
    x: MARGIN_X + 20,
    y: abstractHeaderY - abstractBoxHeight + 10,
    size: 7.5,
    font: bold,
    color: HEADING_TEXT,
  });

  y -= abstractBoxHeight + 15;

  // Article Info Box (Milestones)
  page.drawRectangle({
    x: MARGIN_X,
    y: y - 55,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: 55,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.5
  });

  page.drawText(`ARTICLE INFO  |  Received: ${article.infoBlock.received}  |  Accepted: ${article.infoBlock.accepted}  |  Published: ${article.infoBlock.published}`, {
    x: MARGIN_X + 10,
    y: y - 14,
    size: 7.5,
    font: bold,
    color: MUTED_TEXT,
  });

  page.drawText(`Verification Status: ${article.infoBlock.verificationStatus}  |  Export Gate: ${article.infoBlock.exportStatus}`, {
    x: MARGIN_X + 10,
    y: y - 30,
    size: 7.5,
    font: regular,
    color: MUTED_TEXT,
  });

  page.drawText(`Document Status: ${article.metadata.documentStatus}`, {
    x: MARGIN_X + 10,
    y: y - 44,
    size: 7.5,
    font: bold,
    color: ACCENT_COLOR,
  });

  y -= 75;

  // Render the academic layout body content starting from Introduction
  const bodySections = [
    { title: "1. PENDAHULUAN", text: article.introduction },
    { title: "2. TINJAUAN PUSTAKA", text: article.literatureReview },
    { title: "3. BAHAN DAN METODE", text: `Pengamatan berfokus pada ${article.materialsAndMethods.objectObserved} yang berlokasi di ${article.materialsAndMethods.location} pada ${article.materialsAndMethods.time}. Metode pengamatan menggunakan ${article.materialsAndMethods.method}. Keterbatasan penelitian meliputi: ${article.materialsAndMethods.missingDetails} Reproduksibilitas: ${article.materialsAndMethods.reproducibility}` }
  ];

  for (const section of bodySections) {
    if (y - 30 < MARGIN_BOTTOM) {
      page = addPage(pdf);
      y = PAGE_HEIGHT - MARGIN_TOP;
    }

    page.drawText(section.title, {
      x: MARGIN_X,
      y,
      size: 10,
      font: bold,
      color: HEADING_TEXT,
    });
    y -= 14;

    const wrappedTextLines = wrapText(section.text, regular, 8.5, maxWidth);
    for (const line of wrappedTextLines) {
      if (y < MARGIN_BOTTOM) {
        page = addPage(pdf);
        y = PAGE_HEIGHT - MARGIN_TOP;
      }
      page.drawText(line, {
        x: MARGIN_X,
        y,
        size: 8.5,
        font: regular,
        color: BASE_TEXT,
      });
      y -= 12.5;
    }
    y -= 10;
  }

  // ==========================================
  // PAGE 3: RESULTS AND DISCUSSION (Table, Figures, References)
  // ==========================================
  if (y - 120 < MARGIN_BOTTOM) {
    page = addPage(pdf);
    y = PAGE_HEIGHT - MARGIN_TOP;
  }

  page.drawText("4. HASIL DAN PEMBAHASAN", {
    x: MARGIN_X,
    y,
    size: 10,
    font: bold,
    color: HEADING_TEXT,
  });
  y -= 14;

  const discussionLines = wrapText(article.discussion, regular, 8.5, maxWidth);
  for (const line of discussionLines) {
    if (y < MARGIN_BOTTOM) {
      page = addPage(pdf);
      y = PAGE_HEIGHT - MARGIN_TOP;
    }
    page.drawText(line, {
      x: MARGIN_X,
      y,
      size: 8.5,
      font: regular,
      color: BASE_TEXT,
    });
    y -= 12.5;
  }
  y -= 12;

  // Comparative table
  page.drawText("Tabel 1: Hasil Pengamatan Perbandingan Morfologi Daun", {
    x: MARGIN_X,
    y,
    size: 8.5,
    font: bold,
    color: HEADING_TEXT,
  });
  y -= 12;

  const colWidths = [100, 100, 100, 100, 99.28];
  const tableHeader = ["Spesimen", "Bentuk", "Tepi Daun", "Warna", "Status Bukti"];
  const headerRes = drawTableRow(pdf, page, y, tableHeader, true, fonts, colWidths);
  y = headerRes.nextY;
  page = headerRes.page;

  for (const row of article.results.comparisonTable) {
    const rowRes = drawTableRow(pdf, page, y, [row.object, row.shape, row.margin, row.color, row.evidenceStatus], false, fonts, colWidths);
    y = rowRes.nextY;
    page = rowRes.page;
  }

  y -= 15;

  // Figure Placeholder Boxes (No photo file available)
  const figHeight = 85;
  if (y - figHeight - 15 < MARGIN_BOTTOM) {
    page = addPage(pdf);
    y = PAGE_HEIGHT - MARGIN_TOP;
  }

  page.drawRectangle({
    x: MARGIN_X,
    y: y - figHeight,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: figHeight,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 0.8,
  });

  page.drawText("GAMBAR 1: ELEMEN BUKTI DOKUMENTASI VISUAL (FOTO BELUM TERSEDIA)", {
    x: MARGIN_X + 15,
    y: y - 25,
    size: 7.5,
    font: bold,
    color: MUTED_TEXT,
  });

  page.drawText("Layanan Upload File Inaktif   |  Metadata Lokal Belum Terverifikasi", {
    x: MARGIN_X + 15,
    y: y - 40,
    size: 7.5,
    font: regular,
    color: MUTED_TEXT,
  });

  page.drawText(`Slot Lokasi: ${article.evidence.locationSlot}`, {
    x: MARGIN_X + 15,
    y: y - 60,
    size: 7.5,
    font: regular,
    color: BASE_TEXT,
  });

  page.drawText(`Slot Waktu: ${article.evidence.timestampSlot}`, {
    x: MARGIN_X + 15,
    y: y - 72,
    size: 7.5,
    font: regular,
    color: BASE_TEXT,
  });

  y -= figHeight + 20;

  // Limitations Box callout
  const limTextLines = wrapText("KETERBATASAN DRAF LAPORAN: " + article.limitations.join(" / "), regular, 8, maxWidth - 24);
  const limHeight = limTextLines.length * 11 + 24;

  if (y - limHeight < MARGIN_BOTTOM) {
    page = addPage(pdf);
    y = PAGE_HEIGHT - MARGIN_TOP;
  }

  page.drawRectangle({
    x: MARGIN_X,
    y: y - limHeight,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: limHeight,
    color: rgb(0.99, 0.95, 0.95),
    borderColor: rgb(0.85, 0.4, 0.4),
    borderWidth: 1,
  });

  page.drawText("WARNING: EVIDENCE LIMITATIONS & RESEARCH INTEGRITY GATE", {
    x: MARGIN_X + 12,
    y: y - 12,
    size: 7.5,
    font: bold,
    color: rgb(0.6, 0.15, 0.15),
  });

  let limTextY = y - 24;
  for (const line of limTextLines) {
    page.drawText(line, {
      x: MARGIN_X + 12,
      y: limTextY,
      size: 7.5,
      font: regular,
      color: rgb(0.5, 0.1, 0.1),
    });
    limTextY -= 11;
  }

  y -= limHeight + 15;

  // Conclusion and Future Data
  const closingSections = [
    { title: "5. KESIMPULAN", text: article.conclusion },
    { title: "6. REFERENCES", text: article.references[0] }
  ];

  for (const section of closingSections) {
    if (y - 30 < MARGIN_BOTTOM) {
      page = addPage(pdf);
      y = PAGE_HEIGHT - MARGIN_TOP;
    }

    page.drawText(section.title, {
      x: MARGIN_X,
      y,
      size: 10,
      font: bold,
      color: HEADING_TEXT,
    });
    y -= 14;

    const wrappedTextLines = wrapText(section.text, regular, 8.5, maxWidth);
    for (const line of wrappedTextLines) {
      if (y < MARGIN_BOTTOM) {
        page = addPage(pdf);
        y = PAGE_HEIGHT - MARGIN_TOP;
      }
      page.drawText(line, {
        x: MARGIN_X,
        y,
        size: 8.5,
        font: regular,
        color: BASE_TEXT,
      });
      y -= 12.5;
    }
    y -= 10;
  }

  // Iterate pages to draw headers and footers
  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    
    // Skip header on cover page
    if (i > 0) {
      p.drawLine({
        start: { x: MARGIN_X, y: PAGE_HEIGHT - MARGIN_TOP + 12 },
        end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - MARGIN_TOP + 12 },
        color: rgb(0.8, 0.8, 0.8),
        thickness: 0.5,
      });
      
      p.drawText(`NaLI Nature & Evidence Journal, Vol. 1, No. 1, ${article.cover.year}`, {
        x: MARGIN_X,
        y: PAGE_HEIGHT - MARGIN_TOP + 18,
        size: 7.5,
        font: regular,
        color: MUTED_TEXT,
      });
    }

    // Page divider and footer
    p.drawLine({
      start: { x: MARGIN_X, y: MARGIN_BOTTOM - 12 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: MARGIN_BOTTOM - 12 },
      color: rgb(0.8, 0.8, 0.8),
      thickness: 0.5,
    });

    p.drawText(`Halaman ${i + 1} dari ${pages.length}  |  Draft Laporan Akademik - NaLI Nature & Evidence Journal`, {
      x: MARGIN_X,
      y: MARGIN_BOTTOM - 24,
      size: 7.5,
      font: regular,
      color: MUTED_TEXT,
    });
  }

  return pdf.save({ useObjectStreams: false });
}
