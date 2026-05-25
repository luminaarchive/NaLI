require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const exifr = require("exifr");
const { readLocalImageMetadata } = require("../../src/lib/reports/localImageMetadata");

test("localImageMetadata - rejects non-image file types safely", async () => {
  const mockFile = {
    name: "test.txt",
    type: "text/plain",
    size: 1024,
    lastModified: Date.now(),
  };
  const result = await readLocalImageMetadata(mockFile);
  assert.equal(result.ok, false);
  assert.ok(result.warnings.some(w => w.includes("Tipe file tidak didukung")));
});

test("localImageMetadata - rejects oversized files safely", async () => {
  const mockFile = {
    name: "huge-image.jpg",
    type: "image/jpeg",
    size: 11 * 1024 * 1024, // 11MB
    lastModified: Date.now(),
  };
  const result = await readLocalImageMetadata(mockFile);
  assert.equal(result.ok, false);
  assert.ok(result.warnings.some(w => w.includes("Ukuran file terlalu besar")));
});

test("localImageMetadata - returns uploaded: false and source metadata flags", async () => {
  const mockFile = {
    name: "photo.jpg",
    type: "image/jpeg",
    size: 2 * 1024 * 1024,
    lastModified: Date.now(),
  };
  const result = await readLocalImageMetadata(mockFile);
  assert.equal(result.uploaded, false);
  assert.equal(result.source, "local_file_metadata");
});

test("localImageMetadata - never includes file binary/base64 in output", async () => {
  const mockFile = {
    name: "photo.jpg",
    type: "image/jpeg",
    size: 2048,
    lastModified: Date.now(),
    content: "binary-payload-mock",
  };
  const result = await readLocalImageMetadata(mockFile);
  assert.equal(result.content, undefined);
  assert.equal(result.binary, undefined);
  assert.equal(result.base64, undefined);
});

test("localImageMetadata - sanitizes file names", async () => {
  const mockFile = {
    name: "photo/../<b>malicious</b>.jpg",
    type: "image/jpeg",
    size: 1024,
    lastModified: Date.now(),
  };
  const result = await readLocalImageMetadata(mockFile);
  assert.ok(result.fileName);
  assert.doesNotMatch(result.fileName, /<b>/);
  assert.doesNotMatch(result.fileName, /\.\./);
  assert.equal(result.fileName, "photo.bmaliciousb.jpg");
});

test("localImageMetadata - returns fallback lastModified metadata without claiming capturedAt if EXIF absent", async () => {
  // Back up original exifr methods
  const origParse = exifr.parse;
  const origGps = exifr.gps;
  const origDefaultParse = exifr.default ? exifr.default.parse : undefined;
  const origDefaultGps = exifr.default ? exifr.default.gps : undefined;

  // Mock exifr methods to simulate absent EXIF metadata
  exifr.parse = async () => null;
  exifr.gps = async () => null;
  if (exifr.default) {
    exifr.default.parse = async () => null;
    exifr.default.gps = async () => null;
  }

  try {
    const mockTime = 1716595200000; // Fixed timestamp
    const mockFile = {
      name: "no-exif.jpg",
      type: "image/jpeg",
      size: 1024,
      lastModified: mockTime,
    };
    const result = await readLocalImageMetadata(mockFile);
    assert.equal(result.ok, true);
    assert.equal(result.capturedAt, undefined);
    assert.equal(result.fileLastModifiedAt, new Date(mockTime).toISOString());
    assert.ok(result.warnings.some(w => w.includes("Metadata lokasi dan waktu pengambilan foto tidak ditemukan")));
  } finally {
    // Restore exifr
    exifr.parse = origParse;
    exifr.gps = origGps;
    if (exifr.default) {
      if (origDefaultParse) exifr.default.parse = origDefaultParse;
      if (origDefaultGps) exifr.default.gps = origDefaultGps;
    }
  }
});

