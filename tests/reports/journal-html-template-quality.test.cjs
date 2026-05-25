require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");

const { buildJournalArticle } = require("../../src/lib/reports/journalArticleTemplate");
const { buildJournalHtml } = require("../../src/lib/reports/journalHtmlTemplate");

const input = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "Daun A berbentuk lonjong, tepi rata, warna hijau tua. Daun B berbentuk menjari, tepi bergerigi, warna hijau muda.",
  sourceUrls: [],
  location: "Sekitar halaman kampus",
  title: "Pengamatan Morfologi Daun di Sekitar Kampus",
  integrityConsent: true,
};

function htmlFor(model = "peregrine") {
  return buildJournalHtml(buildJournalArticle(input, model));
}

test("HTML template includes a NaLI-branded cover and restrained QA status", () => {
  const html = htmlFor();
  assert.match(html, /class="cover-page"/);
  assert.match(html, /NaLI Nature &amp; Evidence Journal/);
  assert.match(html, /Prepared by NaLI — Native Field Intelligence Services/);
  assert.match(html, /not a published journal article/i);
  assert.ok((html.match(/Internal QA/g) || []).length <= 2, "QA wording must not dominate every page");
});

test("HTML template includes article front matter and print-oriented A4 layout", () => {
  const html = htmlFor();
  assert.match(html, /class="article-first-page"/);
  assert.match(html, /Article Information/);
  assert.match(html, /DOI:\s*not assigned in CP1/i);
  assert.match(html, /ISSN:\s*not applicable/i);
  assert.match(html, /@page/);
  assert.match(html, /size:\s*A4/i);
  assert.match(html, /column-count:\s*2/i);
});

test("HTML template renders journal sections, a figure slot, and semantic result table", () => {
  const html = htmlFor("obsidian");
  for (const section of [
    "INTRODUCTION",
    "LITERATURE REVIEW",
    "MATERIALS AND METHODS",
    "RESULTS AND DISCUSSION",
    "CONCLUSIONS",
    "ANNEXURE",
    "REFERENCES",
  ]) {
    assert.match(html, new RegExp(section));
  }
  assert.match(html, /Figure 1\. Visual documentation slot — photo not provided\./);
  assert.match(html, /<table class="results-table">/);
  assert.match(html, /<caption>Table 1\./);
  assert.doesNotMatch(html, /\|\s*Spesimen\s*\|/);
});

test("HTML template is original NaLI branding and contains no benchmark publisher identity", () => {
  const html = htmlFor("zephyr");
  assert.doesNotMatch(html, /E-Palli|JWC|Journal of Wildlife and Conservation|3070-3689|10\.54536/i);
  assert.match(html, /Source verification belum aktif di MVP ini\./);
});
