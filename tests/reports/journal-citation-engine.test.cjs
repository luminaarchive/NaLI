require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const { processCitations } = require("../../src/lib/reports/journalCitationEngine");

const sampleRefs = [
  {
    key: "ref1",
    citationKey: "[Ref: Botany Guide, 2024]",
    rawText: "Botany morphology practical guide, no DOI supplied. [local QA fixture]"
  },
  {
    key: "ref2",
    citationKey: "[Ref: Flora Kampus, 2025]",
    rawText: "Flora dan Morfologi Tumbuhan Kampus, no DOI supplied. [local QA fixture]"
  }
];

test("1. Renders in-text citations correctly", () => {
  const text = "Menurut panduan [Ref: Botany Guide, 2024], daun A rata. Hasil inventori [Ref: Flora Kampus, 2025] mendukug.";
  const result = processCitations(text, sampleRefs);
  
  assert.equal(result.processedText, "Menurut panduan [1], daun A rata. Hasil inventori [2] mendukug.");
});

test("2. Does not invent DOI or credentials", () => {
  const result = processCitations("Text", sampleRefs);
  result.bibliography.forEach(bib => {
    assert.doesNotMatch(bib, /doi\.org/i);
    assert.match(bib, /no DOI supplied/i);
  });
});

test("3. Handles no-reference case gracefully", () => {
  const text = "Intro text.";
  const result = processCitations(text, []);
  
  assert.equal(result.processedText, text);
  assert.equal(result.bibliography.length, 1);
  assert.match(result.bibliography[0], /No references were supplied/);
  assert.match(result.bibliography[0], /did not generate artificial references/);
});

test("4. Produces consistent bibliography output", () => {
  const result = processCitations("Test", sampleRefs);
  assert.equal(result.bibliography.length, 2);
  assert.equal(result.bibliography[0], "[1] Botany morphology practical guide, no DOI supplied. [local QA fixture]");
  assert.equal(result.bibliography[1], "[2] Flora dan Morfologi Tumbuhan Kampus, no DOI supplied. [local QA fixture]");
});

test("5. No source verification claim is made", () => {
  const result = processCitations("Test", sampleRefs);
  result.bibliography.forEach(bib => {
    assert.doesNotMatch(bib, /verified/i);
    assert.match(bib, /local QA fixture/i);
  });
});
