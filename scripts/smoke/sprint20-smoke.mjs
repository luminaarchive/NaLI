// Sprint 20 smoke test — drives the REAL /create-report UI with Playwright.
// Run the dev server first with:
//   NEXT_PUBLIC_NALI_PREVIEW_BYPASS=1 npm run dev
// Then: node scripts/smoke/sprint20-smoke.mjs
//
// Uses the native value setter to trigger React's onChange (controlled textarea),
// then clicks the real send button. Waits long enough for free-model 429 waterfalls.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(__dirname, "shots");
mkdirSync(SHOTS, { recursive: true });

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const GEN_TIMEOUT = 180000; // generous for free-model 429 fallback waterfalls

// Report markers that must NOT appear in chat, and MUST appear in reports.
const REPORT_MARKERS = /Palantir Confidence Score|Bukti & Klaim|Data yang dibutuhkan/i;
const JOURNAL_WORDS = /\bAbstrak\b|\bKata Kunci\b|\bPendahuluan\b|ANALISIS DAN PEMBAHASAN/i;

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} — ${name}${detail ? ` :: ${detail}` : ""}`);
}

async function newPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
  await ctx.addInitScript(() => {
    window.localStorage.setItem("nali-guest-session-id", "sprint20-smoke-uuid");
    window.localStorage.setItem("nali_welcomed", "true");
  });
  return { ctx, page: await ctx.newPage() };
}

// Native setter → React onChange, for the controlled empty-state composer.
// Retries because React must be hydrated before the input event registers.
async function typeReact(page, selector, text) {
  await page.waitForSelector(selector, { state: "visible", timeout: 30000 });
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.evaluate(
      ({ selector, text }) => {
        const el = document.querySelector(selector);
        if (!el) return;
        const proto = window.HTMLTextAreaElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
        setter.call(el, text);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      },
      { selector, text },
    );
    // Confirm React state caught it (controlled value sticks + send button enables).
    const ok = await page
      .waitForFunction(
        () => {
          const b = document.querySelector('button[aria-label="Buat Laporan"]');
          return b && !b.disabled;
        },
        { timeout: 3000 },
      )
      .then(() => true)
      .catch(() => false);
    if (ok) return;
    await page.waitForTimeout(500);
  }
  throw new Error("composer send button never enabled after typing");
}

// Wait until generation finishes: the ResultView pinned composer ("Susun Laporan"
// button) is visible AND not in a loading state.
async function waitForGenerationDone(page, timeout = GEN_TIMEOUT) {
  // ResultView (with the Susun Laporan button) only mounts once the stream is done.
  await page.waitForSelector('button[aria-label="Susun Laporan"]', { timeout });
  // Small settle for cards to render.
  await page.waitForTimeout(1500);
}

async function bodyText(page) {
  return (await page.locator("main").innerText()).replace(/\s+/g, " ");
}

async function sendFirstMessage(page, text) {
  const composer = 'textarea[placeholder*="Tulis tugas"]';
  // Dev/webpack HMR can throw ChunkLoadError and break hydration on a given load.
  // Reload-retry until the composer is interactive (send button enables on type).
  let typed = false;
  for (let nav = 0; nav < 4 && !typed; nav++) {
    if (nav === 0) await page.goto(`${BASE}/create-report`, { waitUntil: "networkidle" }).catch(() => {});
    else await page.reload({ waitUntil: "networkidle" }).catch(() => {});
    const ready = await page
      .waitForSelector('button[aria-label="Buat Laporan"]', { timeout: 20000 })
      .then(() => true)
      .catch(() => false);
    if (!ready) continue;
    try {
      await typeReact(page, composer, text); // returns only once send button is enabled
      typed = true;
    } catch {
      /* broken hydration — reload and retry */
    }
  }
  if (!typed) throw new Error("composer never became interactive after reload retries");
  await page.locator('button[aria-label="Buat Laporan"]').click();
  await waitForGenerationDone(page);
}

async function test1(browser) {
  const { ctx, page } = await newPage(browser);
  try {
    await sendFirstMessage(page, "aku lihat elang jawa di Merbabu kemarin pagi");
    const txt = await bodyText(page);
    await page.screenshot({ path: join(SHOTS, "test1-chat-default.png"), fullPage: true });
    const hasReport = REPORT_MARKERS.test(txt) || JOURNAL_WORDS.test(txt);
    record(
      "TEST 1 — Chat is the default (observation stays chat)",
      !hasReport,
      hasReport ? "found report/journal markers in response" : "conversational reply, no journal/score",
    );
  } catch (e) {
    await page.screenshot({ path: join(SHOTS, "test1-chat-default.png"), fullPage: true }).catch(() => {});
    record("TEST 1 — Chat is the default", false, `error: ${e.message}`);
  } finally {
    await ctx.close();
  }
}

async function test2(browser) {
  const { ctx, page } = await newPage(browser);
  try {
    await sendFirstMessage(page, "apa itu lazarus species?");
    const txt = await bodyText(page);
    await page.screenshot({ path: join(SHOTS, "test2-casual-question.png"), fullPage: true });
    const hasReport = REPORT_MARKERS.test(txt) || JOURNAL_WORDS.test(txt);
    record(
      "TEST 2 — Casual question stays chat",
      !hasReport,
      hasReport ? "found report/journal markers" : "plain conversational answer, no score",
    );
  } catch (e) {
    await page.screenshot({ path: join(SHOTS, "test2-casual-question.png"), fullPage: true }).catch(() => {});
    record("TEST 2 — Casual question stays chat", false, `error: ${e.message}`);
  } finally {
    await ctx.close();
  }
}

async function test3and5(browser) {
  const { ctx, page } = await newPage(browser);
  try {
    // Send a normal observation first (stays chat).
    await sendFirstMessage(
      page,
      "kemarin pagi aku lihat sepasang elang jawa di lereng Gunung Merbabu, sekitar 1500 mdpl, lagi terbang berputar di atas hutan pinus",
    );

    // Click the Susun Laporan button → gate.
    await page.locator('button[aria-label="Susun Laporan"]').click();
    await page.waitForSelector("text=Sebelum aku susun laporannya", { timeout: 15000 });

    // Verify the 6 format chips.
    const chips = [
      "Observasi Satwa",
      "Laporan KKN",
      "Draft Jurnal Ilmiah",
      "Praktikum Biologi",
      "Survei Biodiversitas",
      "Ringkasan Umum",
    ];
    const chipResults = [];
    for (const c of chips) chipResults.push(await page.locator(`button:has-text("${c}")`).first().isVisible());
    const allChips = chipResults.every(Boolean);
    await page.screenshot({ path: join(SHOTS, "test3a-gate.png"), fullPage: true });

    // Pick Observasi Satwa, then generate.
    await page.locator('button:has-text("Observasi Satwa")').first().click();
    await page.locator('button:has-text("Susun Laporan Sekarang")').click();

    // Wait for the report to finish (button reappears + cards).
    await page.waitForSelector("text=Palantir Confidence Score", { timeout: GEN_TIMEOUT });
    await page.waitForTimeout(2000);
    const txt = await bodyText(page);
    await page.screenshot({ path: join(SHOTS, "test3b-report.png"), fullPage: true });

    const hasJournal = JOURNAL_WORDS.test(txt);
    const hasScore = REPORT_MARKERS.test(txt);
    const hasEvidence = /Bukti & Klaim/i.test(txt);
    const hasMissing = /Data yang dibutuhkan/i.test(txt);
    const hasThinking = /modul selesai/i.test(txt); // collapsed ThinkingBlock summary
    const hasExport =
      (await page.locator('button:has-text("Salin")').count()) > 0 &&
      (await page.locator('button:has-text("PDF")').count()) > 0 &&
      (await page.locator('button:has-text("DOCX")').count()) > 0;

    record(
      "TEST 3 — Button → gate → report",
      allChips && hasJournal && hasScore && hasThinking && hasEvidence && hasMissing && hasExport,
      `chips=${allChips} thinking=${hasThinking} journal=${hasJournal} score=${hasScore} evidence=${hasEvidence} missing=${hasMissing} exportRow=${hasExport}`,
    );

    // TEST 5 — real content + real score %.
    const scoreMatch = txt.match(/Skor:\s*(\d{1,3})%/i) || txt.match(/(\d{1,3})%\s*·/);
    const scorePct = scoreMatch ? parseInt(scoreMatch[1], 10) : NaN;
    const longEnough = txt.length > 800;
    const notPlaceholderOnly = !/\[spesies\]|\[lokasi\]|Tidak Ditetapkan/i.test(txt);
    record(
      "TEST 5 — No regression on report quality",
      longEnough && Number.isFinite(scorePct) && scorePct >= 0 && scorePct <= 100 && notPlaceholderOnly,
      `len=${txt.length} score=${Number.isFinite(scorePct) ? scorePct + "%" : "none"} placeholderFree=${notPlaceholderOnly}`,
    );
  } catch (e) {
    await page.screenshot({ path: join(SHOTS, "test3b-report.png"), fullPage: true }).catch(() => {});
    record("TEST 3 — Button → gate → report", false, `error: ${e.message}`);
    record("TEST 5 — No regression on report quality", false, "blocked by TEST 3 failure");
  } finally {
    await ctx.close();
  }
}

async function test4(browser) {
  const { ctx, page } = await newPage(browser);
  try {
    await sendFirstMessage(page, "buatkan laporan dari pengamatan tadi");
    // report should render
    const ok = await page
      .waitForSelector("text=Palantir Confidence Score", { timeout: GEN_TIMEOUT })
      .then(() => true)
      .catch(() => false);
    await page.waitForTimeout(1500);
    const txt = await bodyText(page);
    await page.screenshot({ path: join(SHOTS, "test4-keyword.png"), fullPage: true });
    const hasReport = REPORT_MARKERS.test(txt) || JOURNAL_WORDS.test(txt);
    record("TEST 4 — Keyword trigger fires report", ok && hasReport, `scoreCard=${ok} journalMarkers=${hasReport}`);
  } catch (e) {
    await page.screenshot({ path: join(SHOTS, "test4-keyword.png"), fullPage: true }).catch(() => {});
    record("TEST 4 — Keyword trigger fires report", false, `error: ${e.message}`);
  } finally {
    await ctx.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    await test1(browser);
    await test2(browser);
    await test3and5(browser);
    await test4(browser);
  } finally {
    await browser.close();
  }

  console.log("\n================ SUMMARY ================");
  let allPass = true;
  for (const r of results) {
    if (!r.pass) allPass = false;
    console.log(`${r.pass ? "✅ PASS" : "❌ FAIL"}  ${r.name} :: ${r.detail}`);
  }
  console.log("========================================");
  process.exit(allPass ? 0 : 1);
})();
