#!/usr/bin/env node
/**
 * NaLI Knowledge Miner (Fase 7, STEP 2-8).
 *
 * Harvests REAL publication metadata from open, free, no-auth scholarly APIs
 * (OpenAlex primary; the record shape is provider-agnostic so CrossRef/DOAJ/
 * Europe PMC can be added as extra providers), normalizes it, dedupes by DOI /
 * title, scores each record 0..1, and writes the local dataset.
 *
 * HARD RULE: nothing here is invented. Every title, author, DOI, URL, venue,
 * year, and abstract comes verbatim from the provider response. Records with no
 * DOI or no title are dropped. There is no fallback that fabricates a field.
 *
 * Output:
 *   content/raw/raw_dataset.json   - every normalized record kept (deduped)
 *   content/cache/openalex/<kw>.json - per-keyword raw cache (resume-friendly)
 *
 * Usage:
 *   node scripts/mine/harvest.mjs [--max-keywords N] [--per-page N] [--reset]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "content", "raw");
const CACHE_DIR = path.join(ROOT, "content", "cache", "openalex");
const RAW_FILE = path.join(RAW_DIR, "raw_dataset.json");
const MAILTO = "ansyahridarmatrijati@gmail.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 NaLI-research";

const arg = (flag, def) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const MAX_KEYWORDS = Number(arg("--max-keywords", "9999"));
const PER_PAGE = Math.min(Number(arg("--per-page", "50")), 200);
const RESET = process.argv.includes("--reset");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- keyword universe (STEP 3): base topics x regions + curated queries ---- */
const TOPICS = [
  "conservation",
  "biodiversity",
  "deforestation",
  "mangrove",
  "coral reef",
  "peatland fire",
  "volcano eruption",
  "earthquake",
  "tsunami",
  "landslide hazard",
  "climate change",
  "sea level rise",
  "land subsidence",
  "illegal logging",
  "wildlife trade",
  "endangered species",
  "marine protected area",
  "fisheries management",
  "remote sensing land use",
  "forest carbon",
  "river water quality",
  "urbanization",
  "mining environmental impact",
  "palm oil expansion",
  "seagrass blue carbon",
  "sea turtle nesting",
  "primate population",
  "bird diversity",
  "amphibian new species",
  "reptile herpetofauna",
  "bat diversity",
  "freshwater fish",
  "karst cave biodiversity",
  "agroforestry",
  "watershed hydrology",
  "drought monitoring",
  "flood risk",
  "air pollution haze",
  "plastic pollution marine",
  "groundwater depletion",
  "colonial history",
  "archaeology excavation",
  "epigraphy inscription",
  "maritime trade history",
  "manuscript philology",
  "ethnography indigenous",
  "cultural heritage conservation",
  "historical demography",
  "spice trade",
  "megalithic site",
];
const REGIONS = [
  "Indonesia",
  "Java",
  "Sumatra",
  "Borneo Kalimantan",
  "Sulawesi",
  "Papua New Guinea",
  "Bali",
  "Nusa Tenggara",
  "Maluku",
  "Sunda",
];
// curated specific queries that already proved fruitful or are high-value
const CURATED = [
  "Wallacea biogeography endemism",
  "Coral Triangle reef biodiversity",
  "Toba supereruption Sumatra",
  "Tambora 1815 eruption climate",
  "Samalas 1257 Rinjani eruption",
  "Anak Krakatau collapse tsunami",
  "Merapi pyroclastic flow",
  "Javan rhinoceros Ujung Kulon",
  "Sumatran tiger occupancy",
  "Tapanuli orangutan",
  "Komodo dragon Varanus",
  "Sunda pangolin trade",
  "dugong seagrass Indonesia",
  "maleo Macrocephalon nesting",
  "Borobudur temple archaeology",
  "Majapahit Trowulan archaeology",
  "Srivijaya maritime polity",
  "VOC Dutch East India Company trade",
  "Banda Islands nutmeg history",
  "Dieng plateau geothermal",
  "Citarum river pollution",
  "Jakarta groundwater subsidence",
  "Mahakam river dolphin",
  "Leuser ecosystem deforestation",
  "Raja Ampat reef fish",
];
// real, well-documented research areas that also read as genuine mysteries: the
// kind that pull human curiosity (lost species, deep time, vanished peoples,
// unexplained sites). Every one of these has a real scholarly literature.
const MYSTERY = [
  "Homo floresiensis Liang Bua",
  "Homo floresiensis hobbit Flores",
  "Liang Bua stone tools stratigraphy",
  "Stegodon dwarf Flores island",
  "Sulawesi cave art oldest figurative painting",
  "Maros Pangkep rock art Pleistocene",
  "Lubang Jeriji Saleh Borneo rock art",
  "Gunung Padang megalithic Cianjur",
  "Sundaland submerged continental shelf sea level",
  "Denisovan ancient DNA Island Southeast Asia",
  "Homo erectus Sangiran Java",
  "Ngandong Homo erectus Solo terrace",
  "Java Man Trinil Pithecanthropus",
  "Toba supereruption human population bottleneck",
  "Wallace line faunal boundary biogeography",
  "Latimeria coelacanth Indonesia",
  "deep sea new species Indonesia expedition",
  "Niah Cave Borneo deep skull",
  "Lapita Austronesian expansion migration",
  "megalithic statue Nias Sumba",
  "Muarajambi Buddhist temple complex",
  "Padang Lawas temple Sumatra",
  "Trowulan Majapahit urban archaeology",
  "Javan tiger Panthera extinction genetics",
  "Sumatran rhinoceros decline genetics",
  "cryptic species DNA barcoding Indonesia",
  "Flores pygmy elephant extinction",
  "ancient human migration Wallacea seafaring",
  "Punung fauna Pleistocene Java",
  "karst cave fossil Sulawesi paleontology",
];

