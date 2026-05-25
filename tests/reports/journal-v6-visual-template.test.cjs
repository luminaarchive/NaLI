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

test("V6 provides a fully composed publication cover and article opener", () => {
  const source = html("zephyr");
  assert.match(source, /data-publication-edition="v6"/);
  assert.match(source, /class="cover-landscape"/);
  assert.match(source, /class="volume-issue-block"/);
  assert.match(source, /Volume 1/);
  assert.match(source, /Issue 1/);
  assert.match(source, /class="article-opener"/);
  assert.match(source, /class="article-category"/);
  assert.match(source, /Polished Academic Article Draft/);
});

test("V6 body, figure plate, and tables use publication layout components", () => {
  const source = html("obsidian");
  assert.match(source, /column-count:\s*2/);
  assert.match(source, /class="figure-plate"/);
  assert.match(source, /class="photo-window"/);
  assert.match(source, />Photo not provided</);
  assert.match(source, /Reserved visual documentation plate for labelled user evidence/);
  assert.match(source, /\.results-table th[\s\S]*background:/);
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

test("V6 article variants exceed long-form minimums and differ editorially", () => {
  const articles = ["peregrine", "obsidian", "zephyr"].map((model) => article(model));
  for (const output of articles) {
    assert.ok(output.abstract.text.split(/\s+/).length >= 180);
    assert.ok(output.introduction.split(/\n\n/).length >= 4);
    assert.ok(output.literatureReview.split(/\n\n/).length >= 4);
    assert.ok(
      output.results.narrative.split(/\n\n/).length + output.discussion.split(/\n\n/).length >= 8,
      "combined results and discussion must read as a full article section",
    );
    assert.ok(output.conclusion.split(/\n\n/).length >= 2);
    assert.ok(output.metadata.articleCategory);
    assert.ok(output.metadata.editorialNote);
  }
  assert.deepEqual(
    articles.map((output) => output.metadata.articleCategory),
    ["Short Communication / Practicum Note", "Evidence Audit Article", "Polished Academic Article Draft"],
  );
  assert.notEqual(articles[0].metadata.editorialNote, articles[1].metadata.editorialNote);
  assert.notEqual(articles[1].metadata.editorialNote, articles[2].metadata.editorialNote);
});
