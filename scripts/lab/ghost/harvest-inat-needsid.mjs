#!/usr/bin/env node
/**
 * Ghost Signals: iNaturalist "needs ID" monitor (Lab, Step 3.5). No auth.
 *
 * Pulls recent research-community "needs_id" observations in Indonesia that are
 * UNIDENTIFIED TO SPECIES (taxon rank coarser than species, or no taxon at all).
 * Those are the genuine mysteries, an observation already nailed to a species
 * is not a ghost. Read-only against api.inaturalist.org; writes only to
 * content/lab-raw/ghost-inat.json.
 *
 * A ghost signal is NOT evidence and NOT a claim. It is an anomaly worth a look.
 *
 * Usage: node scripts/lab/ghost/harvest-inat-needsid.mjs [--max N]
 */
import { fetchJson, writeDump, sleep, arg, rel } from "../_shared.mjs";

const MAX = Number(arg("--max", "20"));
const INAT = "https://api.inaturalist.org/v1";
const INDONESIA_PLACE_ID = 6966;
// Ranks that still count as "unidentified to species" (a real mystery).
const COARSE_RANKS = new Set([
  "kingdom", "phylum", "subphylum", "class", "subclass", "order", "suborder",
  "superfamily", "family", "subfamily", "tribe", "genus", "subgenus", "complex",
]);

function isMystery(o) {
  const t = o.taxon;
  if (!t || !t.name) return true; // no taxon at all = pure mystery
  const rank = (t.rank || "").toLowerCase();
  return COARSE_RANKS.has(rank); // coarser than species
}

export async function harvestInat(max = MAX) {
  const url =
    `${INAT}/observations?quality_grade=needs_id&place_id=${INDONESIA_PLACE_ID}` +
    `&iconic_taxa=Aves,Mammalia,Reptilia,Amphibia,Actinopterygii,Mollusca,Insecta` +
    `&order_by=created_at&order=desc&per_page=60`;
  const j = await fetchJson(url);
  if (!j || j.__error || !Array.isArray(j.results)) return [];
  const out = [];
  for (const o of j.results) {
    if (!isMystery(o)) continue;
    const t = o.taxon;
    const observedOn = o.observed_on || o.observed_on_details?.date || null;
    out.push({
      source: "inaturalist",
      externalId: String(o.id),
      title: t?.preferred_common_name || t?.name || "Tak teridentifikasi",
      taxonHint: t?.name || null,
      taxonRank: (t?.rank || "tidak ada").toLowerCase(),
      url: `https://www.inaturalist.org/observations/${o.id}`,
      observedOn,
      // Town/area label only (place_guess), never raw coordinates.
      locationLabel: o.place_guess || null,
      summary:
        `Observasi iNaturalist berstatus needs-ID, baru teridentifikasi sampai ` +
        `tingkat ${(t?.rank || "tidak ada").toLowerCase()}${t?.name ? ` (${t.name})` : ""}.`,
      provenance: "api",
    });
    if (out.length >= max) break;
  }
  return out;
}

async function main() {
  console.log(`iNaturalist needs-ID ghost monitor (no auth), max ${MAX}`);
  const rows = await harvestInat(MAX);
  await sleep(100);
  const file = writeDump("ghost-inat", rows);
  for (const r of rows.slice(0, 8)) {
    console.log(`  ${r.externalId.padEnd(11)} ${r.taxonRank.padEnd(10)} ${r.taxonHint ?? "-"}`);
  }
  console.log(`\nWrote ${rel(file)} (${rows.length} mystery observations)`);
}

// Run only when invoked directly (build-signals imports harvestInat).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
