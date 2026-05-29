import { env } from "process";

async function main() {
  const baseUrl = env.NALI_SMOKE_BASE_URL?.trim() || "http://localhost:3000";
  const url = `${baseUrl}/api/reports/generate`;

  console.log(`Starting NaLI AI Generation Smoke Test...`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Target URL: ${url}`);

  const isJournalMode = env.NALI_SMOKE_JOURNAL_MODE === "true";
  const payload = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    integrityConsent: true,
    mainText: "Lokasi: Lereng Gunung Merapi, Yogyakarta. Tanggal: 25 Mei 2026. Kondisi Teramati: Ditemukan penurunan kerapatan vegetasi pohon jenis Acacia decurrens di plot pengamatan radius 10 meter akibat curah hujan abu tipis seminggu lalu. Bukti terlampir berupa catatan pengamatan lapangan manual dan foto visual (user-supplied). Keterbatasan bukti: Tidak menggunakan pemantauan satelit radar aktif." + (isJournalMode ? " Draf jurnal ilmiah IMRaD." : ""),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Avoid rate limiting during smoke testing if QA headers are supported, or just hit it normally
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FAIL: Request failed with HTTP status ${response.status}`);
      console.error(`Response details: ${errorText}`);
      process.exit(1);
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      console.error("FAIL: Response body is not a valid JSON object");
      process.exit(1);
    }

    console.log(`HTTP Status: 200`);
    console.log(`Response mode: "${data.mode}"`);

    // Sprint 2 metadata logging
    if (data.provider_metadata) {
      console.log(`Provider Status: "${data.provider_metadata.provider_status}"`);
      console.log(`Primary Model Requested: "${data.provider_metadata.primary_model_requested}"`);
      console.log(`Model Actually Used: "${data.provider_metadata.model_used}"`);
      console.log(`Fallback Used: ${data.provider_metadata.fallback_used}`);
    } else {
      console.log("Provider Metadata: Not returned (legacy response)");
    }

    if (data.answer_verification) {
      console.log(`Answer Verification Answered: ${data.answer_verification.answered}`);
      console.log(`Answer Confidence: "${data.answer_verification.answerConfidence}"`);
      console.log(`Detected Output Type: "${data.answer_verification.detectedOutputType}"`);
      console.log(`User Question Summary: "${data.answer_verification.userQuestionSummary}"`);
      
      if (data.answer_verification.answered === false) {
        console.error("FAIL: Answer verification indicates the AI did not answer the user request!");
        process.exit(1);
      }
    } else {
      console.log("Answer Verification: Not returned (legacy response)");
    }

    if (data.journal_readiness) {
      console.log(`Journal Readiness Level: "${data.journal_readiness.readinessLevel}"`);
      console.log(`Journal Ready: ${data.journal_readiness.journalReady}`);
      console.log(`Can Generate Journal PDF Now: ${data.journal_readiness.canGenerateJournalPdfNow}`);
      
      if (data.journal_readiness.canGenerateJournalPdfNow !== false) {
        console.error("FAIL: PDF export gate is active (should remain false/locked in Sprint 3).");
        process.exit(1);
      }
    } else {
      console.log("Journal Readiness: Not returned (legacy response)");
    }

    if (isJournalMode) {
      if (!data.journal_candidate) {
        console.error("FAIL: journal_candidate is missing in response under NALI_SMOKE_JOURNAL_MODE=true");
        process.exit(1);
      }
      if (!data.journal_quality) {
        console.error("FAIL: journal_quality is missing in response under NALI_SMOKE_JOURNAL_MODE=true");
        process.exit(1);
      }
      console.log(`Journal Quality Score: ${data.journal_quality.score}`);
      console.log(`Journal Quality Level: "${data.journal_quality.level}"`);
      console.log("PASS: journal_candidate and journal_quality verifications passed.");
    }

    const mode = data.mode;
    const report = data.report;

    if (!report) {
      console.error("FAIL: Response is missing the 'report' object");
      process.exit(1);
    }

    // Check report contents for required academic integrity disclaimers, uncertainty notes or evidence limitations
    const reportText = JSON.stringify(report).toLowerCase();
    const hasUncertainty = reportText.includes("tidak") || reportText.includes("terbatas") || reportText.includes("kurang") || reportText.includes("uncertainty") || reportText.includes("ragu");
    const hasDisclaimer = reportText.includes("draft") || reportText.includes("bantuan") || reportText.includes("tanggung jawab") || reportText.includes("disclaimer") || reportText.includes("integritas");

    if (!hasUncertainty && !hasDisclaimer) {
      console.warn("WARNING: Report does not seem to contain detailed disclaimers or uncertainty markers!");
    } else {
      console.log("PASS: Found disclaimers or uncertainty markers in report content.");
    }

    const allowMock = env.NALI_SMOKE_ALLOW_MOCK === "true";

    if (mode === "mock") {
      if (allowMock) {
        console.log("NOTICE: Returned mode is 'mock', which is allowed via NALI_SMOKE_ALLOW_MOCK=true.");
        console.log("PASS: Local/demo mock verification succeeded.");
        process.exit(0);
      } else {
        console.error("FAIL: Generation returned mode: 'mock' when mode: 'ai' was expected in production-like mode.");
        process.exit(1);
      }
    }

    if (mode === "ai") {
      if (data.notice && data.notice.includes("DEMO/MOCK")) {
        console.error("FAIL: Response has mode: 'ai' but contains a demo/mock notice.");
        process.exit(1);
      }

      console.log("PASS: production/test generation returned mode: 'ai'");
      process.exit(0);
    }

    console.error(`FAIL: Unexpected mode "${mode}" in response`);
    process.exit(1);
  } catch (error) {
    console.error("FAIL: Network or system connection error during smoke test");
    console.error(error);
    process.exit(1);
  }
}

main();
