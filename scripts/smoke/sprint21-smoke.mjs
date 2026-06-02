// Sprint 21 smoke test — shareable read-only report link /r/[id].
// Drives the REAL UI with Playwright against real Supabase (public anon key) +
// real OpenRouter. Uses a throwaway test account via the real /login flow.
//
// Run dev first with the real Supabase URL + anon key in the environment, then:
//   node scripts/smoke/sprint21-smoke.mjs
//
// Env: SMOKE_EMAIL, SMOKE_PASSWORD (test account), SMOKE_BASE_URL (default localhost:3000)

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(__dirname, "shots21");
mkdirSync(SHOTS, { recursive: true });

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const EMAIL = process.env.SMOKE_EMAIL || "sprint21.smoke@nali.test";
const PASSWORD = process.env.SMOKE_PASSWORD || "Sprint21Smoke!pw";
const GEN_TIMEOUT = 180000;

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} — ${name}${detail ? ` :: ${detail}` : ""}`);
}

async function setNative(page, selector, text) {
  await page.evaluate(
    ({ selector, text }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const proto =
        el instanceof window.HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
      setter.call(el, text);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    },
    { selector, text },
  );
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector('input[type="email"]', { state: "visible", timeout: 20000 });
  // Retry until React (hydrated) holds both values.
  for (let i = 0; i < 8; i++) {
    await setNative(page, 'input[type="email"]', EMAIL);
    await setNative(page, 'input[type="password"]', PASSWORD);
    const ok = await page.evaluate(() => {
      const e = document.querySelector('input[type="email"]');
      const p = document.querySelector('input[type="password"]');
      return e && p && e.value.length > 0 && p.value.length > 0;
    });
    if (ok) break;
    await page.waitForTimeout(500);
  }
  await page.locator('button[type="submit"]:has-text("Masuk")').click();
  // Cold dev compile of /create-report can be slow; allow generous time, and fail
  // fast if credentials are rejected.
  const outcome = await Promise.race([
    page
      .waitForURL(/\/create-report/, { timeout: 120000 })
      .then(() => "ok")
      .catch(() => null),
    page
      .waitForSelector("text=Email atau password salah", { timeout: 120000 })
      .then(() => "bad-creds")
      .catch(() => null),
  ]);
  if (outcome !== "ok") throw new Error(`login failed (${outcome ?? "no redirect"})`);
  await page.waitForLoadState("networkidle");
}

async function typeComposer(page, text) {
  const composer = 'textarea[placeholder*="Tulis tugas"]';
  for (let attempt = 0; attempt < 6; attempt++) {
    await page.waitForSelector(composer, { state: "visible", timeout: 20000 });
    await setNative(page, composer, text);
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
  throw new Error("composer send button never enabled");
}

async function generateReport(page) {
  // First message stays chat.
  await typeComposer(
    page,
    "kemarin pagi aku lihat sepasang elang jawa di lereng Gunung Merbabu, sekitar 1500 mdpl, terbang berputar di atas hutan pinus",
  );
  await page.locator('button[aria-label="Buat Laporan"]').click();
  await page.waitForSelector('button[aria-label="Susun Laporan"]', { timeout: GEN_TIMEOUT });
  await page.waitForTimeout(1000);
  // Button → gate → format → generate.
  await page.locator('button[aria-label="Susun Laporan"]').click();
  await page.waitForSelector("text=Sebelum aku susun laporannya", { timeout: 15000 });
  await page.locator('button:has-text("Observasi Satwa")').first().click();
  await page.locator('button:has-text("Susun Laporan Sekarang")').click();
  await page.waitForSelector("text=Palantir Confidence Score", { timeout: GEN_TIMEOUT });
  await page.waitForTimeout(2000);
}

async function test1_generateAndShare(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1400 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await ctx.newPage();
  let shareUrl = null;
  try {
    await login(page);
    await generateReport(page);

    // Capture the share API response.
    const respPromise = page.waitForResponse(
      (r) => r.url().includes("/api/share-report") && r.request().method() === "POST",
      { timeout: 30000 },
    );
    await page.locator('button[aria-label="Bagikan"]').first().click();
    const resp = await respPromise;
    const payload = await resp.json().catch(() => ({}));
    shareUrl = payload?.url || null;

    const confirmShown = await page
      .waitForSelector("text=Link disalin", { timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    await page.screenshot({ path: join(SHOTS, "test1-share.png"), fullPage: true });
    const urlOk = typeof shareUrl === "string" && /\/r\/[A-Za-z0-9_-]{8,}$/.test(shareUrl);
    record("TEST 1 — Generate + share", urlOk && confirmShown, `url=${shareUrl} confirmation=${confirmShown}`);
  } catch (e) {
    await page.screenshot({ path: join(SHOTS, "test1-share.png"), fullPage: true }).catch(() => {});
    record("TEST 1 — Generate + share", false, `error: ${e.message}`);
  } finally {
    await ctx.close();
  }
  return shareUrl;
}

function shareIdFromUrl(url) {
  return url ? url.split("/r/")[1] : null;
}

async function test2and3_publicRead(browser, shareId) {
  // Fresh logged-OUT context — no cookies.
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}/r/${shareId}`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Palantir Confidence Score", { timeout: 20000 });
    const txt = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    await page.screenshot({ path: join(SHOTS, "test2-public.png"), fullPage: true });

    const hasTitle = /Elang Jawa/i.test(txt);
    const hasJournal = /\bAbstrak\b/i.test(txt) && /Rekomendasi/i.test(txt);
    const hasScore = /Palantir Confidence Score/i.test(txt);
    const hasEvidence = /Bukti & Klaim/i.test(txt);
    const hasMissing = /Data yang dibutuhkan/i.test(txt);
    const hasPdf = (await page.locator('button:has-text("Unduh PDF")').count()) > 0;
    const hasDocx = (await page.locator('button:has-text("Unduh DOCX")').count()) > 0;
    const hasFooter = /Dibuat dengan NaLI/i.test(txt);
    record(
      "TEST 2 — Public read (logged out)",
      hasTitle && hasJournal && hasScore && hasEvidence && hasMissing && hasPdf && hasDocx && hasFooter,
      `title=${hasTitle} journal=${hasJournal} score=${hasScore} evidence=${hasEvidence} missing=${hasMissing} pdf=${hasPdf} docx=${hasDocx} footer=${hasFooter}`,
    );

    // TEST 3 — read-only enforcement.
    const noComposer = (await page.locator("textarea").count()) === 0;
    const noSendBtn = (await page.locator('button[aria-label="Buat Laporan"]').count()) === 0;
    const noSusun = (await page.locator('button[aria-label="Susun Laporan"]').count()) === 0;
    const noThinking = !/modul selesai/i.test(txt);
    const noSidebar =
      (await page.locator("text=Buat Laporan Baru").count()) === 0 &&
      (await page.locator("text=Riwayat Lokal").count()) === 0;
    const noFollowupBubble = (await page.locator("text=NaLI bertanya").count()) === 0;
    record(
      "TEST 3 — Read-only enforcement",
      noComposer && noSendBtn && noSusun && noThinking && noSidebar && noFollowupBubble,
      `noComposer=${noComposer} noSend=${noSendBtn} noSusun=${noSusun} noThinking=${noThinking} noSidebar=${noSidebar} noFollowup=${noFollowupBubble}`,
    );
  } catch (e) {
    await page.screenshot({ path: join(SHOTS, "test2-public.png"), fullPage: true }).catch(() => {});
    record("TEST 2 — Public read (logged out)", false, `error: ${e.message}`);
    record("TEST 3 — Read-only enforcement", false, "blocked by TEST 2 failure");
  } finally {
    await ctx.close();
  }
}

