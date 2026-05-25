require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");

const { journalModelCapabilities } = require("../../src/lib/reports/journalModelCapabilities");
const { buildJournalArticle } = require("../../src/lib/reports/journalArticleTemplate");

const input = {
  title: "Fixture pembeda model",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "references Botany Guide Flora Kampus",
  created_at: "25 Mei 2026",
};

test("hard capability ladder grows from starter to audit to premium only", () => {
  const p = journalModelCapabilities.peregrine;
  const o = journalModelCapabilities.obsidian;
  const z = journalModelCapabilities.zephyr;
  assert.ok(p.maxTables < o.maxTables && o.maxTables < z.maxTables);
  assert.ok(p.maxFigures < o.maxFigures && o.maxFigures < z.maxFigures);
  assert.ok(p.estimatedCredits < o.estimatedCredits && o.estimatedCredits < z.estimatedCredits);
  assert.match(p.upgradeNote, /gunakan Obsidian/);
  assert.match(o.upgradeNote, /Zephyr/);
  assert.equal(z.upgradeNote, undefined);
});

test("generated structures expose only their owned capability groups", () => {
  const p = buildJournalArticle(input, "peregrine");
  const o = buildJournalArticle(input, "obsidian");
  const z = buildJournalArticle(input, "zephyr");
  assert.equal(p.audit, undefined);
  assert.equal(p.premium, undefined);
  assert.ok(o.audit);
  assert.equal(o.premium, undefined);
  assert.equal(z.audit, undefined);
  assert.ok(z.premium);
  assert.equal(p.metadata.publicExportStatus, "Public PDF/DOCX export locked");
  assert.equal(z.metadata.sourceVerificationStatus.includes("belum aktif"), true);
});
