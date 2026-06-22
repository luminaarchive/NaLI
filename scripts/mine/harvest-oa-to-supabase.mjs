#!/usr/bin/env node
/**
 * Pustaka Terbuka harvester (open-access library, million-scale target).
 *
 * Streams REAL open-access scholarly METADATA from OpenAlex (CC0 metadata) into
 * the Supabase `publications` table, using cursor pagination so it can run for a
 * long time and accumulate toward the 1,000,000 target across many runs.
 *
 * HARD RULES (non-negotiable, this is what keeps NaLI legal and online):
 *   1. METADATA ONLY. We never download, store, or rehost full text. We keep
 *      title/abstract/authors/venue/DOI and a LINK to the full text that is
 *      ALREADY hosted legally (the OA copy the publisher/repo serves).
 *   2. OPEN ACCESS ONLY. The OpenAlex query is filtered to is_oa:true, and any
 *      record that is not open-access is skipped before write. The DB also has a
 *      CHECK (is_oa = true) constraint as a second guard.
 *   3. NOTHING INVENTED. Every field is copied verbatim from the provider.
 *
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (service role; write access. Founder infra.)
 *
 * Usage:
 *   node scripts/mine/harvest-oa-to-supabase.mjs [--target 1000000] [--from-year 1950]
 *
 * Resumable: progress (per-year cursor) is checkpointed to
 *   content/logs/pustaka-progress.json
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, "content", "logs");
const PROGRESS = path.join(LOG_DIR, "pustaka-progress.json");
const MAILTO = "ansyahridarmatrijati@gmail.com";
const UA = "Mozilla/5.0 NaLI-research";

const arg = (flag, def) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const TARGET = Number(arg("--target", "1000000"));
const FROM_YEAR = Number(arg("--from-year", "1950"));
const PER_PAGE = 200; // OpenAlex max
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "This crawl writes to Supabase and needs the service-role key (founder infra)."
  );
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

/* ---- helpers reused from the Fase 7 miner ---- */
function reconstructAbstract(inv) {
  if (!inv) return "";
  const words = [];
  for (const [w, positions] of Object.entries(inv)) for (const pos of positions) words[pos] = w;
  return words.join(" ").replace(/\s+/g, " ").trim();
}
const ID_TERMS =
  /\b(indonesia|indonesian|java|javan|sumatra|sumatran|borneo|kalimantan|sulawesi|celebes|papua|bali|lombok|flores|komodo|maluku|moluccas|sunda|sundaland|wallacea|nusantara|jakarta|batavia|surabaya|aceh|makassar|mahakam|toba|krakatau|tambora|merapi|rinjani|majapahit|srivijaya|banda)\b/i;

function slugify(title, id) {
  const base = (title || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  const suffix = String(id || "").replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase();
  return `${base || "karya"}-${suffix}`;
}

function normalize(w) {
  const oa = w.open_access || {};
  if (!oa.is_oa) return null; // guard 2: OA only
  const doi = (w.doi || "").replace(/^https?:\/\/doi\.org\//, "");
  const title = (w.title || "").replace(/\s+/g, " ").trim();
  if (!title) return null;
  const topics = (w.concepts || []).map((c) => c.display_name).filter(Boolean).slice(0, 10);
  const venue =
    w.primary_location?.source?.display_name || w.best_oa_location?.source?.display_name || null;
  const oaUrl = w.best_oa_location?.pdf_url || oa.oa_url || null;
  const abstract = reconstructAbstract(w.abstract_inverted_index).slice(0, 1800) || null;
  const geography = [];
  const hay = `${title} ${abstract || ""} ${topics.join(" ")} ${venue || ""}`;
  const idMatch = hay.match(ID_TERMS);
  if (idMatch) geography.push(idMatch[0]);

  let relevance = 0;
  if (abstract && abstract.length > 120) relevance += 0.25;
  if (doi) relevance += 0.15;
  if (oaUrl) relevance += 0.2;
  if (venue) relevance += 0.1;
  if (ID_TERMS.test(hay)) relevance += 0.2;
  if ((w.publication_year ?? 0) >= 2010) relevance += 0.1;

  return {
    id: w.id, // OpenAlex work id, stable PK
    slug: slugify(title, w.id),
    title,
    abstract,
    authors: (w.authorships || []).map((a) => a.author?.display_name).filter(Boolean).slice(0, 12),
    year: w.publication_year ?? null,
    venue,
    doi: doi || null,
    oa_url: oaUrl,
    pdf_url: w.best_oa_location?.pdf_url || null,
    landing_url: w.primary_location?.landing_page_url || null,
    topics,
    geography,
    language: w.language || null,
    is_oa: true,
    license: w.best_oa_location?.license || oa.oa_status || null,
    provider: "openalex",
    relevance: Number(Math.min(1, relevance).toFixed(3)),
  };
}

async function fetchJson(url, tries = 5) {
  let delay = 1000;
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 45000);
      const r = await fetch(url, { headers: { "user-agent": UA }, signal: ctrl.signal });
      clearTimeout(t);
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      if (i === tries - 1) {
        console.log(`    fetch failed: ${e.message}`);
        return null;
      }
      await sleep(delay);
      delay *= 2;
    }
  }
  return null;
}

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS, "utf8"));
  } catch {
    return { written: 0, year: FROM_YEAR, cursor: "*" };
  }
}
function saveProgress(p) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(PROGRESS, JSON.stringify(p, null, 2));
}

