import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ReportResult } from "@/lib/reports/reportGenerator";
import { buildReportMarkdown, type ReportMarkdownOptions } from "@/lib/reports/markdown";

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
    return { color: HEADING_TEXT, font: fonts.bold, lineGap: 8, size: 16 };
  }

  if (line.startsWith("## ")) {
    return { color: HEADING_TEXT, font: fonts.bold, lineGap: 6, size: 12 };
  }

  if (line.startsWith("### ")) {
    return { color: HEADING_TEXT, font: fonts.bold, lineGap: 5, size: 10 };
  }

  return { color: BASE_TEXT, font: fonts.regular, lineGap: 5, size: 9 };
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
  const size = isHeader ? 8.5 : 8;
  const padding = 6;
  const lineHeight = size + 4;
  
  // Wrap text for each cell
  const cellLines = cells.map((cell, idx) => wrapText(cell.trim(), font, size, colWidths[idx] - padding * 2));
  const maxLines = Math.max(...cellLines.map(lines => lines.length), 1);
  const rowHeight = maxLines * lineHeight + padding * 2;
  
  // Page break check
  if (y - rowHeight < MARGIN_BOTTOM) {
    page = addPage(pdf);
    y = PAGE_HEIGHT - MARGIN_TOP;
  }
  
  // Draw background
  const bg = isHeader ? rgb(0.9, 0.93, 0.95) : (Math.floor(y) % 2 === 0 ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1));
  page.drawRectangle({
    x: MARGIN_X,
    y: y - rowHeight,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: rowHeight,
    color: bg,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.5
  });
  
  // Draw cell content
  let currentX = MARGIN_X;
  for (let idx = 0; idx < cells.length; idx++) {
    const lines = cellLines[idx];
    const colWidth = colWidths[idx];
    
    // Draw vertical separator line between columns
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
  const markdown = buildReportMarkdown(report, { exportStatus: options.exportStatus ?? "export_ready" });
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fonts = { bold, regular };
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2;
  
  let page: PDFPage = addPage(pdf);
  let y = PAGE_HEIGHT - MARGIN_TOP;

  // Draw Cover/Header Section at the top of the first page
  page.drawRectangle({
    x: MARGIN_X,
    y: y - 75,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: 75,
    color: rgb(0.02, 0.12, 0.18),
    borderColor: rgb(0.01, 0.08, 0.12),
    borderWidth: 1,
  });

  page.drawText("NaLI FIELD INTELLIGENCE & LEARNING SYSTEM", {
    x: MARGIN_X + 15,
    y: y - 22,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  page.drawText("DRAFT LAPORAN BERBASIS BUKTI - PEMBELAJARAN MANDIRI", {
    x: MARGIN_X + 15,
    y: y - 37,
    size: 8,
    font: regular,
    color: rgb(0.7, 0.8, 0.9),
  });

  page.drawText(`MODEL GENERATOR: ${String(report.model_used).toUpperCase()}  |  TANGGAL: ${report.created_at}`, {
    x: MARGIN_X + 15,
    y: y - 58,
    size: 7.5,
    font: bold,
    color: rgb(0.65, 0.75, 0.85),
  });

  y -= 95;

  const lines = markdown.split(/\r?\n/);
  let idx = 0;

  while (idx < lines.length) {
    const rawLine = lines[idx];

    // Handle empty lines
    if (!rawLine.trim()) {
      y -= 6;
      idx++;
      continue;
    }

    // Skip sitemaps and top header since we drew a cover banner
    if (rawLine.startsWith("# NaLI Learn & Report") || rawLine.startsWith("## Judul Laporan")) {
      idx++;
      continue;
    }

    // Detect and parse Markdown Table blocks
    if (rawLine.startsWith("|")) {
      const tableLines: string[] = [];
      while (idx < lines.length && lines[idx].startsWith("|")) {
        tableLines.push(lines[idx]);
        idx++;
      }
      
      // Clean rows (remove separators)
      const cleanRows = tableLines
        .map(row => row.split("|").map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1))
        .filter(row => row.length > 0 && !row.every(cell => cell.startsWith("---")));
        
      if (cleanRows.length > 0) {
        const numCols = cleanRows[0].length;
        const colWidths = cleanRows[0].map((_, cIdx) => {
          // Custom leaf comparison table column width ratios
          if (numCols === 4) {
            const ratios = [0.18, 0.25, 0.25, 0.32];
            return ratios[cIdx] * maxWidth;
          }
          return maxWidth / numCols;
        });

        // Draw header row
        const headerRes = drawTableRow(pdf, page, y, cleanRows[0], true, fonts, colWidths);
        y = headerRes.nextY;
        page = headerRes.page;

        // Draw content rows
        for (let r = 1; r < cleanRows.length; r++) {
          const rowRes = drawTableRow(pdf, page, y, cleanRows[r], false, fonts, colWidths);
          y = rowRes.nextY;
          page = rowRes.page;
        }
        y -= 8;
      }
      continue;
    }

    // Detect and draw disclaimer blocks (Academic Integrity Warnings)
    if (rawLine.includes("Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti") || 
        rawLine.includes("PREMIUM_EXPORT_DISCLAIMER") ||
        rawLine.includes("Draft bantuan belajar/penulisan berbasis bukti")) {
      
      const textClean = stripMarkdown(rawLine);
      const textLines = wrapText(textClean, fonts.regular, 8.5, maxWidth - 24);
      const boxHeight = textLines.length * 12 + 18;
      
      if (y - boxHeight < MARGIN_BOTTOM) {
        page = addPage(pdf);
        y = PAGE_HEIGHT - MARGIN_TOP;
      }
      
      page.drawRectangle({
        x: MARGIN_X,
        y: y - boxHeight,
        width: PAGE_WIDTH - MARGIN_X * 2,
        height: boxHeight,
        color: rgb(0.99, 0.96, 0.96),
        borderColor: rgb(0.85, 0.35, 0.35),
        borderWidth: 1
      });
      
      // Draw small bold header
      page.drawText("PERNYATAAN INTEGRITAS AKADEMIK & DISCLAIMER", {
        x: MARGIN_X + 12,
        y: y - 13,
        font: fonts.bold,
        size: 7.5,
        color: rgb(0.6, 0.15, 0.15)
      });
      
      let textY = y - 25;
      for (const line of textLines) {
        page.drawText(line, {
          x: MARGIN_X + 12,
          y: textY,
          font: fonts.regular,
          size: 8.5,
          color: rgb(0.5, 0.1, 0.1)
        });
        textY -= 12;
      }
      y -= boxHeight + 12;
      idx++;
      continue;
    }

    // Detect and draw local evidence slots / photo placeholders
    if (rawLine.includes("Evidence Slot") || rawLine.includes("Foto belum tersedia") || rawLine.includes("Data kuantitatif belum tersedia")) {
      const textClean = stripMarkdown(rawLine);
      const textLines = wrapText(textClean, fonts.regular, 8.5, maxWidth - 24);
      const boxHeight = textLines.length * 12 + 22;
      
      if (y - boxHeight < MARGIN_BOTTOM) {
        page = addPage(pdf);
        y = PAGE_HEIGHT - MARGIN_TOP;
      }
      
      page.drawRectangle({
        x: MARGIN_X,
        y: y - boxHeight,
        width: PAGE_WIDTH - MARGIN_X * 2,
        height: boxHeight,
        color: rgb(0.97, 0.98, 0.97),
        borderColor: rgb(0.4, 0.6, 0.4),
        borderWidth: 0.8
      });
      
      page.drawText("DOKUMENTASI BUKTI LOKAL (GUEST RECOVERY PREVIEW)", {
        x: MARGIN_X + 12,
        y: y - 12,
        font: fonts.bold,
        size: 7.5,
        color: rgb(0.15, 0.35, 0.15)
      });
      
      let textY = y - 24;
      for (const line of textLines) {
        page.drawText(line, {
          x: MARGIN_X + 12,
          y: textY,
          font: fonts.regular,
          size: 8.5,
          color: rgb(0.1, 0.25, 0.1)
        });
        textY -= 12;
      }
      y -= boxHeight + 12;
      idx++;
      continue;
    }

    // Regular line processing
    const style = getLineStyle(rawLine, fonts);
    const text = stripMarkdown(rawLine);
    
    if (!text || text === "---") {
      idx++;
      continue;
    }

    // Draw section headers with accent lines
    if (rawLine.startsWith("## ")) {
      if (y - 25 < MARGIN_BOTTOM) {
        page = addPage(pdf);
        y = PAGE_HEIGHT - MARGIN_TOP;
      }
      page.drawLine({
        start: { x: MARGIN_X, y: y },
        end: { x: PAGE_WIDTH - MARGIN_X, y: y },
        color: rgb(0.85, 0.87, 0.9),
        thickness: 1
      });
      y -= 15;
    }

    for (const line of wrapText(text, style.font, style.size, maxWidth)) {
      if (y < MARGIN_BOTTOM) {
        page = addPage(pdf);
        y = PAGE_HEIGHT - MARGIN_TOP;
      }

      page.drawText(line, {
        color: style.color,
        font: style.font,
        size: style.size,
        x: MARGIN_X,
        y,
      });
      y -= style.size + style.lineGap;
    }
    idx++;
  }

  // Iterate pages to draw footers and header line guides
  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    p.drawLine({
      start: { x: MARGIN_X, y: MARGIN_BOTTOM - 12 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: MARGIN_BOTTOM - 12 },
      color: rgb(0.85, 0.85, 0.85),
      thickness: 0.5,
    });
    p.drawText(`Halaman ${i + 1} dari ${pages.length}  |  Draft Laporan Akademik - NaLI Field Intelligence`, {
      x: MARGIN_X,
      y: MARGIN_BOTTOM - 24,
      size: 7.5,
      font: regular,
      color: MUTED_TEXT,
    });
  }

  return pdf.save({ useObjectStreams: false });
}
