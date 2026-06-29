/**
 * Curated/sample fallback ghost signals for the key-gated sources (Lab 3.5).
 *
 * Xeno-canto API v3 and the YouTube Data API both require keys (founder infra).
 * Without them, these illustrative SAMPLE entries let the /lab/signals dashboard
 * show every source type. They are tagged provenance "sample" and titled CONTOH
 * everywhere they surface, with valid search/explore URLs (not fabricated
 * specific findings). The live harvesters override them the moment a key is set.
 */

/** @type {Array<object>} */
export const SAMPLE_XENOCANTO = [
  {
    source: "xeno-canto",
    externalId: "sample-xc-1",
    title: "CONTOH: rekaman burung tak teridentifikasi (Xeno-canto)",
    taxonHint: null,
    taxonRank: "tidak ada",
    url: "https://xeno-canto.org/explore?query=cnt%3Aindonesia",
    observedOn: null,
    locationLabel: "Indonesia",
    summary:
      "Contoh kartu sinyal Xeno-canto. Pantauan live rekaman tak teridentifikasi " +
      "membutuhkan XENOCANTO_API_KEY (API v3).",
    provenance: "sample",
  },
];

/** @type {Array<object>} */
export const SAMPLE_YOUTUBE = [
  {
    source: "youtube",
    externalId: "sample-yt-1",
    title: "CONTOH: video satwa tak dikenal (YouTube)",
    taxonHint: null,
    taxonRank: "tidak ada",
    url: "https://www.youtube.com/results?search_query=hewan+aneh+indonesia",
    observedOn: null,
    locationLabel: "Indonesia",
    summary:
      "Contoh kartu sinyal YouTube. Pantauan live klip satwa tak dikenal " +
      "membutuhkan YOUTUBE_API_KEY (YouTube Data API v3).",
    provenance: "sample",
  },
];
