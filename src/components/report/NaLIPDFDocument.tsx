import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ParsedReport } from "@/lib/parse-report-markdown";
import type { NaLIIntelligenceHeader, FollowUpQuestion } from "@/lib/parse-nali-output";

const TEAL = "#00875A";
const DARK = "#1a1a1a";
const MUTED = "#666666";
const LIGHT_BG = "#f5f5f5";
const BORDER = "#cccccc";
const TABLE_HEADER_BG = "#2a2a2a";
const ROW_ALT = "#f9f9f9";
const STATUS_OK = "#00875A";
const STATUS_WEAK = "#cc4400";
const STATUS_INFER = "#b36b00";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: DARK,
    paddingTop: 40,
    paddingBottom: 55,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.5,
  },

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  pageHeaderText: {
    fontSize: 7.5,
    color: MUTED,
    fontFamily: "Helvetica",
  },

  titleSection: { marginBottom: 14 },
  reportTitle: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    color: DARK,
    lineHeight: 1.25,
    marginBottom: 6,
  },
  metaRow: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: MUTED,
    marginBottom: 10,
  },
  titleRule: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 14,
  },

  abstractBox: {
    backgroundColor: LIGHT_BG,
    padding: 10,
    marginBottom: 14,
    borderLeftWidth: 2,
    borderLeftColor: TEAL,
  },
  abstractLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    letterSpacing: 1,
    color: MUTED,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  abstractText: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: DARK,
    lineHeight: 1.55,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 6,
  },
  sectionBorder: {
    width: 2,
    backgroundColor: TEAL,
    marginRight: 7,
    alignSelf: "stretch",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 0.8,
    color: DARK,
    textTransform: "uppercase",
  },

  bodyText: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: DARK,
    lineHeight: 1.55,
    marginBottom: 4,
  },

  table: { width: "100%", marginTop: 6, marginBottom: 10 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: TABLE_HEADER_BG,
  },
  tableRow: { flexDirection: "row" },
  tableRowAlt: { flexDirection: "row", backgroundColor: ROW_ALT },
  thClaim: {
    width: "50%",
    padding: 5,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  thSource: {
    width: "30%",
    padding: 5,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  thStatus: {
    width: "20%",
    padding: 5,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  thText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tdText: {
    fontFamily: "Times-Roman",
    fontSize: 9,
    color: DARK,
  },
  tdStatusOk: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: STATUS_OK,
  },
  tdStatusWeak: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: STATUS_WEAK,
  },
  tdStatusInfer: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: STATUS_INFER,
  },

  bullet: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 2,
  },
  bulletMark: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: STATUS_WEAK,
    width: 14,
    flexShrink: 0,
  },
  bulletText: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: DARK,
    flex: 1,
    lineHeight: 1.5,
  },

  disclaimerBox: {
    marginTop: 18,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  disclaimerText: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: MUTED,
    textAlign: "center",
    lineHeight: 1.4,
  },

  pageFooter: {
    position: "absolute",
    bottom: 22,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 5,
  },
  footerText: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: MUTED,
  },

  // v2 Palantir Intelligence Summary box
  palantirBox: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    marginBottom: 14,
  },
  palantirTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingBottom: 4,
  },
  palantirScoreLine: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: DARK,
    marginBottom: 6,
  },
  palantirPillarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  palantirPillarLabel: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: MUTED,
    width: "60%",
  },
  palantirPillarValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: DARK,
    width: "40%",
    textAlign: "right",
  },
  palantirMetaRow: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: MUTED,
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },

  // v2 Follow-up questions appendix
  appendixTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: DARK,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingBottom: 4,
  },
  appendixQuestionBox: {
    backgroundColor: LIGHT_BG,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 1.5,
    borderLeftColor: TEAL,
  },
  appendixQuestionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: MUTED,
    marginBottom: 3,
  },
  appendixQuestionText: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: DARK,
    lineHeight: 1.5,
  },
  appendixAnswerBox: {
    borderWidth: 0.5,
    borderColor: BORDER,
    borderRadius: 2,
    padding: 6,
    marginTop: 4,
    minHeight: 24,
  },
  appendixAnswerLabel: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: MUTED,
  },
});

interface Props {
  reportTitle: string;
  sections: ParsedReport["sections"];
  prompt: string;
  modelUsed: string;
  generatedAt: string;
  v2Header?: NaLIIntelligenceHeader | null;
  v2FollowUpQuestions?: FollowUpQuestion[];
}

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s.includes("terkonfirmasi")) return styles.tdStatusOk;
  if (s.includes("bukti kurang") || s.includes("weak")) return styles.tdStatusWeak;
  if (s.includes("inferensi") || s.includes("infer")) return styles.tdStatusInfer;
  return styles.tdText;
}

