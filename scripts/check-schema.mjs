#!/usr/bin/env node
/**
 * check:schema, structural + enum enforcement on article frontmatter.
 *
 * Doctrine v2.1, Phase 1/2: make TypeScript-grade rules executable in CI.
 * This mirrors lib/schema/article.ts (validateArticleFrontmatter) exactly so the
 * gate and the app never drift. Network-free. Exit 1 on any error.
 *
 * Rules ERROR: title, slug, category enum, status enum, confidence enum, valid
 * date, non-empty sources (each with a title), non-empty claimLedger (each with
 * claim text + valid status), claim [n] pointers within range, firstPartyFieldwork
 * not true.
 * Rules WARN: missing/non-https source url, unresolved sourceIds, claims with no
 * [n] pointer, non-ISO updated.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const ARTICLES = path.join(ROOT, "content", "articles");
const SOURCES = path.join(ROOT, "content", "sources");

const CATEGORIES = ["alam", "sejarah", "investigasi", "catatan-lapangan"];
const CONFIDENCE_LEVELS = ["high", "medium", "low", "needs-verification"];
const CLAIM_STATUSES = [
  "terverifikasi kuat",
  "didukung sumber",
  "terbatas",
  "diperdebatkan",
  "belum cukup bukti",
];
const ARTICLE_STATUSES = ["draft", "published"];
const SOURCE_TYPES = ["jurnal", "arsip", "buku", "media", "laporan", "lainnya"];

const isISODate = (v) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) && !Number.isNaN(Date.parse(v));
const parsePointers = (ref) =>
  typeof ref === "string" ? [...ref.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])) : [];

function availableSourceIds() {
  const ids = new Set();
  if (!fs.existsSync(SOURCES)) return ids;
  for (const f of fs.readdirSync(SOURCES)) {
    if (!f.endsWith(".mdx")) continue;
    ids.add(f.replace(/\.mdx$/, ""));
    try {
      const { data } = matter(fs.readFileSync(path.join(SOURCES, f), "utf8"));
      if (data.id) ids.add(String(data.id));
    } catch {
      /* ignore */
    }
  }
  return ids;
}

function validate(fm, sourceIdSet) {
  const issues = [];
  const err = (field, message) => issues.push({ level: "error", field, message });
  const warn = (field, message) => issues.push({ level: "warn", field, message });

  if (!fm.title || typeof fm.title !== "string") err("title", "missing or not a string");
  if (!fm.slug || typeof fm.slug !== "string") err("slug", "missing or not a string");
  if (!CATEGORIES.includes(fm.category)) err("category", `must be one of ${CATEGORIES.join(", ")}, got ${JSON.stringify(fm.category)}`);
  if (!ARTICLE_STATUSES.includes(fm.status)) err("status", `must be one of ${ARTICLE_STATUSES.join(", ")}, got ${JSON.stringify(fm.status)}`);
  if (!CONFIDENCE_LEVELS.includes(fm.confidence)) err("confidence", `must be one of ${CONFIDENCE_LEVELS.join(", ")}, got ${JSON.stringify(fm.confidence)}`);
  if (!isISODate(fm.date)) err("date", "missing or not an ISO date (YYYY-MM-DD)");
  if (fm.updated !== undefined && !isISODate(fm.updated)) warn("updated", "present but not an ISO date");
  if (fm.firstPartyFieldwork === true) err("firstPartyFieldwork", "must be false, NaLI does no first-party fieldwork");

  const sources = Array.isArray(fm.sources) ? fm.sources : null;
  if (!sources || sources.length < 1) {
    err("sources", "must be a non-empty array");
  } else {
    sources.forEach((s, i) => {
      if (!s || typeof s.title !== "string" || !s.title.trim()) err(`sources[${i}].title`, "missing source title");
      if (s && typeof s.url === "string" && s.url && !/^https:\/\//.test(s.url)) warn(`sources[${i}].url`, "should start with https://");
      if (s && (s.url === undefined || s.url === "")) warn(`sources[${i}].url`, "no url (ok for books/offline, but prefer a traceable link)");
      if (s && s.type !== undefined && !SOURCE_TYPES.includes(s.type)) warn(`sources[${i}].type`, `unusual source type ${JSON.stringify(s.type)}`);
    });
  }

  const ledger = Array.isArray(fm.claimLedger) ? fm.claimLedger : null;
  if (!ledger || ledger.length < 1) {
    err("claimLedger", "must be a non-empty array");
  } else {
    const nSources = sources ? sources.length : 0;
    ledger.forEach((c, i) => {
      if (!c || typeof c.claim !== "string" || !c.claim.trim()) err(`claimLedger[${i}].claim`, "missing claim text");
      if (!c || !CLAIM_STATUSES.includes(c.status)) err(`claimLedger[${i}].status`, `must be one of ${CLAIM_STATUSES.join(", ")}, got ${JSON.stringify(c?.status)}`);
      const pointers = parsePointers(c?.sources);
      if (pointers.length === 0) warn(`claimLedger[${i}].sources`, "no [n] source pointer");
      else if (nSources > 0) {
        const bad = pointers.filter((p) => p < 1 || p > nSources);
        if (bad.length) err(`claimLedger[${i}].sources`, `pointer(s) ${bad.join(", ")} out of range 1..${nSources}`);
      }
    });
  }

  if (Array.isArray(fm.sourceIds)) {
    fm.sourceIds.forEach((id, i) => {
      if (!sourceIdSet.has(String(id))) warn(`sourceIds[${i}]`, `"${id}" does not resolve to a content/sources entry`);
    });
  }

  return issues;
}

function main() {
  if (!fs.existsSync(ARTICLES)) {
    console.error(`No articles directory at ${ARTICLES}`);
    process.exit(1);
  }
  const sourceIdSet = availableSourceIds();
  const files = fs.readdirSync(ARTICLES).filter((f) => f.endsWith(".mdx"));
  let errors = 0;
  let warns = 0;

  for (const f of files) {
    const full = path.join(ARTICLES, f);
    let data;
    try {
      data = matter(fs.readFileSync(full, "utf8")).data;
    } catch (e) {
      console.error(`  ERROR content/articles/${f}: cannot parse frontmatter (${e.message})`);
      errors++;
      continue;
    }
    const issues = validate(data, sourceIdSet);
    for (const it of issues) {
      const tag = it.level === "error" ? "ERROR" : "WARN ";
      console.log(`  ${tag} content/articles/${f} [${it.field}]: ${it.message}`);
      if (it.level === "error") errors++;
      else warns++;
    }
  }

  console.log(`\nchecked ${files.length} articles, ${errors} error(s), ${warns} warning(s).`);
  if (errors > 0) {
    console.error("Schema check FAILED.");
    process.exit(1);
  }
  console.log("Schema check PASS.");
}

main();
