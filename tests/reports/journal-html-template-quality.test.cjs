require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");

const { buildJournalArticle } = require("../../src/lib/reports/journalArticleTemplate");
const { buildJournalHtml } = require("../../src/lib/reports/journalHtmlTemplate");

const input = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText:
    "Daun A berbentuk lonjong, tepi rata, warna hijau tua. Daun B berbentuk menjari, tepi bergerigi, warna hijau muda.",
  sourceUrls: [],
  location: "Sekitar halaman kampus",
  title: "Pengamatan Morfologi Daun di Sekitar Kampus",
  integrityConsent: true,
};

function htmlFor(model = "peregrine") {
  return buildJournalHtml(buildJournalArticle(input, model));
}

test("HTML template includes a NaLI-branded publication cover and restrained truth status", () => {
  const html = htmlFor();
  assert.match(html, /class="page cover-page starter"/);
  assert.match(html, /NaLI Nature &amp; Evidence Journal/);
  assert.match(html, /Prepared by NaLI - Native/);
  assert.match(html, /Draft only; source verification inactive; public export locked\./);
  assert.doesNotMatch(html, /Internal QA|Founder\/Admin Draft Series/i);
});

test("HTML template includes article front matter and print-oriented A4 layout", () => {
  const html = htmlFor();
  assert.match(html, /class="page article-opener starter"/);
  assert.match(html, /Limited Starter Output/);
  assert.doesNotMatch(html, /DOI:\s*not assigned in CP1|ISSN:\s*not applicable/i);
  assert.match(html, /@page/);
  assert.match(html, /size:\s*A4/i);
  assert.match(html, /column-count:\s*2/i);
});

test("HTML audit template renders its serious audit sections and semantic result table", () => {
  const html = htmlFor("obsidian");
  for (const section of [
    "INTRODUCTION",
    "LITERATURE REVIEW",
    "MATERIALS AND METHODS",
    "RESULTS AND DISCUSSION",
    "EVIDENCE SUFFICIENCY ASSESSMENT",
    "DATA RISK REGISTER",
    "CONCLUSIONS",
    "ANNEXURE",
    "REFERENCES",
  ]) {
    assert.match(html, new RegExp(section));
  }
  assert.match(html, /Figure 1\. Reported shape comparison/);
  assert.match(html, /<table class="results-table">/);
  assert.match(html, /<caption>Table 1\./);
  assert.doesNotMatch(html, /\|\s*Spesimen\s*\|/);
});

test("HTML template is original NaLI branding and contains no benchmark publisher identity", () => {
  const html = htmlFor("zephyr");
  assert.doesNotMatch(html, /E-Palli|JWC|Journal of Wildlife and Conservation|3070-3689|10\.54536/i);
  assert.match(html, /source verification inactive/i);
});
