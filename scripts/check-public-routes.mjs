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
import { loadJournalEntries } from "./load-jurnal.mjs";

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
  const jurnal = await loadJournalEntries();

  const checks = [];
  for (const url of core) checks.push(check(url, 200));
  for (const a of sample(articles, 12)) checks.push(check(`/articles/${a.slug}`, 200));
  for (const s of sample(sources, 6)) checks.push(check(`/arsip-sumber/${s.slug}`, 200));
  for (const e of sample(jurnal, 12)) checks.push(check(`/jurnal/${e.slug}`, 200));
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
