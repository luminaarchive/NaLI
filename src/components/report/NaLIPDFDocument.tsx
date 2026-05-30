import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ParsedReport } from "@/lib/parse-report-markdown";

const TEAL = "#00875A"; // slightly muted for print
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

  // Page header (every page)
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

  // Title section
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

  // Abstract / Ringkasan
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

  // Section header
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

  // Body text
  bodyText: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: DARK,
    lineHeight: 1.55,
    marginBottom: 4,
  },

  // Evidence table
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

  // Bullet points
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

  // Disclaimer (inline at doc end)
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

  // Page footer
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
});

interface Props {
  reportTitle: string;
  sections: ParsedReport["sections"];
  prompt: string;
  modelUsed: string;
  generatedAt: string;
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
        {/* Header */}
        <View style={styles.tableHeaderRow}>
          <View style={styles.thClaim}><Text style={styles.thText}>Klaim</Text></View>
          <View style={styles.thSource}><Text style={styles.thText}>Sumber Bukti</Text></View>
          <View style={styles.thStatus}><Text style={styles.thText}>Status</Text></View>
        </View>
        {/* Rows */}
        {section.tableRows.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <View style={styles.thClaim}><Text style={styles.tdText}>{row.claim}</Text></View>
            <View style={styles.thSource}><Text style={styles.tdText}>{row.source}</Text></View>
            <View style={styles.thStatus}><Text style={statusStyle(row.status)}>{row.status}</Text></View>
          </View>
        ))}
      </View>
    );
  }

  // Plain text lines
  const rawLines = section.content.trim().split("\n").filter((l) => l.trim());
  const isUncertainty = section.title.toLowerCase().includes("ketidakpastian") || section.title.toLowerCase().includes("catatan");

  return (
    <>
      {rawLines.map((line, i) => {
        const isBullet = line.startsWith("• ");
        const text = isBullet ? line.slice(2) : line;
        if (isBullet && isUncertainty) {
          return (
            <View key={i} style={styles.bullet}>
              <Text style={styles.bulletMark}>{"▲"}</Text>
              <Text style={styles.bulletText}>{text}</Text>
            </View>
          );
        }
        return (
          <Text key={i} style={styles.bodyText}>
            {isBullet ? `• ${text}` : text}
          </Text>
        );
      })}
    </>
  );
}

export function NaLIPDFDocument({ reportTitle, sections, prompt, modelUsed, generatedAt }: Props) {
  // Find abstract (Ringkasan) section
  const abstractSection = sections.find((s) =>
    s.title.toLowerCase().includes("ringkasan") || s.title.toLowerCase().includes("abstrak"),
  );
  const otherSections = sections.filter((s) => s !== abstractSection);

  const shortPrompt = prompt.length > 160 ? prompt.slice(0, 160) + "..." : prompt;

  return (
    <Document
      title={reportTitle}
      author="NaLI by NatIve"
      subject="Draft Laporan NaLI"
      creator="naliai.vercel.app"
    >
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

        {/* Source material note */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>
            Bahan Pengguna
          </Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 9, color: "#444444", fontStyle: "italic", lineHeight: 1.5 }}>
            {shortPrompt}
          </Text>
        </View>

        {/* Abstract / Ringkasan box */}
        {abstractSection && (
          <View style={styles.abstractBox}>
            <Text style={styles.abstractLabel}>Ringkasan</Text>
            <Text style={styles.abstractText}>
              {abstractSection.content.trim().replace(/\n+/g, " ")}
            </Text>
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

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit, memverifikasi sumber,
            dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh digunakan untuk memalsukan data atau mengklaim karya AI sebagai karya final.
          </Text>
        </View>

        {/* Page footer */}
        <View style={styles.pageFooter} fixed render={({ pageNumber }) => (
          <>
            <Text style={styles.footerText}>Halaman {pageNumber}</Text>
            <Text style={styles.footerText}>Draft NaLI. Verifikasi akhir tetap tanggung jawab pengguna.</Text>
            <Text style={styles.footerText}>naliai.vercel.app</Text>
          </>
        )} />
      </Page>
    </Document>
  );
}