test("localImageMetadata - warnings explain metadata is local/unverified", async () => {
  const origParse = exifr.parse;
  const origGps = exifr.gps;
  const origDefaultParse = exifr.default ? exifr.default.parse : undefined;
  const origDefaultGps = exifr.default ? exifr.default.gps : undefined;

  // Mock exifr methods to return valid metadata
  const mockParse = async () => ({ DateTimeOriginal: new Date("2026-05-24T23:53:52Z") });
  const mockGps = async () => ({ latitude: -7.1234, longitude: 110.1234 });

  exifr.parse = mockParse;
  exifr.gps = mockGps;
  if (exifr.default) {
    exifr.default.parse = mockParse;
    exifr.default.gps = mockGps;
  }

  try {
    const mockFile = {
      name: "valid-metadata.jpg",
      type: "image/jpeg",
      size: 1024,
      lastModified: Date.now(),
    };
    const result = await readLocalImageMetadata(mockFile);
    assert.equal(result.ok, true);
    assert.equal(result.capturedAt, "2026-05-24T23:53:52.000Z");
    assert.equal(result.latitude, -7.1234);
    assert.equal(result.longitude, 110.1234);
    assert.ok(result.warnings.some(w => w.includes("dibaca secara lokal") && w.includes("tidak melalui verifikasi server")));
  } finally {
    exifr.parse = origParse;
    exifr.gps = origGps;
    if (exifr.default) {
      if (origDefaultParse) exifr.default.parse = origDefaultParse;
      if (origDefaultGps) exifr.default.gps = origDefaultGps;
    }
  }
});

test("UI Integration - CreateReportForm contains local upload copy and no API upload route", () => {
  const formPath = path.join(__dirname, "../../src/components/report/CreateReportForm.tsx");
  const formCode = fs.readFileSync(formPath, "utf-8");

  // Check required copy
  assert.ok(formCode.includes("File tidak diupload"));
  assert.ok(formCode.includes("Bantu isi dari metadata foto lokal"));
  assert.ok(formCode.includes("Baca metadata lokal"));
  assert.ok(formCode.includes("Gunakan sebagai isian awal"));
  assert.ok(formCode.includes("Hapus pilihan"));

  // Check no upload API endpoint is introduced or called
  assert.doesNotMatch(formCode, /\/api\/reports\/upload/gi);
  assert.doesNotMatch(formCode, /\/api\/upload/gi);

  // Check storage safety (no binary stored in clientRecovery/localStorage)
  const recoveryPath = path.join(__dirname, "../../src/lib/reports/clientRecovery.ts");
  const recoveryCode = fs.readFileSync(recoveryPath, "utf-8");
  assert.doesNotMatch(recoveryCode, /image\/jpeg/);
  assert.doesNotMatch(recoveryCode, /base64/);
});

test("UI Integration - Local copy/export labels and locks are preserved", () => {
  const clientPath = path.join(__dirname, "../../src/components/report/ReportResultClient.tsx");
  const clientCode = fs.readFileSync(clientPath, "utf-8");

  // Must preserve lock copy
  assert.ok(clientCode.includes("PDF berbayar belum aktif di fase testing ini. Export berbayar masih terkunci."));
  
  // Must render local export copy
  assert.ok(clientCode.includes("Unduh Markdown lokal"));
  assert.ok(clientCode.includes("Unduh teks lokal"));
  assert.ok(clientCode.includes("Salin teks biasa"));

  // Check copy plain text implementation exists
  assert.ok(clientCode.includes("copyPlainText"));
  assert.ok(clientCode.includes("stripMarkdown"));
  assert.ok(clientCode.includes("downloadLocalFile"));
  assert.ok(clientCode.includes("copyTextToClipboard"));

  // Workspace check
  const workspacePath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  const workspaceCode = fs.readFileSync(workspacePath, "utf-8");

  assert.ok(workspaceCode.includes("Unduh Markdown lokal"));
  assert.ok(workspaceCode.includes("Unduh teks lokal"));
  assert.ok(workspaceCode.includes("Salin teks biasa"));
  assert.ok(workspaceCode.includes("PDF berbayar belum aktif di fase testing ini. Export berbayar masih terkunci."));
});

test("System safety - no Midtrans or paid activation", () => {
  const workspacePath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  const workspaceCode = fs.readFileSync(workspacePath, "utf-8");

  // Midtrans config must NOT be enabled in the workspace logic
  assert.doesNotMatch(workspaceCode, /midtransTokenActive\s*=\s*true/);

  // No founder page linked publicly
  assert.doesNotMatch(workspaceCode, /href=['"]\/founder['"]/);
});

test("package.json - no heavy dependencies added", () => {
  const pkgPath = path.join(__dirname, "../../package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  
  const deps = pkg.dependencies || {};
  // Verify no OCR or huge file parsing libraries added in this sprint
  assert.equal(deps["tesseract.js"], undefined);
  assert.equal(deps["pdfjs-dist"], undefined);
});
