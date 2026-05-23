require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");
const { getEstimatedCreditCost, getEstimatedCreditCostFromQuery } = require("../../src/lib/pricing/plans");

test("pricing cost estimation matches catalog definitions", () => {
  assert.equal(getEstimatedCreditCost("quick_answer"), 2);
  assert.equal(getEstimatedCreditCost("rewrite"), 5);
  assert.equal(getEstimatedCreditCost("standard_report"), 20);
  assert.equal(getEstimatedCreditCost("pdf_export"), 15);
  assert.equal(getEstimatedCreditCost("nonexistent_action_type"), 5); // default fallback
});

test("heuristic query credit cost maps common queries correctly", () => {
  assert.equal(getEstimatedCreditCostFromQuery("Tulis kesimpulan lebih formal"), 5);
  assert.equal(getEstimatedCreditCostFromQuery("buat ringkasan draf lebih pendek"), 5);
  assert.equal(getEstimatedCreditCostFromQuery("Periksa bukti dan sumber data"), 10);
  assert.equal(getEstimatedCreditCostFromQuery("lakukan audit kualitas laporan"), 15);
  assert.equal(getEstimatedCreditCostFromQuery("buat draft akademis scholar style"), 40);
  assert.equal(getEstimatedCreditCostFromQuery("buat matriks literatur"), 60);
  assert.equal(getEstimatedCreditCostFromQuery("random refinement query"), 5); // default fallback
});
