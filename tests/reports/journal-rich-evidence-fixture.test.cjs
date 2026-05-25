require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const { richEvidenceFixture } = require("../../src/lib/reports/journalRichEvidenceFixture");

test("1. Fixture includes replicate measurements", () => {
  assert.ok(richEvidenceFixture.groups, "Groups must exist");
  assert.equal(richEvidenceFixture.groups.length, 2, "Must contain Daun A and Daun B groups");
  
  richEvidenceFixture.groups.forEach(g => {
    assert.ok(g.replicates, `Group ${g.name} must contain replicates`);
    assert.ok(g.replicates.length >= 3, `Group ${g.name} must have at least 3 replicates`);
    g.replicates.forEach(r => {
      assert.ok(r.lengthCm > 0, "Length must be greater than 0");
      assert.ok(r.widthCm > 0, "Width must be greater than 0");
      assert.ok(r.petioleLengthCm > 0, "Petiole length must be greater than 0");
      assert.ok(r.shape, "Shape must be defined");
      assert.ok(r.marginType, "Margin must be defined");
    });
    assert.ok(g.stats.meanLength > 0, "Stats mean length must be computed");
    assert.ok(g.stats.meanWidth > 0, "Stats mean width must be computed");
    assert.ok(g.stats.meanPetiole > 0, "Stats mean petiole must be computed");
  });
});

test("2. Fixture includes figure objects", () => {
  assert.ok(richEvidenceFixture.figures, "Figures must be defined");
  assert.ok(richEvidenceFixture.figures.length >= 2, "Must have at least 2 figures");
  
  richEvidenceFixture.figures.forEach(fig => {
    assert.ok(fig.id, "Figure ID must exist");
    assert.ok(fig.title, "Figure title must exist");
    assert.ok(fig.caption, "Figure caption must exist");
  });
});

test("3. Fixture includes reference entries", () => {
  assert.ok(richEvidenceFixture.references, "References must exist");
  assert.ok(richEvidenceFixture.references.length >= 2, "Must contain at least 2 references");
  
  richEvidenceFixture.references.forEach(ref => {
    assert.ok(ref.key, "Reference key must exist");
    assert.ok(ref.citationKey, "Citation key must exist");
    assert.ok(ref.rawText, "Raw reference text must exist");
  });
});

test("4. Fixture labels synthetic placeholders if used", () => {
  richEvidenceFixture.figures.forEach(fig => {
    assert.equal(fig.label, "synthetic QA placeholder", "Figures must be explicitly labeled as synthetic placeholders");
    assert.equal(fig.status, "local QA fixture", "Figures must have local QA status");
  });
});

test("5. Fixture does not claim external verification", () => {
  assert.equal(richEvidenceFixture.evidenceStatus.isVerified, false, "Verification status must be false");
  assert.match(richEvidenceFixture.evidenceStatus.verificationStatusText, /not externally verified/i);
  assert.match(richEvidenceFixture.evidenceStatus.verificationStatusText, /source verification inactive/i);
});
