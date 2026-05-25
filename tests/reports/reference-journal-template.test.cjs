require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");

const { buildJournalArticle } = require("../../src/lib/reports/journalArticleTemplate");

const testInput = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "morfologi daun Daun A dan Daun B",
  sourceUrls: [],
  location: "Halaman Kampus",
  fileDescription: "",
  userRole: "mahasiswa",
  title: "Pengamatan Morfologi Daun",
  topic: "",
  selectedModel: "peregrine",
  integrityConsent: true,
};

test("1. Journal article template includes cover page data", () => {
  const article = buildJournalArticle(testInput, "peregrine");
  assert.equal(article.cover.journalTitle, "NaLI Nature & Evidence Journal");
  assert.ok(article.cover.issueLine.includes("CP1 Internal"));
  assert.ok(article.cover.truthNote.includes("draft bantuan belajar"));
});

test("2. Article information block exists", () => {
  const article = buildJournalArticle(testInput, "peregrine");
  assert.ok(article.infoBlock.received.includes("Not applicable"));
  assert.ok(article.infoBlock.accepted.includes("Not applicable"));
  assert.ok(article.infoBlock.verificationStatus.includes("Unverified"));
});

test("3. Abstract/keywords/introduction/literature review/methods/results/discussion/conclusion/references exist", () => {
  const article = buildJournalArticle(testInput, "peregrine");
  assert.ok(article.abstract.text.split(/\s+/).length >= 180, "Abstract must be substantial");
  assert.equal(article.abstract.keywords.length, 5);
  assert.ok(article.introduction.split(/\n\n/).length >= 3, "Introduction must be long form");
  assert.ok(article.literatureReview.split(/\n\n/).length >= 3, "Literature review must guide credible source collection");
  assert.ok(article.materialsAndMethods.objectObserved.includes("Spesimen"));
  assert.ok(article.results.comparisonTable.length >= 2);
  assert.ok(article.results.narrative.split(/\n\n/).length >= 2, "Results need interpretation prose");
  assert.ok(article.discussion.split(/\n\n/).length >= 4, "Discussion must not be a mini-report");
  assert.ok(article.conservationRelevance.length > 100);
  assert.ok(article.futureWork.split(/\n\n/).length >= 2);
  assert.ok(article.references[0].includes("No references were supplied"));
});

test("4. No fake DOI/ISSN/citation/species/source verification", () => {
  const article = buildJournalArticle(testInput, "peregrine");
  assert.ok(article.metadata.doi.includes("Not assigned"));
  assert.ok(article.metadata.issn.includes("Not applicable"));
  assert.equal(article.references[0].includes("doi.org"), false);
});

test("5. Evidence placeholders exist", () => {
  const article = buildJournalArticle(testInput, "peregrine");
  assert.ok(article.evidence.photoSlot.includes("Foto belum disediakan"));
  assert.ok(article.evidence.measurementSlot.includes("Data kuantitatif belum disediakan"));
});

test("6. Model-specific sections differ beyond model name", () => {
  const pArticle = buildJournalArticle(testInput, "peregrine");
  const oArticle = buildJournalArticle(testInput, "obsidian");
  const zArticle = buildJournalArticle(testInput, "zephyr");

  assert.notEqual(pArticle.abstract.text, oArticle.abstract.text);
  assert.notEqual(oArticle.abstract.text, zArticle.abstract.text);
  assert.notEqual(pArticle.discussion.split(/\s+/).length, oArticle.discussion.split(/\s+/).length);
  assert.notEqual(oArticle.discussion.split(/\s+/).length, zArticle.discussion.split(/\s+/).length);
  assert.ok(oArticle.cannotBeConcluded.includes("Tidak dapat disimpulkan"));
  assert.ok(zArticle.discussion.includes("narasi"));
  assert.ok(pArticle.conservationRelevance.includes("praktikum"));
});

test("7. Reference-style structure is NaLI-branded, not E-Palli/JWC-branded", () => {
  const article = buildJournalArticle(testInput, "peregrine");
  const str = JSON.stringify(article);
  assert.equal(str.includes("E-Palli"), false);
  assert.equal(str.includes("JWC"), false);
  assert.ok(str.includes("NaLI"));
});

test("8. Draft does not convert unsupported morphological observations into biological claims", () => {
  const combined = ["peregrine", "obsidian", "zephyr"]
    .map((model) => JSON.stringify(buildJournalArticle(testInput, model)))
    .join("\n");
  assert.doesNotMatch(combined, /kandungan klorofil|laju transpirasi|identifikasi spesies terverifikasi/i);
  assert.match(combined, /No references were supplied\. NaLI did not generate artificial references\./);
});
