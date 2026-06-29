#!/usr/bin/env node
/**
 * Ghost Signals: Xeno-canto monitor (Lab, Step 3.5).
 *
 * Xeno-canto API v3 requires a key (founder infra). With XENOCANTO_API_KEY it
 * queries unidentified Indonesian recordings; without it, it falls back to the
 * labeled SAMPLE entry so the dashboard still shows the source type. Read-only;
 * writes only content/lab-raw/ghost-xenocanto.json.
 *
 * Usage: node --env-file=.env.local scripts/lab/ghost/harvest-xenocanto.mjs
 */
import { fetchJson, writeDump, arg, rel } from "../_shared.mjs";
import { SAMPLE_XENOCANTO } from "./seed-curated.mjs";

const MAX = Number(arg("--max", "10"));
const KEY = process.env.XENOCANTO_API_KEY || "";

export async function harvestXenocanto(max = MAX) {
  if (!KEY) return SAMPLE_XENOCANTO.slice(0, max);
  // API v3: unidentified recordings (genus "mystery") from Indonesia.
  const url =
    `https://xeno-canto.org/api/3/recordings?query=${encodeURIComponent("cnt:indonesia grp:birds")}` +
    `&key=${KEY}`;
  const j = await fetchJson(url);
  const recs = Array.isArray(j?.recordings) ? j.recordings : [];
  const mystery = recs.filter((r) => /mystery|identity unknown/i.test(`${r.gen} ${r.en}`));
  return mystery.slice(0, max).map((r) => ({
    source: "xeno-canto",
    externalId: String(r.id),
    title: r.en || `Rekaman ${r.id}`,
    taxonHint: r.gen && r.gen.toLowerCase() !== "mystery" ? `${r.gen} ${r.sp}`.trim() : null,
    taxonRank: "tidak ada",
    url: r.url ? (r.url.startsWith("http") ? r.url : `https:${r.url}`) : `https://xeno-canto.org/${r.id}`,
    observedOn: r.date || null,
    locationLabel: r.loc || r.cnt || null,
    summary: `Rekaman Xeno-canto tak teridentifikasi dari ${r.loc || r.cnt || "Indonesia"}.`,
    provenance: "api",
  }));
}

async function main() {
  const rows = await harvestXenocanto(MAX);
  const file = writeDump("ghost-xenocanto", rows);
  console.log(
    `${KEY ? "Xeno-canto v3 (key present)" : "Xeno-canto SKIPPED (no XENOCANTO_API_KEY) -> sample"}: ` +
      `${rows.length} rows -> ${rel(file)}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
