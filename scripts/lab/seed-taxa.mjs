/**
 * Seed taxa for the Lab harvesters (Bucket C, Step 3.2).
 *
 * We do NOT scan all 5.4M Indonesian GBIF records blindly. The Lab's first job
 * is to keep NaLI's OWN leads fresh, so the seed is drawn from species we have
 * already researched (the Lazarus cluster + the still-lost capstone), plus a
 * short curated set of Indonesian taxa flagged as lost/threatened by sources we
 * already cite (Re:wild Search for Lost Species, IUCN). Nothing here is a claim;
 * each entry is just a name to investigate. Edit freely, no fabrication.
 *
 * `genus` + `species` feed the IUCN scientific_name lookup. `note` is internal
 * context only (never published). `endemic` flags Indonesian endemics where a
 * global last-record gap is effectively a national one.
 */

/** @typedef {{ sci: string, genus: string, species: string, common?: string, rank?: string, note?: string, endemic?: boolean }} SeedTaxon */

/** @type {SeedTaxon[]} */
export const SEED_TAXA = [
  // ---- NaLI Lazarus cluster (already published articles) ----
  {
    sci: "Panthera tigris sondaica",
    genus: "Panthera",
    species: "tigris",
    common: "Harimau Jawa",
    rank: "subspecies",
    note: "Declared extinct; 2024 Oryx hair-sample debate. NaLI: needs-verification.",
    endemic: true,
  },
  {
    sci: "Malacocincla perspicillata",
    genus: "Malacocincla",
    species: "perspicillata",
    common: "Black-browed babbler",
    rank: "species",
    note: "Rediscovered 2020 after ~172 yr (Kalsel). NaLI A4.",
    endemic: true,
  },
  {
    sci: "Eutrichomyias rowleyi",
    genus: "Eutrichomyias",
    species: "rowleyi",
    common: "Seriwang Sangihe",
    rank: "species",
    note: "Monotypic genus; rediscovered 1998 after 125 yr; CR, mining threat.",
    endemic: true,
  },
  {
    sci: "Megachile pluto",
    genus: "Megachile",
    species: "pluto",
    common: "Lebah raksasa Wallace",
    rank: "species",
    note: "World's largest bee; refound 2019 Halmahera after 38 yr.",
    endemic: true,
  },
  {
    sci: "Latimeria menadoensis",
    genus: "Latimeria",
    species: "menadoensis",
    common: "Coelacanth Sulawesi",
    rank: "species",
    note: "Indonesian coelacanth; Erdmann 1997-98 Manado. Deep-water, data-poor.",
    endemic: true,
  },
  {
    sci: "Nepenthes pitopangii",
    genus: "Nepenthes",
    species: "pitopangii",
    common: "Kantong semar Sulawesi",
    rank: "species",
    note: "Long known from a single plant; second population found 2011.",
    endemic: true,
  },
  {
    sci: "Rhinoceros sondaicus",
    genus: "Rhinoceros",
    species: "sondaicus",
    common: "Badak Jawa",
    rank: "species",
    note: "CR; Ujung Kulon only. NaLI article.",
    endemic: true,
  },
  {
    sci: "Orcaella brevirostris",
    genus: "Orcaella",
    species: "brevirostris",
    common: "Pesut Mahakam",
    rank: "species",
    note: "Mahakam population CR. NaLI article.",
  },
  {
    sci: "Zaglossus attenboroughi",
    genus: "Zaglossus",
    species: "attenboroughi",
    common: "Echidna paruh panjang Attenborough",
    rank: "species",
    note: "Refound on camera 2023 (Cyclops Mts). NaLI A3.",
    endemic: true,
  },

  // ---- Still-lost Indonesian taxa NaLI cites (capstone C3) ----
  {
    sci: "Cyornis ruckii",
    genus: "Cyornis",
    species: "ruckii",
    common: "Sikatan Rueck",
    rank: "species",
    note: "Known from few 19th/20th-c specimens; CR, possibly still lost.",
    endemic: true,
  },
  {
    sci: "Varanus zugorum",
    genus: "Varanus",
    species: "zugorum",
    common: "Biawak Zug",
    rank: "species",
    note: "Halmahera; Re:wild 25 most-wanted lost species.",
    endemic: true,
  },
  {
    sci: "Gallirallus sharpei",
    genus: "Gallirallus",
    species: "sharpei",
    common: "Mandar Sharpe",
    rank: "species",
    note: "Origin uncertain; known from a single specimen.",
  },
];
