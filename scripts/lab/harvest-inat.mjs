#!/usr/bin/env node
/**
 * iNaturalist harvester (Lab, Step 3.2). No auth required (token is only for
 * writes; reads are open). Sends a real User-Agent and throttles to stay well
 * under iNat's ~60 req/min guidance.
 *
 * For each seed taxon: resolve the iNat taxon_id, then read research-grade
 * observation facts:
 *   - last research-grade observation year (global) + total research-grade count
 *   - Indonesia-only research-grade count (place_id=6966, confirmed)
 *
 * Research-grade only: community-verified observations, the closest iNat has to
 * a credible record. These are citizen sightings, NOT proof, but a recent
 * research-grade obs is exactly the kind of signal that can DEMOTE a "lost"
 * lead, which is just as useful as one that promotes it.
 *
 * Read-only against api.inaturalist.org. Writes content/lab-raw/inat.json only.
 *
 * Usage: node scripts/lab/harvest-inat.mjs [--max N]
 */
import { SEED_TAXA } from "./seed-taxa.mjs";
import { fetchJson, writeDump, sleep, arg, rel } from "./_shared.mjs";

const MAX = Number(arg("--max", "9999"));
const INAT = "https://api.inaturalist.org/v1";
const INDONESIA_PLACE_ID = 6966; // verified via places/autocomplete
const THROTTLE = 1200; // ms between calls: comfortably under 60/min

async function matchTaxon(sci) {
  const url = `${INAT}/taxa/autocomplete?q=${encodeURIComponent(sci)}&per_page=5`;
  const j = await fetchJson(url);
  if (!j || j.__error || !Array.isArray(j.results) || j.results.length === 0) return null;
  const lc = sci.toLowerCase();
  // Require an EXACT scientific-name hit. A fuzzy top-result match can silently
  // attach an unrelated taxon's observations (e.g. a dubious lost species
  // falling through to a common congener), which would wrongly demote a real
  // lead. For a heuristic feeding human review, "no match" is the honest answer.
  const exact = j.results.find((r) => (r.name || "").toLowerCase() === lc);
  if (!exact) return null;
  return { id: exact.id, name: exact.name, rank: exact.rank, matched: true };
}

async function recentResearchObs(taxonId, { placeId } = {}) {
  let url =
    `${INAT}/observations?taxon_id=${taxonId}&quality_grade=research` +
    `&order_by=observed_on&order=desc&per_page=1`;
  if (placeId) url += `&place_id=${placeId}`;
  const j = await fetchJson(url);
  if (!j || j.__error) return null;
  const top = (j.results || [])[0];
  const observedOn = top?.observed_on || top?.observed_on_details?.date || null;
  const year = observedOn ? Number(String(observedOn).slice(0, 4)) : null;
  return {
    total: j.total_results ?? 0,
    lastObservedOn: observedOn,
    lastYear: Number.isFinite(year) ? year : null,
  };
}

function distill(seed, match, global_, indo) {
  return {
    seedSci: seed.sci,
    matched: match ? { id: match.id, name: match.name, rank: match.rank, exact: match.matched } : null,
    researchGradeTotal: global_?.total ?? 0,
    lastResearchObservedOn: global_?.lastObservedOn ?? null,
    lastResearchYear: global_?.lastYear ?? null,
    indonesiaResearchGradeTotal: indo?.total ?? 0,
    indonesiaLastResearchYear: indo?.lastYear ?? null,
    sourceUrl: match
      ? `https://www.inaturalist.org/observations?taxon_id=${match.id}&quality_grade=research`
      : `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(seed.sci)}`,
    retrievedAt: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  const taxa = SEED_TAXA.slice(0, MAX);
  console.log(`iNaturalist harvest: ${taxa.length} taxa (no auth, throttled)`);
  const out = [];
  let i = 0;
  for (const seed of taxa) {
    i++;
    const match = await matchTaxon(seed.sci);
    await sleep(THROTTLE);
    let global_ = null;
    let indo = null;
    if (match) {
      global_ = await recentResearchObs(match.id);
      await sleep(THROTTLE);
      indo = await recentResearchObs(match.id, { placeId: INDONESIA_PLACE_ID });
      await sleep(THROTTLE);
    }
    const rec = distill(seed, match, global_, indo);
    out.push(rec);
    console.log(
      `[${i}/${taxa.length}] ${seed.sci.padEnd(30)} ` +
        `${match ? `id ${match.id}` : "NO MATCH"} | ` +
        `${rec.researchGradeTotal} RG obs | last ${rec.lastResearchYear ?? "?"} | ` +
        `ID ${rec.indonesiaResearchGradeTotal}`,
    );
  }
  const file = writeDump("inat", out);
  console.log(`\nWrote ${rel(file)} (${out.length} taxa)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
