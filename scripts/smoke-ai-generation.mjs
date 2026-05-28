import { env } from "process";

async function main() {
  const baseUrl = env.NALI_SMOKE_BASE_URL?.trim() || "http://localhost:3000";
  const url = `${baseUrl}/api/reports/generate`;

  console.log(`Starting NaLI AI Generation Smoke Test...`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Target URL: ${url}`);

  const payload = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    integrityConsent: true,
    mainText: "Lokasi: Lereng Gunung Merapi, Yogyakarta. Tanggal: 25 Mei 2026. Kondisi Teramati: Ditemukan penurunan kerapatan vegetasi pohon jenis Acacia decurrens di plot pengamatan radius 10 meter akibat curah hujan abu tipis seminggu lalu. Bukti terlampir berupa catatan pengamatan lapangan manual dan foto visual (user-supplied). Keterbatasan bukti: Tidak menggunakan pemantauan satelit radar aktif.",
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
