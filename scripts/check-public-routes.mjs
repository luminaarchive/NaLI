#!/usr/bin/env node
/**
 * Public route smoke test. Run after `npm run build` and `npm run start`.
 * Verifies core pages return 200, a sample of article / jurnal / source detail
 * routes resolve, and a bogus route returns 404.
 *
 * Usage: NALI_BASE_URL=http://localhost:3000 node scripts/check-public-routes.mjs
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { loadPublications } from "./load-publications.mjs";

const ROOT = process.cwd();
const BASE_URL = process.env.NALI_BASE_URL ?? process.env.BASE_URL ?? "http://localhost:3000";

function listSlugs(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(full, f), "utf8"));
      return { slug: data.slug ?? f.replace(/\.mdx?$/, ""), status: data.status ?? "published" };
    });
}

function sample(arr, n) {
  if (arr.length <= n) return arr;
  const step = Math.max(1, Math.floor(arr.length / n));
  const out = [];
  for (let i = 0; i < arr.length && out.length < n; i += step) out.push(arr[i]);
  return out;
}

async function check(url, expect = 200) {
  try {
    const res = await fetch(new URL(url, BASE_URL), { redirect: "manual" });
    const ok = Array.isArray(expect) ? expect.includes(res.status) : res.status === expect;
    return { url, status: res.status, ok };
  } catch (error) {
    return { url, status: `ERR ${error.message}`, ok: false };
  }
}

const EM_DASH = "\u2014";
const BANNED = /jalan yang lebih pelan|Yang dicari bukan sensasi|membahas topik dengan sumber terbuka|menjelaskan batas bukti/i;

// Jurnal detail must render a visible cover (real image or labeled source-card),
// its caption/credit + source link, the synopsis, and the download link.
async function checkJurnalDetail(entry) {
  const url = `/jurnal/${entry.slug}`;
  try {
    const res = await fetch(new URL(url, BASE_URL));
    const html = await res.text();
    const hasCoverBlock = html.includes('data-jurnal-cover="true"');
    // a real cover renders an <img> of the downloaded file (next/image URL-encodes
    // the path, so accept both encoded and plain forms); a fallback is labeled
    const hasRealImage =
      /<img/i.test(html) &&
      (html.includes(`jurnal-covers%2F${entry.slug}`) || html.includes(`jurnal-covers/${entry.slug}`));
    const hasFallbackCard =
      html.includes('data-jurnal-cover-fallback="true"') &&
      /Cover asli tidak ditampilkan karena lisensi belum jelas/i.test(html);
    const hasCredit = html.includes('data-jurnal-cover-credit="true"');
    const hasSourceLink = html.includes('data-jurnal-cover-source="true"');
    const hasSynopsis = html.includes('data-jurnal-synopsis="true"');
    const hasDownload = html.includes(`/jurnal/${entry.slug}/download.txt`);
    const coverVisible = hasCoverBlock && (hasRealImage || hasFallbackCard) && hasCredit && hasSourceLink;
    const ok = res.status === 200 && coverVisible && hasSynopsis && hasDownload;
    return {
      url,
      status: ok
        ? 200
        : `cover:${hasCoverBlock} img:${hasRealImage} fallback:${hasFallbackCard} credit:${hasCredit} srcLink:${hasSourceLink} synopsis:${hasSynopsis} download:${hasDownload} http:${res.status}`,
      ok,
    };
  } catch (error) {
    return { url, status: `ERR ${error.message}`, ok: false };
  }
}

// Download route must return a real text file with the required fields.
async function checkDownload(entry) {
  const url = `/jurnal/${entry.slug}/download.txt`;
  try {
    const res = await fetch(new URL(url, BASE_URL));
    const ct = res.headers.get("content-type") ?? "";
    const body = await res.text();
    const okType = /text\/(plain|markdown)/i.test(ct);
    const hasTitle = body.includes(entry.title);
    const hasSynopsis = body.includes("SINOPSIS");
    const hasSources = body.includes("URL SUMBER");
    const hasLimits = body.includes("BATASAN");
    const hasChecked = body.includes("DICEK");
    const hasCover = body.includes("COVER") && body.includes("Lisensi:");
    const noEm = !body.includes(EM_DASH);
    const noBanned = !BANNED.test(body);
    const ok =
      res.status === 200 && okType && hasTitle && hasSynopsis && hasSources && hasLimits && hasChecked && hasCover && noEm && noBanned;
    return {
      url,
      status: ok
        ? 200
        : `http:${res.status} type:${okType} title:${hasTitle} syn:${hasSynopsis} src:${hasSources} lim:${hasLimits} chk:${hasChecked} cover:${hasCover} noEm:${noEm} noBanned:${noBanned}`,
      ok,
    };
  } catch (error) {
    return { url, status: `ERR ${error.message}`, ok: false };
  }
}

async function main() {
  const core = [
    "/",
    "/articles",
    "/jurnal",
    "/arsip-sumber",
    "/seri",
    "/metodologi",
    "/pedoman-sumber",
    "/lisensi-foto",
    "/koreksi",
    "/tentang",
    "/kontak",
    "/alam",
    "/sejarah",
    "/investigasi",
    "/catatan-lapangan",
    "/peta-eksplorasi",
    "/sitemap.xml",
    "/robots.txt",
  ];

  const articles = listSlugs("content/articles").filter((a) => a.status === "published");
  const sources = listSlugs("content/sources");
  const jurnal = await loadPublications();

  const jurnalSample = sample(jurnal, 12);

  const checks = [];
  for (const url of core) checks.push(check(url, 200));
  for (const a of sample(articles, 12)) checks.push(check(`/articles/${a.slug}`, 200));
  for (const s of sample(sources, 6)) checks.push(check(`/arsip-sumber/${s.slug}`, 200));
  // jurnal detail pages: cover + synopsis + download link must render
  for (const e of jurnalSample) checks.push(checkJurnalDetail(e));
  // jurnal public downloads: real text file with required fields
  for (const e of jurnalSample) checks.push(checkDownload(e));
  // admin must be gated (redirect to login), never a public 200 dashboard
  checks.push(check("/admin", [302, 307, 308, 401, 403]));
  // bogus route must 404
  checks.push(check("/this-route-does-not-exist-xyz", 404));

  const results = await Promise.all(checks);
  const failures = results.filter((r) => !r.ok);

  console.log(`Route smoke: ${results.length} routes checked against ${BASE_URL}.`);
  console.log(`Route smoke: ${results.length - failures.length} passed, ${failures.length} failed.`);
  if (failures.length) {
    console.log(`\n${failures.length} failure(s):`);
    for (const f of failures) console.log(`  FAIL ${f.url} -> ${f.status}`);
    process.exit(1);
  }
  console.log("All sampled public routes behave as expected.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
