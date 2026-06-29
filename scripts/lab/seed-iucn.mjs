/**
 * Curated IUCN Red List categories for the seed taxa (Lab, Step 3.3).
 *
 * The IUCN v4 API needs a token (founder infra) and is rate-limited. So that the
 * scoring engine has threat-status data during local work, this is a small,
 * hand-entered table of REAL, publicly documented IUCN categories for our seed
 * taxa, each with a verify-link to the IUCN search. These are NOT fabricated and
 * NOT API-sourced: provenance is tagged "curated" everywhere they surface, and
 * they carry a note to re-check against the API. The instant IUCN_API_TOKEN is
 * set, harvest-iucn.mjs uses the live API instead and tags provenance "api".
 *
 * Categories reflect well-known public assessments; the exact assessment year is
 * omitted where uncertain rather than guessed.
 */

/** @type {Record<string, { category: string|null, note: string }>} */
export const CURATED_IUCN = {
  "Panthera tigris sondaica": {
    category: "EX",
    note: "Subspesies harimau Jawa dinyatakan punah (publik). Verifikasi ulang via IUCN.",
  },
  "Malacocincla perspicillata": {
    category: "DD",
    note: "Black-browed babbler, Data Deficient (publik). Verifikasi ulang via IUCN.",
  },
  "Eutrichomyias rowleyi": {
    category: "CR",
    note: "Seriwang Sangihe, Kritis (publik, BirdLife). Verifikasi ulang via IUCN.",
  },
  "Megachile pluto": {
    category: "VU",
    note: "Lebah raksasa Wallace, Rentan (publik, e.T4410A21426160). Verifikasi ulang.",
  },
  "Latimeria menadoensis": {
    category: "VU",
    note: "Coelacanth Sulawesi, Rentan (publik). Verifikasi ulang via IUCN.",
  },
  "Nepenthes pitopangii": {
    category: "VU",
    note: "Kantong semar Sulawesi, Rentan (publik, e.T49000915). Verifikasi ulang.",
  },
  "Rhinoceros sondaicus": {
    category: "CR",
    note: "Badak Jawa, Kritis (publik). Verifikasi ulang via IUCN.",
  },
  "Orcaella brevirostris": {
    category: "EN",
    note: "Pesut, Genting (publik); subpopulasi Mahakam Kritis. Verifikasi ulang.",
  },
  "Zaglossus attenboroughi": {
    category: "CR",
    note: "Echidna Attenborough, Kritis (publik). Verifikasi ulang via IUCN.",
  },
  "Cyornis ruckii": {
    category: "EN",
    note: "Sikatan Rueck, Genting (publik, BirdLife). Verifikasi ulang via IUCN.",
  },
  "Varanus zugorum": {
    category: "DD",
    note: "Biawak Zug, Data Deficient (publik). Verifikasi ulang via IUCN.",
  },
  "Gallirallus sharpei": {
    category: null,
    note: "Mandar Sharpe, taksa diperdebatkan; tidak dinilai jelas. Verifikasi ulang.",
  },
};
