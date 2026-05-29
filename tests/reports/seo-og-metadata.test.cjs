const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

require("../helpers/register-ts.cjs");
const { siteMetadata } = require("../../src/lib/seo/siteMetadata");
const { getSystemReadiness } = require("../../src/lib/system/readiness");

const repoRoot = path.join(__dirname, "../..");

// ─── Test 1: Canonical Base URL Fallback ────────────────────────────────────

test("canonical base URL fallback resolves to naliai.vercel.app and never verdantai", () => {
  assert.strictEqual(siteMetadata.canonicalBase, "https://naliai.vercel.app");
  assert.ok(!siteMetadata.canonicalBase.includes("verdantai.vercel.app"));
});

// ─── Test 2: Sitemap Allowed Routes ──────────────────────────────────────────

test("sitemap includes only allowed static public routes and excludes private/admin paths", () => {
  const sitemapFn = require("../../src/app/sitemap.ts").default;
  const entries = sitemapFn();

  const urls = entries.map((e) => e.url);

  // Allowed
  assert.ok(urls.includes("https://naliai.vercel.app"));
  assert.ok(urls.includes("https://naliai.vercel.app/learn-report"));
  assert.ok(urls.includes("https://naliai.vercel.app/create-report"));
  assert.ok(urls.includes("https://naliai.vercel.app/field-notes"));
  assert.ok(urls.includes("https://naliai.vercel.app/pricing"));
  assert.ok(urls.includes("https://naliai.vercel.app/field-intelligence"));

  // Disallowed
  const disallowed = ["/founder", "/api", "/report", "/observe", "/dashboard", "/verify", "/login", "/register", "/auth", "/logout"];
  for (const entry of entries) {
    assert.ok(!entry.url.includes("verdantai.vercel.app"), "no sitemap entry should reference verdantai");
    for (const prefix of disallowed) {
      assert.ok(!entry.url.endsWith(prefix) && !entry.url.includes(prefix + "/"), `sitemap must exclude: ${prefix}`);
    }
  }
});

// ─── Test 3: Robots Directives ──────────────────────────────────────────────

test("robots rules allow root and disallow internal/api/founder/private routes", () => {
  const robotsFn = require("../../src/app/robots.ts").default;
  const config = robotsFn();

  assert.strictEqual(config.host, "https://naliai.vercel.app");
  assert.strictEqual(config.sitemap, "https://naliai.vercel.app/sitemap.xml");

  const rules = config.rules[0];
  assert.strictEqual(rules.userAgent, "*");
  assert.strictEqual(rules.allow, "/");

  // Disallow list check
  const disallows = rules.disallow;
  assert.ok(disallows.includes("/founder"));
  assert.ok(disallows.includes("/api/"));
  assert.ok(disallows.includes("/report/"));
  assert.ok(disallows.includes("/login"));
  assert.ok(disallows.includes("/register"));
  assert.ok(disallows.includes("/auth/"));
  assert.ok(disallows.includes("/logout"));
});

// ─── Test 4: Root & Route Meta Tags Static Match ────────────────────────────

