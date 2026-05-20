require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");
const { scoreReportComplexity, shouldSuggestManualFulfillment } = require("../../src/lib/manualFulfillment/jobs");
const { POST: postCreate } = require("../../src/app/api/manual-fulfillment/create/route");
const { GET: getList } = require("../../src/app/api/manual-fulfillment/list/route");
const { PATCH: patchJob } = require("../../src/app/api/manual-fulfillment/[id]/route");

function snapshotEnv() {
  return {
    adminViewEnabled: process.env.ADMIN_VIEW_ENABLED,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

function restoreEnv(snapshot) {
  if (snapshot.adminViewEnabled === undefined) delete process.env.ADMIN_VIEW_ENABLED;
  else process.env.ADMIN_VIEW_ENABLED = snapshot.adminViewEnabled;

  if (snapshot.serviceRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = snapshot.serviceRole;

  if (snapshot.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = snapshot.url;
}

test("scoreReportComplexity calculates correct scores", () => {
  // Empty input -> score 0
  assert.equal(scoreReportComplexity(null), 0);
  assert.equal(scoreReportComplexity({}), 0);

  // Short draft mode -> 20 (draft) + 0 = 20
  assert.equal(scoreReportComplexity({ mode: "draft_from_materials" }), 20);

  // High complexity input: length 1500 -> 10 pts, 3 URLs -> 30 pts, location -> 10 pts, fileDescription -> 10 pts, draft mode -> 20 pts, keyword -> 10 pts = 90 pts
  const input = {
    fileDescription: "Hasil foto udara dan sensor kelembaban tanah",
    location: "Kawasan Konservasi Hutan Mangrove Surabaya",
    mainText: "Analisis mendalam mengenai biodiversitas dan restorasi ekosistem mangrove di pesisir. ".repeat(20), // 1740 chars
    mode: "draft_from_materials",
    sourceUrls: ["http://example.com/1", "http://example.com/2", "http://example.com/3"],
  };
  const score = scoreReportComplexity(input);
  assert.equal(score >= 80, true);
  assert.equal(score <= 100, true);
});

test("shouldSuggestManualFulfillment returns true if score >= 50", () => {
  const highComplexityInput = {
    mode: "draft_from_materials",
    notes: "Analisis mendalam mengenai AMDAL dan hukum regulasi lingkungan hidup nasional.",
    sourceUrls: ["http://example.com/1", "http://example.com/2", "http://example.com/3"], // 30 points
  };
  // Score = 20 (draft) + 30 (URLs) + 10 (keyword) = 60
  assert.equal(shouldSuggestManualFulfillment({ input: highComplexityInput }), true);

  const lowComplexityInput = {
    mode: "start_from_zero",
    notes: "Rencana survei.",
  };
  // Score = 0
  assert.equal(shouldSuggestManualFulfillment({ input: lowComplexityInput }), false);
});

test("API routes return 503 if ADMIN_VIEW_ENABLED is false", async () => {
  const original = snapshotEnv();
  process.env.ADMIN_VIEW_ENABLED = "false";

  try {
    const createRes = await postCreate(
      new Request("http://localhost/api/manual-fulfillment/create", {
        body: JSON.stringify({ report_id: "11111111-1111-4111-8111-111111111111" }),
        method: "POST",
      })
    );
    assert.equal(createRes.status, 503);

    const listRes = await getList(
      new Request("http://localhost/api/manual-fulfillment/list")
    );
    assert.equal(listRes.status, 503);

    const patchRes = await patchJob(
      new Request("http://localhost/api/manual-fulfillment/11111111-1111-4111-8111-111111111111", {
        body: JSON.stringify({ status: "in_review" }),
        method: "PATCH",
      }),
      { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) }
    );
    assert.equal(patchRes.status, 503);
  } finally {
    restoreEnv(original);
  }
});
