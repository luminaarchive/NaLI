import { Document, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType, Packer, Header, Footer } from "docx";
import { PUBLIC_REPORT_DISCLAIMER, type ReportResult } from "./reportGenerator";
import { buildJournalArticle } from "./journalArticleTemplate";

export async function buildReportDocxBuffer(report: ReportResult): Promise<Buffer> {
  const modelId = report.model_used.toLowerCase().includes("obsidian") ? "obsidian" :
                  report.model_used.toLowerCase().includes("zephyr") ? "zephyr" : "peregrine";

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

  const doubleBorder = { style: BorderStyle.DOUBLE, size: 6, color: "0B5B5B" };
  const singleBorder = { style: BorderStyle.SINGLE, size: 4, color: "D0D0D0" };
  const thickBorder = { style: BorderStyle.SINGLE, size: 8, color: "A0A0A0" };
  const redBorder = { style: BorderStyle.SINGLE, size: 10, color: "C83C3C" };

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${article.cover.journalTitle.toUpperCase()}  |  CP1 INTERNAL QA EDITION`,
                    font: "Arial",
                    size: 15,
                    color: "666666",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Draft Laporan Akademik NaLI  |  Halaman 1 dari 1 (QA Draft)  |  Model: ${article.metadata.modelLabel}`,
                    font: "Arial",
                    size: 15,
                    color: "666666",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ==========================================
          // COVER HEADER
          // ==========================================
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: doubleBorder,
              bottom: doubleBorder,
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F0F4F4" },
                    margins: { top: 180, bottom: 180, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: article.cover.journalTitle.toUpperCase(),
                            bold: true,
                            font: "Georgia",
                            size: 32,
                            color: "031E2E",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: article.cover.issueLine.toUpperCase(),
                            font: "Arial",
                            size: 17,
                            color: "555555",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: `MODEL RUN: ${article.metadata.modelLabel.toUpperCase()}  |  DATE: ${article.metadata.generatedDate}`,
                            font: "Arial",
                            bold: true,
                            size: 15,
                            color: "0B5B5B",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // ==========================================
          // ARTICLE METADATA
          // ==========================================
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: article.metadata.title,
                bold: true,
                font: "Georgia",
                size: 36,
                color: "031E2E",
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `Author: ${article.metadata.author}`,
                bold: true,
                font: "Arial",
                size: 18,
                color: "222222",
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Affiliation: ${article.metadata.affiliation}`,
                italics: true,
                font: "Arial",
                size: 16,
                color: "666666",
              }),
            ],
          }),

          // ==========================================
          // ABSTRACT BOX
          // ==========================================
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: singleBorder,
              bottom: singleBorder,
              left: singleBorder,
              right: singleBorder,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F6F7F8" },
                    margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        spacing: { after: 60 },
                        children: [
                          new TextRun({
                            text: "ABSTRAK",
                            bold: true,
                            font: "Georgia",
                            size: 18,
                            color: "031E2E",
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 120 },
                        children: [
                          new TextRun({
                            text: article.abstract.text,
                            font: "Arial",
                            size: 17,
                            color: "333333",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Keywords: ${article.abstract.keywords.join(", ")}`,
                            bold: true,
                            font: "Arial",
                            size: 16,
                            color: "0B5B5B",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 150 } }),

          // ==========================================
          // ARTICLE INFO BOX
          // ==========================================
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: singleBorder,
              bottom: singleBorder,
              left: singleBorder,
              right: singleBorder,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `ARTICLE INFO  |  Received: ${article.infoBlock.received}  |  Accepted: ${article.infoBlock.accepted}  |  Published: ${article.infoBlock.published}`,
                            font: "Arial",
                            size: 15,
                            color: "666666",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Evidence Status: ${article.infoBlock.evidenceStatus}  |  Verification Status: ${article.infoBlock.verificationStatus}`,
                            font: "Arial",
                            size: 15,
                            color: "666666",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Document Status: ${article.metadata.documentStatus}`,
                            bold: true,
                            font: "Arial",
                            size: 15,
                            color: "0B5B5B",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // ==========================================
          // BODY SECTIONS
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: "1. PENDAHULUAN",
                bold: true,
                font: "Georgia",
                size: 20,
                color: "031E2E",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: article.introduction,
                font: "Arial",
                size: 18,
                color: "333333",
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: "2. TINJAUAN PUSTAKA",
                bold: true,
                font: "Georgia",
                size: 20,
                color: "031E2E",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: article.literatureReview,
                font: "Arial",
                size: 18,
                color: "333333",
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: "3. METODOLOGI",
                bold: true,
                font: "Georgia",
                size: 20,
                color: "031E2E",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `Studi observasi menggunakan spesimen ${article.materialsAndMethods.objectObserved}. ` +
                      `Lokasi pengamatan di ${article.materialsAndMethods.location} pada ${article.materialsAndMethods.time}. ` +
                      `Metode observasi: ${article.materialsAndMethods.method}. ` +
                      `Detail metodologi yang tidak dicatat: ${article.materialsAndMethods.missingDetails} ` +
                      `Reproduksibilitas: ${article.materialsAndMethods.reproducibility}`,
                font: "Arial",
                size: 18,
                color: "333333",
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: "4. HASIL DAN PEMBAHASAN",
                bold: true,
                font: "Georgia",
                size: 20,
                color: "031E2E",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: article.discussion,
                font: "Arial",
                size: 18,
                color: "333333",
              }),
            ],
          }),

          // ==========================================
          // RESULTS COMPARISON TABLE
          // ==========================================
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: "Tabel 1. Perbandingan Karakter Morfologi Visual Spesimen Daun",
                bold: true,
                font: "Arial",
                size: 17,
                color: "031E2E",
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: singleBorder,
              bottom: singleBorder,
              left: singleBorder,
              right: singleBorder,
            },
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "EBF2F2" }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Spesimen", bold: true, size: 16, font: "Arial" })] })] }),
                  new TableCell({ shading: { fill: "EBF2F2" }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Bentuk", bold: true, size: 16, font: "Arial" })] })] }),
                  new TableCell({ shading: { fill: "EBF2F2" }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Tepi Daun", bold: true, size: 16, font: "Arial" })] })] }),
                  new TableCell({ shading: { fill: "EBF2F2" }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Warna", bold: true, size: 16, font: "Arial" })] })] }),
                  new TableCell({ shading: { fill: "EBF2F2" }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Sumber Bukti", bold: true, size: 16, font: "Arial" })] })] }),
                ],
              }),
              // Data Rows
              ...article.results.comparisonTable.map(row => new TableRow({
                children: [
                  new TableCell({ margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: row.object, size: 16, font: "Arial" })] })] }),
                  new TableCell({ margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: row.shape, size: 16, font: "Arial" })] })] }),
                  new TableCell({ margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: row.margin, size: 16, font: "Arial" })] })] }),
                  new TableCell({ margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: row.color, size: 16, font: "Arial" })] })] }),
                  new TableCell({ margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: row.evidenceStatus, size: 16, font: "Arial" })] })] }),
                ]
              }))
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 150 } }),

          // ==========================================
          // FIGURE SLOTS
          // ==========================================
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: thickBorder,
              bottom: thickBorder,
              left: thickBorder,
              right: thickBorder,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "FAFAFA" },
                    margins: { top: 120, bottom: 120, left: 150, right: 150 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "GAMBAR 1: ELEMEN BUKTI DOKUMENTASI VISUAL (FOTO BELUM TERSEDIA)",
                            bold: true,
                            font: "Arial",
                            size: 15,
                            color: "777777",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Layanan Upload Inaktif di CP1  |  Metadata: ${article.evidence.locationSlot}`,
                            font: "Arial",
                            size: 15,
                            color: "777777",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 150 } }),

          // ==========================================
          // LIMITATIONS CARD
          // ==========================================
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: redBorder,
              bottom: redBorder,
              left: redBorder,
              right: redBorder,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "FDF7F7" },
                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                    children: [
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [
                          new TextRun({
                            text: "WARNING: KETERBATASAN DRAF LAPORAN & INTEGRITAS",
                            bold: true,
                            font: "Arial",
                            size: 15,
                            color: "A82C2C",
                          }),
                        ],
                      }),
                      ...article.limitations.map(lim => new Paragraph({
                        children: [
                          new TextRun({
                            text: `- ${lim}`,
                            font: "Arial",
                            size: 15,
                            color: "8C1C1C",
                          }),
                        ],
                      })),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // ==========================================
          // CONCLUSION & REFERENCES
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: "5. KESIMPULAN",
                bold: true,
                font: "Georgia",
                size: 20,
                color: "031E2E",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: article.conclusion,
                font: "Arial",
                size: 18,
                color: "333333",
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: "6. DAFTAR PUSTAKA",
                bold: true,
                font: "Georgia",
                size: 20,
                color: "031E2E",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: article.references[0],
                font: "Arial",
                size: 18,
                color: "333333",
              }),
            ],
          }),

          // ==========================================
          // ANNEXURE / APPENDIX
          // ==========================================
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: "7. LAMPIRAN (ANNEXURE)",
                bold: true,
                font: "Georgia",
                size: 20,
                color: "031E2E",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: article.annexure.rawInputSummary,
                font: "Arial",
                size: 16,
                color: "666666",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Checklist Review Mandiri:",
                bold: true,
                font: "Arial",
                size: 16,
                color: "333333",
              }),
            ],
          }),
          ...article.annexure.checklist.map(chk => new Paragraph({
            children: [
              new TextRun({
                text: `[ ] ${chk}`,
                font: "Arial",
                size: 16,
                color: "444444",
              }),
            ],
          })),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: PUBLIC_REPORT_DISCLAIMER,
                italics: true,
                font: "Arial",
                size: 14,
                color: "999999",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