async function test4_enumeration(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  try {
    const resp = await page.goto(`${BASE}/r/zzz-not-a-real-share-id-99999`, { waitUntil: "networkidle" });
    const status = resp?.status();
    const txt = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    await page.screenshot({ path: join(SHOTS, "test4-404.png"), fullPage: true });
    const is404 = /Laporan tidak ditemukan/i.test(txt);
    const noLeak = !/Palantir Confidence Score|Bukti & Klaim/i.test(txt);
    record(
      "TEST 4 — Enumeration / 404",
      is404 && noLeak,
      `status=${status} notFoundShown=${is404} noReportLeak=${noLeak}`,
    );
  } catch (e) {
    await page.screenshot({ path: join(SHOTS, "test4-404.png"), fullPage: true }).catch(() => {});
    record("TEST 4 — Enumeration / 404", false, `error: ${e.message}`);
  } finally {
    await ctx.close();
  }
}

async function test5_pii(browser, shareId, testUserId) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
  const page = await ctx.newPage();
  const restBodies = [];
  page.on("response", async (r) => {
    if (r.url().includes("/rest/v1/") || r.url().includes("/auth/v1/")) {
      try {
        restBodies.push(await r.text());
      } catch {
        /* ignore */
      }
    }
  });
  try {
    await page.goto(`${BASE}/r/${shareId}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    // Raw server HTML (the page fetches server-side).
    const htmlResp = await ctx.request.get(`${BASE}/r/${shareId}`);
    const html = await htmlResp.text();
    const haystack = html + "\n" + restBodies.join("\n");
    const leaksEmail = haystack.includes(EMAIL);
    const leaksUserId = testUserId ? haystack.includes(testUserId) : false;
    const leaksUserIdField = /"user_id"\s*:/.test(haystack);
    record(
      "TEST 5 — No PII leak",
      !leaksEmail && !leaksUserId && !leaksUserIdField,
      `email=${leaksEmail} userId=${leaksUserId} userIdField=${leaksUserIdField} (scanned ${html.length} html + ${restBodies.length} api bodies)`,
    );
  } catch (e) {
    record("TEST 5 — No PII leak", false, `error: ${e.message}`);
  } finally {
    await ctx.close();
  }
}

async function test6_publicExport(browser, shareId) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1600 }, acceptDownloads: true });
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}/r/${shareId}`, { waitUntil: "networkidle" });
    await page.waitForSelector('button:has-text("Unduh PDF")', { timeout: 20000 });

    const results6 = {};
    for (const [label, sel] of [
      ["pdf", 'button:has-text("Unduh PDF")'],
      ["docx", 'button:has-text("Unduh DOCX")'],
    ]) {
      const dlPromise = page.waitForEvent("download", { timeout: 90000 });
      await page.locator(sel).click();
      const dl = await dlPromise;
      const path = await dl.path();
      const fs = await import("node:fs");
      const size = path ? fs.statSync(path).size : 0;
      results6[label] = size;
    }
    await page.screenshot({ path: join(SHOTS, "test6-export.png"), fullPage: true });
    const pdfOk = results6.pdf > 1000;
    const docxOk = results6.docx > 1000;
    record("TEST 6 — Public export works", pdfOk && docxOk, `pdfBytes=${results6.pdf} docxBytes=${results6.docx}`);
  } catch (e) {
    await page.screenshot({ path: join(SHOTS, "test6-export.png"), fullPage: true }).catch(() => {});
    record("TEST 6 — Public export works", false, `error: ${e.message}`);
  } finally {
    await ctx.close();
  }
}

(async () => {
  const testUserId = process.env.SMOKE_USER_ID || "";
  const browser = await chromium.launch();
  try {
    const shareUrl = await test1_generateAndShare(browser);
    const shareId = shareIdFromUrl(shareUrl);
    if (!shareId) {
      console.log("No shareId from TEST 1 — cannot run public tests.");
    } else {
      console.log("shareId =", shareId);
      await test2and3_publicRead(browser, shareId);
      await test5_pii(browser, shareId, testUserId);
      await test6_publicExport(browser, shareId);
    }
    await test4_enumeration(browser);
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
