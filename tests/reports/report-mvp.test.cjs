require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  PUBLIC_REPORT_DISCLAIMER,
  buildMockEvidenceReport,
  validateReportRequest,
} = require("../../src/lib/reports/reportGenerator");

test("rejects report requests without any user-provided material", () => {
  const result = validateReportRequest({
    template: "Laporan Observasi Lingkungan",
    title: "Catatan kosong",
    role: "mahasiswa",
    notes: "   ",
    sourceUrls: "  ",
    location: "",
    uploadedFileNote: "",
    integrityAccepted: true,
  });

  assert.equal(result.success, false);
  assert.match(result.error, /minimal satu bahan/i);
});

test("rejects report requests without academic integrity consent", () => {
  const result = validateReportRequest({
    template: "Laporan Field Trip Sekolah",
    title: "Observasi mangrove",
    role: "siswa",
    notes: "Saya mencatat warna air dan jenis vegetasi di sekitar tambak.",
    sourceUrls: "",
    location: "",
    uploadedFileNote: "",
    integrityAccepted: false,
  });

  assert.equal(result.success, false);
  assert.match(result.error, /integritas akademik/i);
});

test("builds a clearly labeled mock report with evidence and disclaimer", () => {
  const validated = validateReportRequest({
    template: "Laporan Observasi Lingkungan",
    title: "Observasi kualitas air sungai",
    role: "komunitas",
    notes: "Air terlihat keruh setelah hujan. Ada sampah plastik di tepi sungai.",
    sourceUrls: "https://example.org/catatan-sungai",
    location: "Bogor",
    uploadedFileNote: "",
    integrityAccepted: true,
  });

  assert.equal(validated.success, true);

  const report = buildMockEvidenceReport(validated.data);

  assert.equal(report.draft_label, "Draft bantuan belajar/penulisan berbasis bukti.");
  assert.equal(report.disclaimer, PUBLIC_REPORT_DISCLAIMER);
  assert.equal(report.source_verification_status, "Source verification belum aktif di MVP ini.");
  assert.ok(report.evidence_table.length >= 3);
  assert.ok(report.evidence_table.some((row) => row.verification_status.includes("not yet verified")));
  assert.doesNotMatch(JSON.stringify(report), /doi:|10\.[0-9]{4,9}\//i);
});