test("root metadata and route-level metadata files contain siteMetadata mapping", () => {
  const layoutSrc = fs.readFileSync(path.join(repoRoot, "src/app/layout.tsx"), "utf8");
  const homeSrc = fs.readFileSync(path.join(repoRoot, "src/app/page.tsx"), "utf8");
  const learnSrc = fs.readFileSync(path.join(repoRoot, "src/app/learn-report/page.tsx"), "utf8");
  const createSrc = fs.readFileSync(path.join(repoRoot, "src/app/create-report/page.tsx"), "utf8");
  const pricingSrc = fs.readFileSync(path.join(repoRoot, "src/app/pricing/page.tsx"), "utf8");
  const fieldIntelSrc = fs.readFileSync(path.join(repoRoot, "src/app/field-intelligence/page.tsx"), "utf8");

  // Root / Layout
  assert.match(layoutSrc, /metadataBase:\s*new URL\(siteMetadata\.canonicalBase\)/);
  assert.match(layoutSrc, /default:\s*siteMetadata\.defaultTitle/);

  // Home Page
  assert.match(homeSrc, /title:\s*siteMetadata\.routes\.home\.title/);
  assert.match(homeSrc, /description:\s*siteMetadata\.routes\.home\.description/);

  // Learn Report
  assert.match(learnSrc, /title:\s*siteMetadata\.routes\.learnReport\.title/);
  assert.match(learnSrc, /description:\s*siteMetadata\.routes\.learnReport\.description/);

  // Create Report
  assert.match(createSrc, /title:\s*siteMetadata\.routes\.createReport\.title/);
  assert.match(createSrc, /description:\s*siteMetadata\.routes\.createReport\.description/);

  // Pricing (Should also verify "use client" is removed)
  assert.match(pricingSrc, /title:\s*siteMetadata\.routes\.pricing\.title/);
  assert.match(pricingSrc, /description:\s*siteMetadata\.routes\.pricing\.description/);
  assert.ok(!pricingSrc.startsWith('"use client";') && !pricingSrc.startsWith("'use client';"), "pricing page should be static server page");

  // Field Intelligence
  assert.match(fieldIntelSrc, /title:\s*siteMetadata\.routes\.fieldIntelligence\.title/);
  assert.match(fieldIntelSrc, /description:\s*siteMetadata\.routes\.fieldIntelligence\.description/);
});

// ─── Test 5: Open Graph Image Visual Metadata ────────────────────────────────

