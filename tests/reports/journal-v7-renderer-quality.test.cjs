require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const fs = require("node:fs");
const { buildJournalArticle } = require("../../src/lib/reports/journalArticleTemplate");
const { buildJournalHtml } = require("../../src/lib/reports/journalHtmlTemplate");

const testInput = {
  title: "Pengamatan Morfologi Daun di Sekitar Kampus",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "morfologi daun Daun A dan Daun B references Botany Guide Flora Kampus",
  created_at: "25 Mei 2026",
};

test("1. Premium PDF/HTML template includes refined figure plates with SVG drawings", () => {
  const article = buildJournalArticle(testInput, "zephyr");
  const html = buildJournalHtml(article);

  assert.match(html, /<figure class="figure-plate refined">/);
  assert.match(html, /<svg[^>]*>/, "Template must embed SVG plates directly");
  assert.match(html, /Figure 1\. Editorial comparison plate/);
  assert.match(html, /Figure 2\. Measurement-reading guide/);
  assert.match(html, /Figure 3\. Editorial traceability map/);
});

test("2. Premium template includes measurement, annex, and editorial tables", () => {
  const article = buildJournalArticle(testInput, "zephyr");
  const html = buildJournalHtml(article);

  assert.match(html, /<table class="results-table">/);
  assert.match(html, /<table class="stats-table">/);
  assert.match(html, /<table class="annex-table">/);
  assert.match(html, /<table class="editorial-table">/);
});

test("3. Template includes reference section", () => {
  const article = buildJournalArticle(testInput, "peregrine");
  const html = buildJournalHtml(article);

  assert.match(html, /<h2>REFERENCES PROVIDED BY USER<\/h2>/);
  assert.match(html, /Botany morphology practical guide/);
});

test("4. Obsidian audit sections exist without premium-only editorial sections", () => {
  const article = buildJournalArticle(testInput, "obsidian");
  const html = buildJournalHtml(article);

  assert.match(html, /1\. INTRODUCTION/);
  assert.match(html, /2\. LITERATURE REVIEW/);
  assert.match(html, /3\. MATERIALS AND METHODS/);
  assert.match(html, /4\. RESULTS AND DISCUSSION/);
  assert.match(html, /EVIDENCE SUFFICIENCY ASSESSMENT/);
  assert.match(html, /DATA RISK REGISTER/);
  assert.match(html, /METHODOLOGICAL VULNERABILITY/);
  assert.match(html, /CONCLUSIONS/);
  assert.match(html, /ANNEXURE/);
  assert.doesNotMatch(html, /PUBLICATION-STYLE REVISION NOTES/);
});

test("5. V7 model variants differ in article type and content", () => {
  const peregrine = buildJournalArticle(testInput, "peregrine");
  const obsidian = buildJournalArticle(testInput, "obsidian");
  const zephyr = buildJournalArticle(testInput, "zephyr");

  assert.notEqual(peregrine.metadata.articleCategory, obsidian.metadata.articleCategory);
  assert.notEqual(obsidian.metadata.articleCategory, zephyr.metadata.articleCategory);
  assert.notEqual(peregrine.introduction, obsidian.introduction);
  assert.notEqual(obsidian.discussion, zephyr.discussion);
});

test("6. No copied JWC/E-Palli branding", () => {
  const article = buildJournalArticle(testInput, "zephyr");
  const html = buildJournalHtml(article);

  assert.doesNotMatch(html, /E-Palli/i);
  assert.doesNotMatch(html, /Journal of Water and Climate/i);
  assert.doesNotMatch(html, /JWC/i);
});

test("7. Public export remains locked", () => {
  const article = buildJournalArticle(testInput, "obsidian");
  assert.equal(article.metadata.publicExportStatus, "Public PDF/DOCX export locked");
  assert.equal(article.infoBlock.exportStatus, "Public export locked");
});
