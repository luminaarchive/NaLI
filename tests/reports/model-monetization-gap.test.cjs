require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.join(__dirname, "../..");
const capabilityPath = path.join(repoRoot, "src/lib/reports/journalModelCapabilities.ts");
const { buildJournalArticle } = require("../../src/lib/reports/journalArticleTemplate");
const { naliModels } = require("../../src/lib/models/naliModels");

const input = {
  title: "Pengamatan Morfologi Daun di Sekitar Kampus",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "Daun A dan Daun B references Botany Guide Flora Kampus",
  location: "Sekitar halaman kampus",
  created_at: "25 Mei 2026",
};

function capabilities() {
  assert.equal(fs.existsSync(capabilityPath), true, "a hard capability registry must exist");
  return require("../../src/lib/reports/journalModelCapabilities").journalModelCapabilities;
}

test("1. Peregrine is defined as a useful starter with a hard ceiling", () => {
  const p = capabilities().peregrine;
  assert.equal(p.tier, "starter");
  assert.equal(p.articleType, "Starter Brief / Short Practicum Note");
  assert.deepEqual(p.pdfTarget.richFixturePages, [4, 5]);
  assert.deepEqual(p.docxTarget.pages, [4, 6]);
  assert.equal(p.maxTables, 2);
  assert.equal(p.maxFigures, 1);
  assert.equal(p.maxReferences, 2);
});

test("2. Peregrine output excludes audit and flagship editorial capabilities", () => {
  const article = buildJournalArticle(input, "peregrine");
  const { capabilities: _declaredLimits, ...generatedContent } = article;
  const output = JSON.stringify(generatedContent);
  assert.match(output, /Background for Practicum/);
  assert.match(output, /Starter Results/);
  assert.doesNotMatch(
    output,
    /Literature Review|Data Risk Register|Publication-style Revision Notes|Integrated Discussion/,
  );
  assert.equal(article.results.statsTable, undefined);
  assert.equal(article.results.replicatesTable, undefined);
});

test("3. Peregrine includes an honest, non-blocking upgrade nudge", () => {
  const article = buildJournalArticle(input, "peregrine");
  assert.match(article.upgradeNote, /Output ini sengaja dibatasi sebagai starter draft/);
  assert.match(article.upgradeNote, /gunakan Obsidian/);
  assert.match(article.upgradeNote, /gunakan Zephyr/);
});

test("4. Obsidian has the evidence-audit moat and a subtle Zephyr note", () => {
  const article = buildJournalArticle(input, "obsidian");
  const output = JSON.stringify(article);
  assert.match(output, /Evidence Sufficiency Assessment/);
  assert.match(output, /Cannot Be Concluded/);
  assert.match(output, /Data Risk Register/);
  assert.match(output, /Methodological Vulnerability/);
  assert.match(output, /Citation Boundary Audit/);
  assert.match(article.upgradeNote, /lanjutkan dengan Zephyr/);
});

test("5. Zephyr exposes premium-only editorial sections and never upsells", () => {
  const article = buildJournalArticle(input, "zephyr");
  const output = JSON.stringify(article);
  assert.match(output, /Editorial Abstract/);
  assert.match(output, /Integrated Literature Framing/);
  assert.match(output, /Integrated Discussion/);
  assert.match(output, /Publication-style Revision Notes/);
  assert.match(output, /Reviewer-readiness Checklist/);
  assert.equal(article.upgradeNote, undefined);
});

test("6. Model estimate hierarchy is explicit and describes pricing readiness only", () => {
  const models = Object.fromEntries(naliModels.map((model) => [model.id, model]));
  assert.ok(models.peregrine.estimatedCredits < models.obsidian.estimatedCredits);
  assert.ok(models.obsidian.estimatedCredits < models.zephyr.estimatedCredits);
  assert.equal(models.peregrine.costLabel, "Starter");
  assert.equal(models.obsidian.costLabel, "Evidence Audit");
  assert.equal(models.zephyr.costLabel, "Premium");
  for (const model of naliModels) {
    assert.match(model.pricingReadinessNote, /Credit purchase belum aktif/);
  }
});

test("7. Tier copy makes no active-payment claim or manipulative upgrade claim", () => {
  const ui = [
    fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8"),
    fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8"),
    JSON.stringify(naliModels),
  ].join("\n");
  assert.doesNotMatch(ui, /checkout aktif|bayar sekarang untuk membuka|hanya hari ini|segera habis|wajib upgrade/i);
  assert.match(ui, /Credit purchase belum aktif/);
});
