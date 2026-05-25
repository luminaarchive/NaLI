require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { buildJournalArticle } = require("../../src/lib/reports/journalArticleTemplate");
const { buildJournalHtml } = require("../../src/lib/reports/journalHtmlTemplate");

const repoRoot = path.join(__dirname, "../..");
const input = {
  title: "Pengamatan Morfologi Daun di Sekitar Kampus",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "Daun A dan Daun B references Botany Guide Flora Kampus",
  location: "Sekitar halaman kampus",
  created_at: "25 Mei 2026",
};

function words(value) {
  return new Set(value.toLowerCase().match(/[a-z]{4,}/g) || []);
}

function jaccard(a, b) {
  const left = words(a);
  const right = words(b);
  const intersection = [...left].filter((word) => right.has(word)).length;
  const union = new Set([...left, ...right]).size;
  return intersection / union;
}

test("1. Tier articles have distinct section sets, abstracts, conclusions, and targets", () => {
  const p = buildJournalArticle(input, "peregrine");
  const o = buildJournalArticle(input, "obsidian");
  const z = buildJournalArticle(input, "zephyr");
  assert.notDeepEqual(p.sectionTitles, o.sectionTitles);
  assert.notDeepEqual(o.sectionTitles, z.sectionTitles);
  assert.notEqual(p.abstract.text, o.abstract.text);
  assert.notEqual(o.abstract.text, z.abstract.text);
  assert.notEqual(p.conclusion, o.conclusion);
  assert.notEqual(o.conclusion, z.conclusion);
  assert.ok(p.capabilities.pdfTarget.richFixturePages[1] < o.capabilities.pdfTarget.richFixturePages[0]);
  assert.ok(o.capabilities.pdfTarget.richFixturePages[1] <= z.capabilities.pdfTarget.richFixturePages[0]);
});

test("2. Obsidian audit and Zephyr editorial sections are mutually differentiating", () => {
  const obsidianArticle = buildJournalArticle(input, "obsidian");
  const zephyrArticle = buildJournalArticle(input, "zephyr");
  assert.ok(Array.isArray(obsidianArticle.sectionTitles), "Obsidian must publish its explicit section contract");
  assert.ok(Array.isArray(zephyrArticle.sectionTitles), "Zephyr must publish its explicit section contract");
  const obsidian = obsidianArticle.sectionTitles.join(" ");
  const zephyr = zephyrArticle.sectionTitles.join(" ");
  assert.match(obsidian, /Evidence Sufficiency Assessment|Data Risk Register|Methodological Vulnerability/);
  assert.doesNotMatch(obsidian, /Publication-style Revision Notes|Reviewer-readiness Checklist/);
  assert.match(zephyr, /Integrated Discussion|Publication-style Revision Notes|Reviewer-readiness Checklist/);
});

test("3. Rendered documents advertise different value tiers and different structures", () => {
  const p = buildJournalHtml(buildJournalArticle(input, "peregrine"));
  const o = buildJournalHtml(buildJournalArticle(input, "obsidian"));
  const z = buildJournalHtml(buildJournalArticle(input, "zephyr"));
  assert.match(p, /Starter Draft|Limited Starter Output/);
  assert.doesNotMatch(p, /Data Risk Register|Publication-style Revision Notes/);
  assert.match(o, /Evidence Audit|Data Risk Register|Cannot Be Concluded/);
  assert.doesNotMatch(o, /Premium Journal Draft|Publication-style Revision Notes/);
  assert.match(z, /Premium Journal Draft|Publication-style Revision Notes|Reviewer-readiness Checklist/);
  const tableCount = (html) => (html.match(/<table\b/g) || []).length;
  const figureCount = (html) => (html.match(/<figure\b/g) || []).length;
  assert.ok(tableCount(p) < tableCount(o), "Peregrine must have fewer visible tables than Obsidian");
  assert.ok(tableCount(o) < tableCount(z), "Zephyr must have an exclusive premium table");
  assert.ok(figureCount(p) < figureCount(o), "Peregrine must have fewer visible figures than Obsidian");
  assert.ok(figureCount(o) < figureCount(z), "Zephyr must have an exclusive premium figure");
});

test("4. Tier narrative similarity stays below a broad-overlap threshold", () => {
  const p = buildJournalArticle(input, "peregrine");
  const o = buildJournalArticle(input, "obsidian");
  const z = buildJournalArticle(input, "zephyr");
  const pNarrative = `${p.abstract.text} ${p.introduction} ${p.discussion} ${p.conclusion}`;
  const oNarrative = `${o.abstract.text} ${o.introduction} ${o.discussion} ${o.conclusion}`;
  const zNarrative = `${z.abstract.text} ${z.introduction} ${z.discussion} ${z.conclusion}`;
  assert.ok(jaccard(pNarrative, oNarrative) < 0.68);
  assert.ok(jaccard(oNarrative, zNarrative) < 0.68);
});

test("5. Public PDF/DOCX remains locked and V8 output destination stays outside repo", () => {
  const client = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  assert.match(client, /PDF berbayar belum aktif/);
  assert.doesNotMatch(client, /Unduh DOCX/);
  const generatorPath = path.join(repoRoot, "scratch/generate_reference_journal_v8.cjs");
  assert.equal(fs.existsSync(generatorPath), true, "the V8 external-artifact generator must be checked in");
  const generator = fs.readFileSync(generatorPath, "utf8");
  assert.match(generator, /Downloads", "NaLI-QA"/);
  for (const output of [path.join(os.homedir(), "Downloads", "NaLI-QA"), path.join(os.tmpdir(), "nali-qa")]) {
    assert.ok(path.relative(repoRoot, output).startsWith(".."));
  }
});
