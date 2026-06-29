#!/usr/bin/env node
/**
 * GBIF harvester (Lab, Step 3.2). No auth required.
 *
 * For each seed taxon: resolve the GBIF usageKey, then read occurrence facts:
 *   - last_record_year   = most recent year with >=1 occurrence (global)
 *   - total occurrences  + per-decade buckets (the silence is the signal)
 *   - recent window count (last 20 yr) for a coarse trend
 *   - Indonesia-only count (country=ID)
 *
 * Read-only against api.gbif.org. Writes content/lab-raw/gbif.json only.
 * GBIF facet=year + limit=0 gives the year histogram and total count without
 * pulling any occurrence rows.
 *
 * Usage: node scripts/lab/harvest-gbif.mjs [--max N]
 */
import { SEED_TAXA } from "./seed-taxa.mjs";
import { fetchJson, writeDump, sleep, arg, rel, MAILTO } from "./_shared.mjs";

const MAX = Number(arg("--max", "9999"));
const GBIF = "https://api.gbif.org/v1";
const NOW = new Date().getFullYear();

async function matchTaxon(sci) {
  const url = `${GBIF}/species/match?strict=false&name=${encodeURIComponent(sci)}`;
  const j = await fetchJson(url);
  if (!j || j.__error || !j.usageKey) return null;
  return {
    usageKey: j.usageKey,
    scientificName: j.scientificName || sci,
    canonicalName: j.canonicalName || sci,
    rank: (j.rank || "").toLowerCase(),
    matchType: j.matchType || "",
    confidence: j.confidence ?? null,
  };
}

async function yearHistogram(usageKey) {
  const url = `${GBIF}/occurrence/search?taxonKey=${usageKey}&limit=0&facet=year&facetLimit=2000&mailto=${MAILTO}`;
  const j = await fetchJson(url);
  if (!j || j.__error) return null;
  const yearFacet = (j.facets || []).find((f) => f.field === "YEAR");
  const counts = (yearFacet?.counts || [])
    .map((c) => ({ year: Number(c.name), count: c.count }))
    .filter((c) => Number.isFinite(c.year) && c.year > 1500 && c.year <= NOW + 1);
  return { total: j.count ?? 0, counts };
}

async function indonesiaCount(usageKey) {
  const url = `${GBIF}/occurrence/search?taxonKey=${usageKey}&country=ID&limit=0&mailto=${MAILTO}`;
  const j = await fetchJson(url);
  if (!j || j.__error) return null;
  return j.count ?? 0;
}

function distill(seed, match, hist, idCount) {
  const counts = hist?.counts || [];
  const years = counts.map((c) => c.year);
  const lastYear = years.length ? Math.max(...years) : null;
  const firstYear = years.length ? Math.min(...years) : null;
  const recentCount = counts
    .filter((c) => c.year >= NOW - 20)
    .reduce((s, c) => s + c.count, 0);
  // per-decade buckets, sorted ascending
  const byDecade = {};
  for (const c of counts) {
    const d = Math.floor(c.year / 10) * 10;
    byDecade[d] = (byDecade[d] || 0) + c.count;
  }
  const decades = Object.entries(byDecade)
    .map(([d, n]) => ({ decade: Number(d), count: n }))
    .sort((a, b) => a.decade - b.decade);

  return {
    seedSci: seed.sci,
    matched: match
      ? {
          usageKey: match.usageKey,
          scientificName: match.scientificName,
          canonicalName: match.canonicalName,
          rank: match.rank,
          matchType: match.matchType,
          confidence: match.confidence,
        }
      : null,
    totalOccurrences: hist?.total ?? 0,
    indonesiaOccurrences: idCount,
    firstRecordYear: firstYear,
    lastRecordYear: lastYear,
    gapYears: lastYear != null ? NOW - lastYear : null,
    recentCount20yr: recentCount,
    decades,
    sourceUrl: match
      ? `https://www.gbif.org/occurrence/search?taxon_key=${match.usageKey}`
      : `https://www.gbif.org/species/search?q=${encodeURIComponent(seed.sci)}`,
    retrievedAt: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  const taxa = SEED_TAXA.slice(0, MAX);
  console.log(`GBIF harvest: ${taxa.length} taxa (no auth)`);
  const out = [];
  let i = 0;
  for (const seed of taxa) {
    i++;
    const match = await matchTaxon(seed.sci);
    await sleep(200);
    let hist = null;
    let idCount = null;
    if (match) {
      hist = await yearHistogram(match.usageKey);
      await sleep(200);
      idCount = await indonesiaCount(match.usageKey);
      await sleep(200);
    }
    const rec = distill(seed, match, hist, idCount);
    out.push(rec);
    const gap = rec.gapYears != null ? `gap ${rec.gapYears}y` : "no records";
    console.log(
      `[${i}/${taxa.length}] ${seed.sci.padEnd(30)} ` +
        `${match ? `key ${match.usageKey}` : "NO MATCH"} | ` +
        `${rec.totalOccurrences} occ | last ${rec.lastRecordYear ?? "?"} | ${gap}`,
    );
  }
  const file = writeDump("gbif", out);
  console.log(`\nWrote ${rel(file)} (${out.length} taxa)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
