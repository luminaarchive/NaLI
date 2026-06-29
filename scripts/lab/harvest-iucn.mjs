#!/usr/bin/env node
/**
 * IUCN Red List v4 harvester (Lab, Step 3.2). ENRICHMENT ONLY.
 *
 * The v4 API requires a free token (Authorization: Bearer <token>), applied for
 * at https://api.iucnredlist.org . That token is founder infra. Without
 * IUCN_API_TOKEN this script is a clean NO-OP: it logs a skip and writes an
 * empty dump, so iucn_status stays null and the GBIF + iNat signals carry the
 * lead. The instant the token is set, re-run with no code change.
 *
 * For each seed taxon: look up the latest assessment category (EX/EW/CR/.../DD)
 * and assessment year. Read-only against api.iucnredlist.org. Writes
 * content/lab-raw/iucn.json only.
 *
 * Usage: node --env-file=.env.local scripts/lab/harvest-iucn.mjs [--max N]
 */
import { SEED_TAXA } from "./seed-taxa.mjs";
import { fetchJson, writeDump, sleep, arg, rel } from "./_shared.mjs";

const MAX = Number(arg("--max", "9999"));
const IUCN = "https://api.iucnredlist.org/api/v4";
const TOKEN = process.env.IUCN_API_TOKEN || "";

/** Pick the most recent / latest assessment from a v4 taxa response. */
function latestAssessment(j) {
  const list = Array.isArray(j?.assessments) ? j.assessments : [];
  if (list.length === 0) return null;
  const latest =
    list.find((a) => a.latest === true) ||
    [...list].sort((a, b) => (b.year_published || 0) - (a.year_published || 0))[0];
  return {
    category:
      latest.red_list_category_code ||
      latest.category ||
      latest.red_list_category?.code ||
      null,
    year: latest.year_published || latest.assessment_date?.slice(0, 4) || null,
    assessmentId: latest.assessment_id || latest.id || null,
  };
}

async function lookup(seed) {
  const url =
    `${IUCN}/taxa/scientific_name?genus_name=${encodeURIComponent(seed.genus)}` +
    `&species_name=${encodeURIComponent(seed.species)}`;
  const j = await fetchJson(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!j || j.__error) return { error: j?.__error ?? "fetch-failed" };
  const a = latestAssessment(j);
  const sisId = j?.taxon?.sis_id || j?.sis_id || null;
  return {
    category: a?.category ?? null,
    assessmentYear: a?.year ?? null,
    sisId,
    sourceUrl: sisId
      ? `https://www.iucnredlist.org/species/${sisId}/0`
      : `https://www.iucnredlist.org/search?query=${encodeURIComponent(seed.sci)}`,
  };
}

async function main() {
  if (!TOKEN) {
    console.log(
      "IUCN harvest SKIPPED: IUCN_API_TOKEN not set (founder infra).\n" +
        "  GBIF + iNaturalist carry the harvest; iucn_status stays null.\n" +
        "  Request a token at https://api.iucnredlist.org , add it to .env.local,\n" +
        "  then re-run: node --env-file=.env.local scripts/lab/harvest-iucn.mjs",
    );
    writeDump("iucn", []);
    return;
  }

  const taxa = SEED_TAXA.slice(0, MAX);
  console.log(`IUCN harvest: ${taxa.length} taxa (v4, token present)`);
  const out = [];
  let i = 0;
  for (const seed of taxa) {
    i++;
    const r = await lookup(seed);
    await sleep(400);
    out.push({
      seedSci: seed.sci,
      iucnCategory: r.category ?? null,
      assessmentYear: r.assessmentYear ?? null,
      sisId: r.sisId ?? null,
      sourceUrl: r.sourceUrl ?? null,
      error: r.error ?? null,
      retrievedAt: new Date().toISOString().slice(0, 10),
    });
    console.log(
      `[${i}/${taxa.length}] ${seed.sci.padEnd(30)} ` +
        `${r.error ? `ERR ${r.error}` : `${r.category ?? "?"} (${r.assessmentYear ?? "?"})`}`,
    );
  }
  const file = writeDump("iucn", out);
  console.log(`\nWrote ${rel(file)} (${out.length} taxa)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
