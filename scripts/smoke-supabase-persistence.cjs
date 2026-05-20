require("../tests/helpers/register-ts.cjs");

const { getEnvStatus } = require("../src/lib/config/env.ts");
const { persistGeneratedReport } = require("../src/lib/reports/persistence.ts");
const { buildMockDraftReport, validateReportRequest } = require("../src/lib/reports/reportGenerator.ts");
const { POST: postFeedback } = require("../src/app/api/reports/[id]/feedback/route.ts");
const { GET: getReportRoute } = require("../src/app/api/reports/[id]/route.ts");
const { NextRequest } = require("next/server");

async function runSmokeTest() {
  const envStatus = getEnvStatus();
  const requiredConfigured = Object.keys(envStatus.required).every(
    (key) => envStatus.required[key].availability === "configured"
  );

  if (!requiredConfigured) {
    console.log("Supabase persistence smoke skipped: env missing");
    process.exit(0);
  }

  console.log("Starting Supabase persistence smoke test...");

  const input = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "Saya mengamati erosi di Banjir Kanal Semarang. Tebing sungai terlihat terkikis.",
    integrityConsent: true,
  };

  const guestSessionId = "guest-session-smoke-test-123456";

  const validated = validateReportRequest(input);
  if (!validated.success) {
    console.error("Input validation failed in smoke test:", validated.error);
    process.exit(1);
  }

  const mockReport = buildMockDraftReport(validated.data);

  // 1. Test persistGeneratedReport
  const persistResult = await persistGeneratedReport({
    guestSessionId,
    input: validated.data,
    report: mockReport,
  });

  if (!persistResult.persisted) {
    console.error("Persistence failed in smoke test:", persistResult.reason);
    process.exit(1);
  }

  const { reportId, reportAccessToken } = persistResult;
  console.log(`Report successfully persisted in DB. ID: ${reportId}`);

  // 2. Test GET report route with valid token
  const validRequest = new NextRequest(
    `http://localhost/api/reports/${reportId}?token=${reportAccessToken}`
  );
  const validResponse = await getReportRoute(validRequest, {
    params: Promise.resolve({ id: reportId }),
  });

  if (validResponse.status !== 200) {
    console.error(`Valid token GET rejected with status: ${validResponse.status}`);
    process.exit(1);
  }

  const validPayload = await validResponse.json();
  if (!validPayload.report || validPayload.report.id !== reportId) {
    console.error("Report payload is incorrect or mismatching ID:", validPayload);
    process.exit(1);
  }
  
  // Verify no hashes/secrets are returned
  const serialized = JSON.stringify(validPayload);
  if (/hash|secret|role/i.test(serialized)) {
    console.error("Security alert: Response leaks hashes or secrets!");
    process.exit(1);
  }

  console.log("Valid token access verified successfully.");

  // 3. Test GET report route without token
  const noTokenRequest = new NextRequest(`http://localhost/api/reports/${reportId}`);
  const noTokenResponse = await getReportRoute(noTokenRequest, {
    params: Promise.resolve({ id: reportId }),
  });

  if (noTokenResponse.status !== 401) {
    console.error(`Expected 401 for missing token, got status: ${noTokenResponse.status}`);
    process.exit(1);
  }

  console.log("Missing token rejection verified successfully (401).");

  // 4. Test GET report route with invalid token
  const wrongTokenRequest = new NextRequest(
    `http://localhost/api/reports/${reportId}?token=invalid_token_123`
  );
  const wrongTokenResponse = await getReportRoute(wrongTokenRequest, {
    params: Promise.resolve({ id: reportId }),
  });

  if (wrongTokenResponse.status !== 404) {
    console.error(`Expected 404 for wrong token, got status: ${wrongTokenResponse.status}`);
    process.exit(1);
  }

  console.log("Invalid token rejection verified successfully (404).");

  // 5. Test Feedback route persistence
  const feedbackRequest = new NextRequest(
    `http://localhost/api/reports/${reportId}/feedback`,
    {
      method: "POST",
      body: JSON.stringify({
        rating: "helpful",
        comment: "Excellent smoke test feedback",
        report_access_token: reportAccessToken,
        guestSessionId,
      }),
    }
  );

  const feedbackResponse = await postFeedback(feedbackRequest, {
    params: Promise.resolve({ id: reportId }),
  });

  if (feedbackResponse.status !== 200) {
    console.error(`Feedback submission failed with status: ${feedbackResponse.status}`);
    process.exit(1);
  }

  const feedbackPayload = await feedbackResponse.json();
  if (!feedbackPayload.stored) {
    console.error("Feedback was expected to be stored in DB but wasn't:", feedbackPayload);
    process.exit(1);
  }

  console.log("Feedback persistence verified successfully.");
  console.log("Supabase persistence smoke test completed successfully!");
}

runSmokeTest().catch((err) => {
  console.error("Unhandled error in smoke test:", err);
  process.exit(1);
});