async function currentCount() {
  const { count } = await sb
    .from("publications")
    .select("id", { count: "estimated", head: true });
  return count ?? 0;
}

/**
 * Walk every publication year from FROM_YEAR to now, paging with a cursor over
 * Indonesia-relevant open-access works. This keeps queries small enough that the
 * cursor never exceeds OpenAlex's 10k deep-paging limit, while still covering an
 * enormous corpus across the year axis.
 */
async function main() {
  const thisYear = new Date().getFullYear();
  let p = loadProgress();
  let written = p.written ?? 0;
  console.log(`Pustaka harvest -> target ${TARGET.toLocaleString()} | start at year ${p.year}, written ${written}`);

  for (let year = p.year ?? FROM_YEAR; year <= thisYear; year++) {
    let cursor = year === p.year && p.cursor ? p.cursor : "*";
    while (cursor) {
      if (written >= TARGET) {
        console.log(`Reached target ${TARGET}. Done.`);
        saveProgress({ written, year, cursor });
        return;
      }
      const filter = [
        "is_oa:true",
        "has_doi:true",
        "is_paratext:false",
        `publication_year:${year}`,
        // Indonesia-relevant geo/title net keeps the corpus on-mission.
        "title_and_abstract.search:indonesia|indonesian|java|sumatra|borneo|kalimantan|sulawesi|papua|wallacea|nusantara|sunda",
      ].join(",");
      const url =
        "https://api.openalex.org/works?" +
        `filter=${encodeURIComponent(filter)}` +
        `&per_page=${PER_PAGE}&cursor=${encodeURIComponent(cursor)}` +
        `&select=${encodeURIComponent(
          "id,doi,title,authorships,publication_year,language,abstract_inverted_index,concepts,primary_location,best_oa_location,open_access"
        )}` +
        `&mailto=${MAILTO}`;
      const json = await fetchJson(url);
      const results = json?.results || [];
      cursor = json?.meta?.next_cursor || null;
      if (results.length === 0) break;

      const rows = results.map(normalize).filter(Boolean);
      if (rows.length) {
        // De-dupe within batch by id, then upsert. Conflict on id keeps it idempotent.
        const seen = new Set();
        const unique = rows.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
        const { error } = await sb.from("publications").upsert(unique, {
          onConflict: "id",
          ignoreDuplicates: true,
        });
        if (error) {
          console.log(`    upsert error (year ${year}): ${error.message}`);
        } else {
          written += unique.length;
        }
      }
      saveProgress({ written, year, cursor: cursor || "*" });
      process.stdout.write(`\r  year ${year}  written ~${written.toLocaleString()}   `);
      await sleep(120); // be polite to OpenAlex
    }
    saveProgress({ written, year: year + 1, cursor: "*" });
    console.log(`\n  year ${year} complete. total written ~${written.toLocaleString()}`);
  }

  const real = await currentCount();
  console.log(`\nHarvest pass complete. Rows in publications: ~${real.toLocaleString()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
