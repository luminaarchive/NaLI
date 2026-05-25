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
  assert.ok(article.abstract.text.length > 50);
  assert.ok(article.abstract.keywords.length >= 3);
  assert.ok(article.introduction.includes("Pendahuluan"));
  assert.ok(article.literatureReview.includes("Tinjauan Pustaka"));
  assert.ok(article.materialsAndMethods.objectObserved.includes("Spesimen"));
  assert.ok(article.results.comparisonTable.length >= 2);
  assert.ok(article.discussion.includes("Hasil dan Pembahasan"));
  assert.ok(article.conclusion.includes("Kesimpulan"));
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
  assert.ok(oArticle.abstract.text.includes("Ketiadaan bukti foto"));
  assert.ok(zArticle.abstract.text.includes("Laporan pengamatan mandiri ini menyajikan"));
});

test("7. Reference-style structure is NaLI-branded, not E-Palli/JWC-branded", () => {
  const article = buildJournalArticle(testInput, "peregrine");
  const str = JSON.stringify(article);
  assert.equal(str.includes("E-Palli"), false);
  assert.equal(str.includes("JWC"), false);
  assert.ok(str.includes("NaLI"));
});
