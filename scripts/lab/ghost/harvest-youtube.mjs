#!/usr/bin/env node
/**
 * Ghost Signals: YouTube monitor (Lab, Step 3.5).
 *
 * The YouTube Data API requires a key (founder infra). With YOUTUBE_API_KEY it
 * searches recent "hewan aneh Indonesia"-type uploads; without it, it falls back
 * to the labeled SAMPLE entry so the dashboard shows the source type. Read-only;
 * writes only content/lab-raw/ghost-youtube.json.
 *
 * Usage: node --env-file=.env.local scripts/lab/ghost/harvest-youtube.mjs
 */
import { fetchJson, writeDump, arg, rel } from "../_shared.mjs";
import { SAMPLE_YOUTUBE } from "./seed-curated.mjs";

const MAX = Number(arg("--max", "10"));
const KEY = process.env.YOUTUBE_API_KEY || "";
const QUERIES = ["hewan aneh ditemukan indonesia", "satwa langka tertangkap kamera indonesia"];

export async function harvestYoutube(max = MAX) {
  if (!KEY) return SAMPLE_YOUTUBE.slice(0, max);
  const out = [];
  for (const q of QUERIES) {
    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10` +
      `&relevanceLanguage=id&regionCode=ID&order=date&q=${encodeURIComponent(q)}&key=${KEY}`;
    const j = await fetchJson(url);
    for (const it of j?.items || []) {
      const id = it.id?.videoId;
      if (!id) continue;
      out.push({
        source: "youtube",
        externalId: id,
        title: it.snippet?.title || `Video ${id}`,
        taxonHint: null,
        taxonRank: "tidak ada",
        url: `https://www.youtube.com/watch?v=${id}`,
        observedOn: it.snippet?.publishedAt?.slice(0, 10) || null,
        locationLabel: "Indonesia",
        summary: `Unggahan YouTube terbaru yang cocok dengan kueri pantauan "${q}".`,
        provenance: "api",
      });
      if (out.length >= max) break;
    }
    if (out.length >= max) break;
  }
  return out;
}

async function main() {
  const rows = await harvestYoutube(MAX);
  const file = writeDump("ghost-youtube", rows);
  console.log(
    `${KEY ? "YouTube Data API (key present)" : "YouTube SKIPPED (no YOUTUBE_API_KEY) -> sample"}: ` +
      `${rows.length} rows -> ${rel(file)}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