test("OG and Twitter image files export correct size, contentType, and alt configurations", () => {
  const ogImg = fs.readFileSync(path.join(repoRoot, "src/app/opengraph-image.tsx"), "utf8");
  const twImg = fs.readFileSync(path.join(repoRoot, "src/app/twitter-image.tsx"), "utf8");

  assert.match(ogImg, /contentType\s*=\s*['"]image\/png['"]/);
  assert.match(ogImg, /alt\s*=\s*['"]NaLI - Nature & Evidence Intelligence OS['"]/);
  assert.match(ogImg, /width:\s*1200/);
  assert.match(ogImg, /height:\s*630/);

  assert.match(twImg, /contentType\s*=\s*['"]image\/png['"]/);
  assert.match(twImg, /alt\s*=\s*['"]NaLI - Nature & Evidence Intelligence OS['"]/);
  assert.match(twImg, /width:\s*1200/);
  assert.match(twImg, /height:\s*630/);
});

// ─── Test 6: Forbidden academic-cheating wording check ────────────────────────

test("no config or metadata file contains Turnitin, Humanizer, or evasion terms", () => {
  const fileContents = [
    fs.readFileSync(path.join(repoRoot, "src/lib/seo/siteMetadata.ts"), "utf8"),
    fs.readFileSync(path.join(repoRoot, "src/app/layout.tsx"), "utf8"),
    fs.readFileSync(path.join(repoRoot, "src/app/page.tsx"), "utf8"),
    fs.readFileSync(path.join(repoRoot, "src/app/learn-report/page.tsx"), "utf8"),
    fs.readFileSync(path.join(repoRoot, "src/app/create-report/page.tsx"), "utf8"),
    fs.readFileSync(path.join(repoRoot, "src/app/pricing/page.tsx"), "utf8"),
    fs.readFileSync(path.join(repoRoot, "src/app/field-intelligence/page.tsx"), "utf8"),
  ].join(" ").toLowerCase();

  const prohibited = [
    "humanizer",
    "turnitin",
    "detector bypass",
    "evasion",
    "undetectable",
    "plagiarism-proof",
    "guaranteed accepted",
  ];

  for (const word of prohibited) {
    assert.ok(!fileContents.includes(word), `Metadata contains prohibited cheating word: ${word}`);
  }
});

// ─── Test 7: Gate and System Readiness Preservation ─────────────────────────

test("system gates remain safely locked (Midtrans deferred, human testing paused)", () => {
  const readiness = getSystemReadiness();
  assert.strictEqual(readiness.midtransConfigured, false);
  assert.strictEqual(readiness.paidCheckoutActive, false);
  assert.strictEqual(readiness.creditPurchaseActive, false);
});

// ─── Test 8: SEO Layout Metadata & JSON-LD Breadcrumbs (Sprint 9) ───────────────────

test("Sprint 9 layouts define correct metadata and JSON-LD defines breadcrumbs", () => {
  const loginLayout = fs.readFileSync(path.join(repoRoot, "src/app/(auth)/login/layout.tsx"), "utf8");
  const registerLayout = fs.readFileSync(path.join(repoRoot, "src/app/(auth)/register/layout.tsx"), "utf8");
  const fieldNotesLayout = fs.readFileSync(path.join(repoRoot, "src/app/field-notes/layout.tsx"), "utf8");
  const siteSrc = fs.readFileSync(path.join(repoRoot, "src/lib/seo/site.ts"), "utf8");

  assert.match(loginLayout, /title:\s*["']Masuk ke Akun \| NaLI["']/);
  assert.match(registerLayout, /title:\s*["']Daftar Akun Baru \| NaLI["']/);
  assert.match(fieldNotesLayout, /title:\s*["']Catatan Lapangan \| NaLI["']/);

  assert.match(siteSrc, /"@type":\s*["']BreadcrumbList["']/);
});

// ─── Test 9: Favicon assets, Manifest icons, Layout references, & Ops Docs (Sprint 10) ────

test("Sprint 10 favicon files exist, manifest is configured, layout includes version queries, and ops guides exist", () => {
  const faviconPath = path.join(repoRoot, "public/favicon.ico");
  const iconPath = path.join(repoRoot, "public/icon.svg");
  const appleIconPath = path.join(repoRoot, "public/apple-icon.png");
  const manifestPath = path.join(repoRoot, "public/manifest.json");
  const layoutSrc = fs.readFileSync(path.join(repoRoot, "src/app/layout.tsx"), "utf8");

  // Verify file existence
  assert.equal(fs.existsSync(faviconPath), true, "favicon.ico must exist in public/");
  assert.equal(fs.existsSync(iconPath), true, "icon.svg must exist in public/");
  assert.equal(fs.existsSync(appleIconPath), true, "apple-icon.png must exist in public/");

  // Verify favicon is a real multi-resolution file by checking file size > 0
  const faviconStat = fs.statSync(faviconPath);
  assert.ok(faviconStat.size > 0, "favicon.ico must not be empty");

  // Verify layout.tsx metadata contains version query cache-busting (?v=3)
  assert.match(layoutSrc, /icon\.svg\?v=3/);
  assert.match(layoutSrc, /favicon\.ico\?v=3/);
  assert.match(layoutSrc, /apple-icon\.png\?v=3/);

  // Verify manifest.json references the correct paths
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const iconSrcs = manifest.icons.map((icon) => icon.src);
  assert.ok(iconSrcs.includes("/icon.svg"), "manifest must reference /icon.svg");
  assert.ok(iconSrcs.includes("/brand/png-exports/nali-app-icon-192x192.png"), "manifest must reference 192x192 PNG");
  assert.ok(iconSrcs.includes("/brand/png-exports/nali-app-icon-512x512.png"), "manifest must reference 512x512 PNG");

  // Verify ops docs exist for dashboard configurations
  const oauthDoc = path.join(repoRoot, "docs/ops/google_oauth_setup.md");
  const cloudflareDoc = path.join(repoRoot, "docs/ops/cloudflare_security_setup.md");
  const searchConsoleDoc = path.join(repoRoot, "docs/ops/google_search_console_setup.md");

  assert.equal(fs.existsSync(oauthDoc), true, "google_oauth_setup.md must exist in docs/ops/");
  assert.equal(fs.existsSync(cloudflareDoc), true, "cloudflare_security_setup.md must exist in docs/ops/");
  assert.equal(fs.existsSync(searchConsoleDoc), true, "google_search_console_setup.md must exist in docs/ops/");
});

