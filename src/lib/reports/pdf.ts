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
const BASE_TEXT = rgb(0.1, 0.1, 0.1);
const MUTED_TEXT = rgb(0.35, 0.35, 0.35);
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
    return { color: HEADING_TEXT, font: fonts.bold, lineGap: 8, size: 18 };
  }

  if (line.startsWith("## ")) {
    return { color: HEADING_TEXT, font: fonts.bold, lineGap: 6, size: 13 };
  }

  if (line.startsWith("### ")) {
    return { color: HEADING_TEXT, font: fonts.bold, lineGap: 5, size: 11 };
  }

  if (line.startsWith("| ---")) {
    return { color: MUTED_TEXT, font: fonts.regular, lineGap: 4, size: 8 };
  }

  if (line.startsWith("|")) {
    return { color: BASE_TEXT, font: fonts.regular, lineGap: 4, size: 8 };
  }

  return { color: BASE_TEXT, font: fonts.regular, lineGap: 5, size: 10 };
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

export async function buildReportPdfBytes(report: ReportResult, options: ReportMarkdownOptions = {}) {
  const markdown = buildReportMarkdown(report, { exportStatus: options.exportStatus ?? "export_ready" });
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fonts = { bold, regular };
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2;
  let page: PDFPage = addPage(pdf);
  let y = PAGE_HEIGHT - MARGIN_TOP;

  for (const rawLine of markdown.split(/\r?\n/)) {
    if (!rawLine.trim()) {
      y -= 8;
      continue;
    }

    const style = getLineStyle(rawLine, fonts);
    const text = stripMarkdown(rawLine);
    if (!text || text === "---") continue;

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
  }

  return pdf.save({ useObjectStreams: false });
}
