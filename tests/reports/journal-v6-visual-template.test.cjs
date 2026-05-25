require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");

const { buildJournalArticle } = require("../../src/lib/reports/journalArticleTemplate");
const { buildJournalHtml } = require("../../src/lib/reports/journalHtmlTemplate");

const input = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "Daun A lonjong bertepi rata dan hijau tua. Daun B menjari bertepi bergerigi dan hijau muda.",
  location: "Sekitar halaman kampus",
  title: "Pengamatan Morfologi Daun di Sekitar Kampus",
  integrityConsent: true,
};

function article(model = "peregrine") {
  return buildJournalArticle(input, model);
}

function html(model = "peregrine") {
  return buildJournalHtml(article(model));
}

test("V8 provides a tier-labelled premium cover and article opener", () => {
  const source = html("zephyr");
  assert.match(source, /data-publication-edition="v8"/);
  assert.match(source, /class="page cover-page premium"/);
  assert.match(source, /class="page article-opener premium"/);
  assert.match(source, /Premium Journal Draft/);
  assert.match(source, /Premium Journal Article Draft/);
});

test("V8 audit body, figure plate, and tables use audit layout components", () => {
  const source = html("obsidian");
  assert.match(source, /column-count:\s*2/);
  assert.match(source, /class="figure-plate /);
  assert.match(source, /synthetic QA placeholder/);
  assert.match(source, /Reported shape comparison/);
  assert.match(source, /\.audit th \{ background:/);
  assert.match(source, /<table class="annex-table">/);
  assert.doesNotMatch(source, /\|\s*Object\s*\|/);
});

test("V6 removes dominant operational furniture and copied benchmark identity", () => {
  const source = html("peregrine");
  assert.doesNotMatch(source, /N\s+FOUNDER|Founder\/Admin Draft Series|Internal QA/i);
  assert.doesNotMatch(source, /DOI:\s*Not assigned|ISSN:\s*Not applicable/i);
  assert.ok((source.match(/CP1 Founder\/Admin QA Edition/g) || []).length <= 1);
  assert.ok((source.match(/Draft only; source verification inactive; public export locked\./g) || []).length <= 2);
  assert.doesNotMatch(source, /E-Palli|JWC|Journal of Wildlife and Conservation|3070-3689|10\.54536/i);
});

test("V8 article variants impose the starter ceiling and premium expansion", () => {
  const articles = ["peregrine", "obsidian", "zephyr"].map((model) => article(model));
  assert.equal(articles[0].results.statsTable, undefined);
  assert.ok(articles[1].audit);
  assert.ok(articles[2].premium);
  assert.ok(articles[0].capabilities.maxTables < articles[1].capabilities.maxTables);
  assert.ok(articles[1].capabilities.maxTables < articles[2].capabilities.maxTables);
  assert.deepEqual(
    articles.map((output) => output.metadata.articleCategory),
    ["Starter Brief / Short Practicum Note", "Evidence Audit Article", "Premium Journal Article Draft"],
  );
  assert.notEqual(articles[0].metadata.editorialNote, articles[1].metadata.editorialNote);
  assert.notEqual(articles[1].metadata.editorialNote, articles[2].metadata.editorialNote);
});