function buildKeywords() {
  const set = new Set();
  for (const c of CURATED) set.add(c);
  for (const m of MYSTERY) set.add(m);
  for (const t of TOPICS) for (const r of REGIONS) set.add(`${t} ${r}`);
  return [...set];
}

/* ---- abstract reconstruction from OpenAlex inverted index ---- */
function reconstructAbstract(inv) {
  if (!inv) return "";
  const words = [];
  for (const [w, positions] of Object.entries(inv)) for (const pos of positions) words[pos] = w;
  return words.join(" ").replace(/\s+/g, " ").trim();
}

/* ---- Indonesia relevance heuristic ---- */
const ID_TERMS =
  /\b(indonesia|indonesian|java|javan|sumatra|sumatran|borneo|kalimantan|sulawesi|celebes|papua|west papua|bali|balinese|lombok|flores|komodo|maluku|moluccas|sunda|sundaland|wallacea|nusantara|jakarta|batavia|surabaya|aceh|makassar|mahakam|toba|krakatau|tambora|merapi|rinjani|majapahit|srivijaya|banda)\b/i;
function indonesiaRelevant(rec) {
  const hay = `${rec.title} ${rec.abstract} ${(rec.concepts || []).join(" ")} ${rec.source}`;
  return ID_TERMS.test(hay);
}

/* ---- quality score 0..1 (STEP 8) ---- */
function scoreRecord(rec) {
  let s = 0;
  if (rec.abstract && rec.abstract.length > 120) s += 0.22;
  else if (rec.abstract) s += 0.08;
  if (rec.doi) s += 0.16;
  if (rec.isOA && rec.pdfUrl) s += 0.16;
  else if (rec.isOA) s += 0.08;
  if (rec.source) s += 0.1; // named venue
  if (Array.isArray(rec.authors) && rec.authors.length > 0) s += 0.1;
  if (rec.license) s += 0.08;
  const yr = Number(rec.year);
  if (yr >= 2010) s += 0.08;
  else if (yr >= 1990) s += 0.04;
  if (Array.isArray(rec.keywords) && rec.keywords.length >= 3) s += 0.05;
  if (indonesiaRelevant(rec)) s += 0.05;
  return Math.max(0, Math.min(1, Number(s.toFixed(3))));
}

