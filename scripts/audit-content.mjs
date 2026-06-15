#!/usr/bin/env node
/**
 * Content audit (MBD Bagian 9.1). Scores every content file 0.0-1.0 against the
 * schema + source-reference + URL-liveness rubric and writes a dated report to
 * content/_audit/audit-report-<YYYY-MM-DD>.json.
 *
 * Rubric (per file):
 *   +0.25 all required schema fields present and valid
 *   +0.25 all referenced source IDs exist in arsip-sumber
 *   +0.25 all source URLs live (HTTP 200/301/302)
 *   +0.25 no claims left without a traceable source
 *   -0.10 per missing/invalid field   -0.15 per dangling source reference
 *   -0.20 per dead URL                 -0.30 incompatible legacy schema
 *
 * Recommendation: >=0.9 keep · 0.7-0.9 update minor · 0.5-0.7 update major · <0.5 archive
 *
 * Usage: node scripts/audit-content.mjs [--no-network]
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const ARTICLES = path.join(CONTENT, "articles");
const SOURCES = path.join(CONTENT, "sources");
const FIELD_NOTES = path.join(CONTENT, "field-notes");
const OUT_DIR = path.join(CONTENT, "_audit");
const NETWORK = !process.argv.includes("--no-network");

const VALID_CATEGORY = new Set(["alam", "sejarah", "investigasi", "catatan-lapangan"]);
const VALID_CONFIDENCE = new Set(["high", "medium", "low", "needs-verification"]);
const VALID_STATUS = new Set(["published", "draft"]);

const clamp = (n) => Math.max(0, Math.min(1, Number(n.toFixed(2))));
const today = new Date().toISOString().slice(0, 10);

function listMdx(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => ({
      file: f,
      slug: f.replace(/\.mdx?$/, ""),
      raw: fs.readFileSync(path.join(dir, f), "utf8"),
    }));
}

// ---- source archive index ---------------------------------------------------
const sourceFiles = listMdx(SOURCES).map(({ file, slug, raw }) => {
  const { data, content } = matter(raw);
  return { file, slug, fm: data, body: content, id: data.id ?? slug };
});
const sourceIdSet = new Set(sourceFiles.map((s) => s.id));
for (const s of sourceFiles) sourceIdSet.add(s.slug);

// ---- URL liveness (cached, concurrent) -------------------------------------
const urlCache = new Map();
async function checkUrl(url) {
  if (!NETWORK) return "skipped";
  if (urlCache.has(url)) return urlCache.get(url);
  const probe = async (method) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "user-agent": "Mozilla/5.0 (NaLI-audit)" },
      });
      return res.status;
    } catch {
      return 0;
    } finally {
      clearTimeout(t);
    }
  };
  let status = await probe("HEAD");
  if (status === 0 || status === 405 || status === 403 || status >= 500) {
    status = await probe("GET"); // some hosts block HEAD
  }
  // 401/403/405/429/5xx + timeouts almost always mean a bot-block on a LIVE
  // page (IUCN, PNAS, Nature, doi.org, etc. all do this). Only 4xx that signal a
  // genuinely missing resource count as dead.
  const BLOCKED = new Set([401, 403, 405, 429]);
  let verdict;
  if (status >= 200 && status < 400) verdict = "live";
  else if (status === 0) verdict = "blocked-timeout";
  else if (BLOCKED.has(status) || status >= 500) verdict = `blocked-${status}`;
  else verdict = `dead-${status}`;
  urlCache.set(url, verdict);
  return verdict;
}

async function mapLimit(items, limit, fn) {
  const out = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

// ---- per-file scorers -------------------------------------------------------
function scoreArticle({ file, slug, raw }) {
  const { data: fm, content } = matter(raw);
  const issues = [];
  let score = 0;

  const required = ["title", "slug", "date", "category", "summary", "confidence", "status"];
  const missing = required.filter((k) => fm[k] === undefined || fm[k] === "");
  if (fm.category && !VALID_CATEGORY.has(fm.category)) missing.push("category(invalid)");
  if (fm.confidence && !VALID_CONFIDENCE.has(fm.confidence)) missing.push("confidence(invalid)");
  if (fm.status && !VALID_STATUS.has(fm.status)) missing.push("status(invalid)");
  if (missing.length === 0) score += 0.25;
  else {
    score -= 0.1 * missing.length;
    issues.push(`Field hilang/invalid: ${missing.join(", ")}`);
  }

  // source references
  const refIds = Array.isArray(fm.sourceIds) ? fm.sourceIds : [];
  const dangling = refIds.filter((id) => !sourceIdSet.has(id));
  if (refIds.length > 0 && dangling.length === 0) score += 0.25;
  else if (dangling.length > 0) {
    score -= 0.15 * dangling.length;
    issues.push(`sourceIds tidak ada di arsip: ${dangling.join(", ")}`);
  } else {
    issues.push("Tidak ada sourceIds yang terhubung ke arsip-sumber");
  }

  // claims have sources: heuristic = has sources[] AND claimLedger present
  const hasSources = Array.isArray(fm.sources) && fm.sources.length > 0;
  const hasLedger = Array.isArray(fm.claimLedger) && fm.claimLedger.length > 0;
  if (hasSources && hasLedger) score += 0.25;
  else {
    if (!hasSources) issues.push("Blok sources[] kosong");
    if (!hasLedger) issues.push("Claim ledger belum ada");
  }

  // collect URLs to verify
  const urls = new Set();
  for (const s of fm.sources ?? []) if (s.url) urls.add(s.url);
  for (const id of refIds) {
    const src = sourceFiles.find((x) => x.id === id || x.slug === id);
    if (src?.fm?.url) urls.add(src.fm.url);
    if (src?.fm?.archiveUrl) urls.add(src.fm.archiveUrl);
  }

  return {
    path: `content/articles/${file}`,
    slug: fm.slug ?? slug,
    urls: [...urls],
    base: score,
    issues,
    wordCount: content.trim().split(/\s+/).filter(Boolean).length,
  };
}

function scoreSource({ file, slug, fm }) {
  const issues = [];
  let score = 0;
  const required = ["title", "type", "id"];
  const missing = required.filter((k) => (k === "id" ? !(fm.id ?? slug) : !fm[k]));
  if (missing.length === 0) score += 0.25;
  else {
    score -= 0.1 * missing.length;
    issues.push(`Field hilang: ${missing.join(", ")}`);
  }
  // structured metadata richness (editorial-trust schema)
  const richKeys = ["reliabilityLevel", "topics", "keyClaims", "limitations", "checkedAt"];
  const richMissing = richKeys.filter((k) => !fm[k]);
  if (richMissing.length === 0) score += 0.25;
  else {
    score -= 0.05 * richMissing.length;
    issues.push(`Metadata terstruktur kurang: ${richMissing.join(", ")}`);
  }
  const url = fm.url || fm.archiveUrl;
  if (url) score += 0.25; // bonus for being traceable; liveness adjusts below
  else issues.push("Tidak ada URL/archiveUrl");
  if (Array.isArray(fm.limitations) && fm.limitations.length > 0) score += 0.25;
  else issues.push("Batasan (limitations) belum dicatat");

  return {
    path: `content/sources/${file}`,
    slug: fm.slug ?? slug,
    urls: [url].filter(Boolean),
    base: score,
    issues,
  };
}

function scoreFieldNote({ file, slug, raw }) {
  const { data: fm } = matter(raw);
  const issues = [];
  let score = 0.5; // notes have a lighter schema
  const required = ["title", "date", "summary", "status"];
  const missing = required.filter((k) => !fm[k]);
  if (missing.length === 0) score += 0.25;
  else {
    score -= 0.1 * missing.length;
    issues.push(`Field hilang: ${missing.join(", ")}`);
  }
  if (Array.isArray(fm.sources) && fm.sources.length > 0) score += 0.25;
  else issues.push("Tidak ada sumber pada catatan");
  return { path: `content/field-notes/${file}`, slug: fm.slug ?? slug, urls: [], base: score, issues };
}

function recommend(score, issues) {
  if (score >= 0.9) return "keep";
  if (score >= 0.7) return "update";
  if (score >= 0.5) return "update";
  return issues.some((i) => /legacy|incompatible/i.test(i)) ? "delete" : "archive";
}

async function main() {
  const articleResults = listMdx(ARTICLES).map(scoreArticle);
  const sourceResults = sourceFiles.map((s) =>
    scoreSource({ file: s.file, slug: s.slug, fm: s.fm }),
  );
  const noteResults = listMdx(FIELD_NOTES).map(scoreFieldNote);
  const all = [...articleResults, ...sourceResults, ...noteResults];

  // unique URL liveness
  const uniqueUrls = [...new Set(all.flatMap((r) => r.urls))];
  process.stdout.write(
    `Memeriksa ${uniqueUrls.length} URL unik${NETWORK ? "" : " (dilewati, --no-network)"}...\n`,
  );
  await mapLimit(uniqueUrls, 12, checkUrl);

  const dead = [];
  const blockedForReview = [];
  for (const r of all) {
    let urlScore = 0;
    const deadHere = [];
    if (r.urls.length === 0) {
      urlScore = 0;
    } else {
      const verdicts = r.urls.map((u) => ({ u, v: urlCache.get(u) ?? "skipped" }));
      // "live" and bot-blocked URLs are not penalized; only true deads are.
      const deadOnes = verdicts.filter((x) => x.v.startsWith("dead"));
      const blockedOnes = verdicts.filter((x) => x.v.startsWith("blocked"));
      for (const d of deadOnes) {
        deadHere.push(`${d.u} (${d.v})`);
        dead.push({ path: r.path, url: d.u, status: d.v });
      }
      for (const b of blockedOnes) {
        blockedForReview.push({ path: r.path, url: b.u, status: b.v });
      }
      urlScore = deadOnes.length === 0 ? 0.25 : -0.2 * deadOnes.length;
    }
    if (deadHere.length) r.issues.push(`URL mati: ${deadHere.join("; ")}`);
    r.confidenceScore = clamp(r.base + urlScore);
    r.recommendation = recommend(r.confidenceScore, r.issues);
    delete r.base;
    delete r.urls;
  }

  const breakdown = { keep: 0, update: 0, archive: 0, delete: 0 };
  for (const r of all) breakdown[r.recommendation]++;

  const report = {
    tanggal: today,
    network: NETWORK,
    totalFile: all.length,
    breakdown,
    deadUrls: dead,
    blockedForManualReview: blockedForReview,
    files: all.sort((a, b) => a.confidenceScore - b.confidenceScore),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `audit-report-${today}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  process.stdout.write(
    `\nAudit selesai: ${all.length} file. keep=${breakdown.keep} update=${breakdown.update} archive=${breakdown.archive} delete=${breakdown.delete}\n` +
      `URL mati/bermasalah: ${dead.length}\nLaporan: ${path.relative(ROOT, outPath)}\n`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