function renderSectionContent(section: ParsedReport["sections"][number]) {
  if (section.isTable && section.tableRows.length > 0) {
    return (
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <View style={styles.thClaim}>
            <Text style={styles.thText}>Klaim</Text>
          </View>
          <View style={styles.thSource}>
            <Text style={styles.thText}>Sumber Bukti</Text>
          </View>
          <View style={styles.thStatus}>
            <Text style={styles.thText}>Status</Text>
          </View>
        </View>
        {section.tableRows.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <View style={styles.thClaim}>
              <Text style={styles.tdText}>{row.claim}</Text>
            </View>
            <View style={styles.thSource}>
              <Text style={styles.tdText}>{row.source}</Text>
            </View>
            <View style={styles.thStatus}>
              <Text style={statusStyle(row.status)}>{row.status}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  const rawLines = section.content
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  const isUncertainty =
    section.title.toLowerCase().includes("ketidakpastian") || section.title.toLowerCase().includes("catatan");

  return (
    <>
      {rawLines.map((line, i) => {
        const isBullet = line.startsWith("• ");
        const text = isBullet ? line.slice(2) : line;
        if (isBullet && isUncertainty) {
          return (
            <View key={i} style={styles.bullet}>
              <Text style={styles.bulletMark}>{">"}</Text>
              <Text style={styles.bulletText}>{text}</Text>
            </View>
          );
        }
        return (
          <Text key={i} style={styles.bodyText}>
            {isBullet ? `* ${text}` : text}
          </Text>
        );
      })}
    </>
  );
}

export function NaLIPDFDocument({
  reportTitle,
  sections,
  prompt,
  modelUsed,
  generatedAt,
  v2Header,
  v2FollowUpQuestions,
}: Props) {
  const abstractSection = sections.find(
    (s) => s.title.toLowerCase().includes("ringkasan") || s.title.toLowerCase().includes("abstrak"),
  );
  const otherSections = sections.filter((s) => s !== abstractSection);

  const shortPrompt = prompt.length > 160 ? prompt.slice(0, 160) + "..." : prompt;
  const isV2 = !!v2Header;

  return (
    <Document title={reportTitle} author="NaLI by NatIve" subject="Draft Laporan NaLI" creator="naliai.vercel.app">
      <Page size="A4" style={styles.page}>
        {/* Page header */}
        <View style={styles.pageHeader} fixed>
          <Text style={styles.pageHeaderText}>NaLI Field Intelligence Draft | naliai.vercel.app</Text>
          <Text style={styles.pageHeaderText}>{generatedAt}</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.reportTitle}>{reportTitle}</Text>
          <Text style={styles.metaRow}>
            Dibuat oleh NaLI | {generatedAt} | Model: {modelUsed}
          </Text>
          <View style={styles.titleRule} />
        </View>

        {/* v2: Palantir Intelligence Summary */}
        {isV2 && v2Header && (
          <View style={styles.palantirBox}>
            <Text style={styles.palantirTitle}>Palantir Intelligence Summary</Text>
            <Text style={styles.palantirScoreLine}>
              Palantir Confidence Score: {v2Header.palantir.overall.toFixed(0)}% - {v2Header.palantir.level}
            </Text>
            <View style={styles.palantirPillarRow}>
              <Text style={styles.palantirPillarLabel}>Pilar Genetik (x0.60)</Text>
              <Text style={styles.palantirPillarValue}>{v2Header.palantir.geneticPillar.toFixed(2)} / 1.00</Text>
            </View>
            <View style={styles.palantirPillarRow}>
              <Text style={styles.palantirPillarLabel}>Pilar Visual (x0.20)</Text>
              <Text style={styles.palantirPillarValue}>{v2Header.palantir.visualPillar.toFixed(2)} / 1.00</Text>
            </View>
            <View style={styles.palantirPillarRow}>
              <Text style={styles.palantirPillarLabel}>Pilar Habitat (x0.15)</Text>
              <Text style={styles.palantirPillarValue}>{v2Header.palantir.habitatPillar.toFixed(2)} / 1.00</Text>
            </View>
            <View style={styles.palantirPillarRow}>
              <Text style={styles.palantirPillarLabel}>Pilar Integritas (x0.10)</Text>
              <Text style={styles.palantirPillarValue}>{v2Header.palantir.integrityPillar.toFixed(2)} / 1.00</Text>
            </View>
            <Text style={styles.palantirMetaRow}>
              Kualitas Bukti: {v2Header.kualitasBukti} | Risiko Klaim: {v2Header.risikoKlaim} | Kesiapan Publikasi:{" "}
              {v2Header.kesiapanPublikasi}
            </Text>
          </View>
        )}

        {/* Source material note */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              fontSize: 7.5,
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 3,
            }}
          >
            Bahan Pengguna
          </Text>
          <Text
            style={{ fontFamily: "Times-Roman", fontSize: 9, color: "#444444", fontStyle: "italic", lineHeight: 1.5 }}
          >
            {shortPrompt}
          </Text>
        </View>

        {/* Abstract / Ringkasan box */}
        {abstractSection && (
          <View style={styles.abstractBox}>
            <Text style={styles.abstractLabel}>Ringkasan</Text>
            <Text style={styles.abstractText}>{abstractSection.content.trim().replace(/\n+/g, " ")}</Text>
          </View>
        )}

        {/* Body sections */}
        {otherSections.map((section, idx) => (
          <View key={idx} wrap={false}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBorder} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {renderSectionContent(section)}
          </View>
        ))}

        {/* v2: Follow-up questions appendix */}
        {isV2 && v2FollowUpQuestions && v2FollowUpQuestions.length > 0 && (
          <View>
            <Text style={styles.appendixTitle}>Pertanyaan Lanjutan yang Disarankan</Text>
            {v2FollowUpQuestions.map((q) => (
              <View key={q.number} style={styles.appendixQuestionBox}>
                <Text style={styles.appendixQuestionLabel}>Pertanyaan {q.number} dari NaLI</Text>
                <Text style={styles.appendixQuestionText}>{q.question}</Text>
                <View style={styles.appendixAnswerBox}>
                  <Text style={styles.appendixAnswerLabel}>Catatan jawaban:</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit,
            memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh digunakan untuk
            memalsukan data atau mengklaim karya AI sebagai karya final.
          </Text>
        </View>

        {/* Page footer */}
        <View
          style={styles.pageFooter}
          fixed
          render={({ pageNumber }) => (
            <>
              <Text style={styles.footerText}>Halaman {pageNumber}</Text>
              <Text style={styles.footerText}>Draft NaLI. Verifikasi akhir tetap tanggung jawab pengguna.</Text>
              <Text style={styles.footerText}>naliai.vercel.app</Text>
            </>
          )}
        />
      </Page>
    </Document>
  );
}