/* ---- normalize one OpenAlex work ---- */
function normalize(w, query) {
  const doi = (w.doi || "").replace(/^https?:\/\/doi\.org\//, "");
  const concepts = (w.concepts || []).map((c) => c.display_name).filter(Boolean);
  const source =
    w.primary_location?.source?.display_name ||
    w.best_oa_location?.source?.display_name ||
    "";
  const rec = {
    id: w.id,
    title: (w.title || "").replace(/\s+/g, " ").trim(),
    authors: (w.authorships || []).map((a) => a.author?.display_name).filter(Boolean).slice(0, 12),
    publisher: w.primary_location?.source?.host_organization_name || "",
    institution:
      (w.authorships || [])
        .flatMap((a) => (a.institutions || []).map((i) => i.display_name))
        .filter(Boolean)[0] || "",
    year: w.publication_year ? String(w.publication_year) : "",
    abstract: reconstructAbstract(w.abstract_inverted_index).slice(0, 1400),
    url: w.primary_location?.landing_page_url || (w.doi || ""),
    doi,
    language: w.language || "",
    keywords: concepts.slice(0, 10),
    license: w.best_oa_location?.license || w.primary_location?.license || "",
    institutionList: [],
    source,
    type: w.type || "",
    isOA: Boolean(w.open_access?.is_oa),
    oaStatus: w.open_access?.oa_status || "",
    pdfUrl: w.best_oa_location?.pdf_url || w.open_access?.oa_url || "",
    landing: w.primary_location?.landing_page_url || "",
    citedBy: w.cited_by_count ?? 0,
    concepts,
    provider: "openalex",
    query,
    retrievedAt: new Date().toISOString().slice(0, 10),
  };
  rec.score = scoreRecord(rec);
  rec.indonesiaRelevant = indonesiaRelevant(rec);
  return rec;
}

async function fetchJson(url, tries = 4) {
  let delay = 800;
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 30000);
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
      delay *= 2; // exponential backoff
    }
  }
  return null;
}

async function openalexSearch(query) {
  const cacheFile = path.join(CACHE_DIR, query.replace(/[^a-z0-9]+/gi, "_").toLowerCase() + ".json");
  if (!RESET && fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
    } catch {
      /* refetch */
    }
  }
  const filter = "has_doi:true,is_paratext:false";
  const url =
    "https://api.openalex.org/works?search=" +
    encodeURIComponent(query) +
    `&filter=${encodeURIComponent(filter)}&per_page=${PER_PAGE}` +
    "&sort=cited_by_count:desc&mailto=" +
    MAILTO;
  const json = await fetchJson(url);
  const results = json?.results || [];
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(results));
  return results;
}

function loadExisting() {
  if (RESET || !fs.existsSync(RAW_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(RAW_FILE, "utf8"));
  } catch {
    return [];
  }
}

function dedupKey(rec) {
  return rec.doi ? `doi:${rec.doi.toLowerCase()}` : `title:${rec.title.toLowerCase().slice(0, 80)}`;
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const keywords = buildKeywords().slice(0, MAX_KEYWORDS);
  console.log(`Keywords: ${keywords.length} | per-page ${PER_PAGE} | reset=${RESET}`);

  const byKey = new Map();
  for (const rec of loadExisting()) byKey.set(dedupKey(rec), rec);
  const startCount = byKey.size;

  let i = 0;
  for (const kw of keywords) {
    i++;
    const cached = !RESET && fs.existsSync(path.join(CACHE_DIR, kw.replace(/[^a-z0-9]+/gi, "_").toLowerCase() + ".json"));
    if (!cached) await sleep(150); // polite rate limit for live calls only
    let results = [];
    try {
      results = await openalexSearch(kw);
    } catch (e) {
      console.log(`[${i}/${keywords.length}] ${kw} -> ERR ${e.message}`);
      continue;
    }
    let added = 0;
    for (const w of results) {
      if (!w.title || !w.doi) continue; // STEP 7: drop empty title / missing DOI
      const rec = normalize(w, kw);
      if (!rec.title) continue;
      const key = dedupKey(rec);
      if (byKey.has(key)) {
        // keep the higher-scored / more relevant copy
        const prev = byKey.get(key);
        if (rec.score > prev.score) byKey.set(key, rec);
        continue;
      }
      byKey.set(key, rec);
      added++;
    }
    console.log(`[${i}/${keywords.length}] ${kw.padEnd(42)} +${added} (total ${byKey.size})`);
  }

  const all = [...byKey.values()].sort((a, b) => b.score - a.score);
  fs.writeFileSync(RAW_FILE, JSON.stringify(all, null, 2));

  const relevant = all.filter((r) => r.indonesiaRelevant);
  const good = all.filter((r) => r.score >= 0.6);
  const goodRel = relevant.filter((r) => r.score >= 0.6);
  console.log(
    `\nHarvest done. total=${all.length} (new this run ${byKey.size - startCount})\n` +
      `  indonesia-relevant: ${relevant.length}\n` +
      `  score>=0.6:         ${good.length}\n` +
      `  score>=0.6 + ID:    ${goodRel.length}\n` +
      `  with OA pdf:        ${all.filter((r) => r.isOA && r.pdfUrl).length}\n` +
      `Written: ${path.relative(ROOT, RAW_FILE)}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
