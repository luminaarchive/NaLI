import * as cheerio from "cheerio";

const BASE_URL = process.env.NALI_PROD_URL || process.env.NEXT_PUBLIC_APP_URL || "https://naliai.vercel.app";

console.log("=========================================");
console.log(`  NaLI Production SEO Smoke (Base: ${BASE_URL})`);
console.log("=========================================");

let failed = false;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function checkRobots() {
  const url = `${BASE_URL.replace(/\/$/, "")}/robots.txt`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      console.log(`[FAIL] robots.txt returned status ${res.status}`);
      failed = true;
      return;
    }
    const txt = await res.text();
    const hasDisallowApi = txt.includes("Disallow: /api/");
    const hasDisallowCallback = txt.includes("Disallow: /auth/callback") || txt.includes("Disallow: /auth/");
    const hasDisallowFounder = txt.includes("Disallow: /founder");
    const hasSitemap = txt.includes("Sitemap:");

    if (hasDisallowApi && hasDisallowCallback && hasDisallowFounder && hasSitemap) {
      console.log("[PASS] robots.txt contains required disallow and sitemap rules");
    } else {
      console.log("[FAIL] robots.txt missing disallow rules for API/auth/founder or Sitemap path");
      failed = true;
    }
  } catch (err) {
    console.log(`[FAIL] robots.txt fetch error: ${err.message}`);
    failed = true;
  }
}

async function checkSitemap() {
  const url = `${BASE_URL.replace(/\/$/, "")}/sitemap.xml`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      console.log(`[FAIL] sitemap.xml returned status ${res.status}`);
      failed = true;
      return;
    }
    const xml = await res.text();
    const hasPublicReport = xml.includes("/create-report");
    const hasPricing = xml.includes("/pricing");
    const hasApi = xml.includes("/api/");
    const hasCallback = xml.includes("/auth/callback");
    const hasFounder = xml.includes("/founder");
    const hasToken = xml.includes("token=");

    if (hasPublicReport && hasPricing && !hasApi && !hasCallback && !hasFounder && !hasToken) {
      console.log("[PASS] sitemap.xml maps public pages and excludes private/api/founder endpoints");
    } else {
      console.log("[FAIL] sitemap.xml fails mapping validation rules");
      if (hasApi) console.log("  - Found API endpoints in sitemap!");
      if (hasCallback) console.log("  - Found auth callback endpoints in sitemap!");
      if (hasFounder) console.log("  - Found founder page in sitemap!");
      if (hasToken) console.log("  - Found tokenized URLs in sitemap!");
      failed = true;
    }
  } catch (err) {
    console.log(`[FAIL] sitemap.xml fetch error: ${err.message}`);
    failed = true;
  }
}

async function checkPageMetadata(path) {
  const url = `${BASE_URL.replace(/\/$/, "")}${path}`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      console.log(`[FAIL] ${path} returned status ${res.status}`);
      failed = true;
      return;
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    // Title Verification
    const title = $("title").text().trim();
    const titleOk = title.length > 0;

    // Meta Description Verification
    const description = $('meta[name="description"]').attr("content") || "";
    const descOk = description.length > 0;

    // Canonical Verification
    const canonical = $('link[rel="canonical"]').attr("href") || "";
    const canonicalOk = canonical.length > 0;

    // JSON-LD Verification
    let jsonLdOk = true;
    const jsonLdElements = $('script[type="application/ld+json"]');
    if (jsonLdElements.length > 0) {
      try {
        JSON.parse(jsonLdElements.first().html() || "{}");
      } catch {
        jsonLdOk = false;
      }
    }

    if (titleOk && descOk && canonicalOk && jsonLdOk) {
      console.log(`[PASS] ${path} SEO metadata verified (Title: "${title.slice(0, 20)}...", Desc: present, Canonical: present)`);
    } else {
      console.log(`[FAIL] ${path} SEO metadata validation failed`);
      if (!titleOk) console.log("  - Title is missing!");
      if (!descOk) console.log("  - Description meta tag is missing!");
      if (!canonicalOk) console.log("  - Canonical link tag is missing!");
      if (!jsonLdOk) console.log("  - JSON-LD block is malformed!");
      failed = true;
    }
  } catch (err) {
    console.log(`[FAIL] ${path} fetch error: ${err.message}`);
    failed = true;
  }
}

async function run() {
  await checkRobots();
  await checkSitemap();
  await checkPageMetadata("/");
  await checkPageMetadata("/create-report");
  await checkPageMetadata("/pricing");
  console.log("=========================================");
  if (failed) {
    console.log("SEO Smoke Test Result: FAILED");
    console.log("=========================================");
    process.exit(1);
  } else {
    console.log("SEO Smoke Test Result: PASSED");
    console.log("=========================================");
    process.exit(0);
  }
}

run();
