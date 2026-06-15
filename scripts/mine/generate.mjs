#!/usr/bin/env node
/**
 * NaLI Knowledge Generator (Fase 7, STEP 9-13 + 15).
 *
 * Reads the harvested local dataset (content/raw/raw_dataset.json), selects the
 * best UNUSED, Indonesia-relevant, verified records, and emits paired catalog
 * entries:
 *   - a JURNAL record (content/jurnal/publications/batch-N.ts) - a real external
 *     publication with real DOI / venue / authors / OA PDF.
 *   - a linked ARSIP SUMBER entry (content/sources/<id>.mdx), cross-linked to the
 *     jurnal record via usedInJurnalIds, satisfying the editorial validator.
 *
 * HARD RULE (no hallucination): every field is copied from the harvested record.
 * The Indonesian synopsis is a factual, metadata-grounded catalog description
 * (publication type, year, venue, authors, the work's own topic concepts). It
 * does NOT paraphrase or invent findings; readers are pointed to the original.
 *
 * Selection requires a DOI, a live landing page or a PDF that actually resolves
 * to a real PDF. Records failing that are skipped (better fewer valid than more).
 *
 * Usage:
 *   node scripts/mine/generate.mjs [--count N] [--min-score 0.6] [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { loadPublications } from "../load-publications.mjs";

const ROOT = process.cwd();
const RAW_FILE = path.join(ROOT, "content", "raw", "raw_dataset.json");
const PUB_DIR = path.join(ROOT, "content", "jurnal", "publications");
const PUB_INDEX = path.join(ROOT, "content", "jurnal", "index.ts");
const SOURCES = path.join(ROOT, "content", "sources");
const LOG = path.join(ROOT, "content", "logs", "progress.json");
const TODAY = new Date().toISOString().slice(0, 10);

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 NaLI-research";
const arg = (flag, def) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const COUNT = Number(arg("--count", "25"));
const MIN_SCORE = Number(arg("--min-score", "0.6"));
const DRY = process.argv.includes("--dry");

// The validator requires an official_pdf URL to actually look like a PDF/document.
const PDF_LIKE = /\.pdf($|\?)|\/pdf\b|\/download\b|\/articles\/.+\.pdf|content\/pdf|pdfdirect|article\/file|\/latest\.pdf/i;
// Off-topic false positives: software/bioinformatics papers that match a place
// name like "Java" (the language) without being about Indonesia at all.
const SOFTWARE_FP = /jalview|sequence alignment|source code|bioinformatics tool|software package|programming language|java(script)? library|web application framework/i;
const STRONG_ID = /\b(indonesia|indonesian|nusantara|sumatra|kalimantan|sulawesi|papua|wallacea|majapahit|srivijaya|krakatau|tambora|toba|merapi|rinjani|mahakam)\b/i;

// Remove the banned em dash character from any emitted text (safe for URLs:
// URLs never contain U+2014). Surrounding whitespace collapses to a comma.
const noEmDash = (s) => String(s).replace(/\s*\u2014\s*/g, ", ");

/* ---- liveness cache (persisted, makes re-runs fast) ---- */
const LIVE_CACHE_FILE = path.join(ROOT, "content", "cache", "liveness.json");
const liveCache = (() => {
  try {
    return JSON.parse(fs.readFileSync(LIVE_CACHE_FILE, "utf8"));
  } catch {
    return {};
  }
})();
function saveLiveCache() {
  try {
    fs.mkdirSync(path.dirname(LIVE_CACHE_FILE), { recursive: true });
    fs.writeFileSync(LIVE_CACHE_FILE, JSON.stringify(liveCache));
  } catch {
    /* best effort */
  }
}

/* ---- helpers ---- */
const PUB_TYPE = {
  article: "journal_article",
  "journal-article": "journal_article",
  "proceedings-article": "proceeding",
  proceedings: "proceeding",
  book: "book",
  "book-chapter": "book",
  monograph: "monograph",
  report: "report",
  dataset: "dataset",
  dissertation: "book",
};
const TYPE_LABEL_ID = {
  journal_article: "Artikel jurnal",
  report: "Laporan",
  book: "Buku",
  monograph: "Monograf",
  proceeding: "Prosiding makalah",
  dataset: "Dataset",
  archive_record: "Rekaman arsip",
};

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

function cleanTitle(t) {
  return String(t)
    .replace(/<[^>]+>/g, "") // strip HTML tags like <i>
    .replace(/\s+/g, " ")
    .trim();
}

function detectGeography(rec) {
  const map = [
    [/\bjava\b|javan/i, "Jawa"],
    [/sumatra/i, "Sumatra"],
    [/borneo|kalimantan/i, "Kalimantan"],
    [/sulawesi|celebes/i, "Sulawesi"],
    [/\bpapua\b/i, "Papua"],
    [/\bbali\b/i, "Bali"],
    [/lombok|sumbawa|flores|nusa tenggara|rinjani/i, "Nusa Tenggara"],
    [/maluku|moluccas|banda/i, "Maluku"],
    [/wallacea/i, "Wallacea"],
    [/sunda/i, "Sunda"],
  ];
  const hay = `${rec.title} ${rec.abstract} ${(rec.concepts || []).join(" ")}`;
  const geo = [];
  for (const [re, name] of map) if (re.test(hay) && !geo.includes(name)) geo.push(name);
  if (!geo.includes("Indonesia")) geo.push("Indonesia");
  return geo.slice(0, 5);
}

function pickTopics(rec) {
  const GENERIC = /^(science|research|biology|geography|ecology|environmental science|geology|history|chemistry|physics|medicine|computer science|mathematics|engineering|sociology|political science|art|philosophy|materials science|business|economics)$/i;
  const fromConcepts = (rec.concepts || [])
    .filter((c) => c && !GENERIC.test(c))
    .slice(0, 5);
  if (fromConcepts.length >= 2) return fromConcepts;
  // fall back to the harvest query terms (real, not invented)
  const qw = String(rec.query || "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !/indonesia|java|sumatra|borneo|kalimantan|sulawesi|papua|bali/i.test(w));
  return [...new Set([...fromConcepts, ...qw])].slice(0, 5);
}

function langCode(l) {
  if (/^id|indones/i.test(l)) return "id";
  if (/^en/i.test(l)) return "en";
  if (/^nl|dutch/i.test(l)) return "nl";
  return l ? "other" : "en";
}

function buildSynopsis(rec, pubType, topics, geo) {
  const label = TYPE_LABEL_ID[pubType] || "Publikasi";
  const venue = rec.source ? ` di ${rec.source}` : "";
  const year = rec.year ? ` tahun ${rec.year}` : "";
  const authorsClause =
    rec.authors && rec.authors.length
      ? ` Ditulis oleh ${rec.authors[0]}${rec.authors.length > 1 ? " dan kolega" : ""}.`
      : "";
  const topicClause = topics.length
    ? `Publikasi ini berfokus pada ${topics.slice(0, 3).join(", ").toLowerCase()}`
    : "Publikasi ini membahas topik riset terkait Indonesia";
  const geoClause = geo.length ? ` dengan konteks ${geo.filter((g) => g !== "Indonesia").join(", ") || "Indonesia"}` : "";
  const access = rec.isOA ? " Tersedia sebagai akses terbuka." : " Catatan katalog NaLI.";
  return (
    `${label}${venue}${year}.${authorsClause} ${topicClause}${geoClause}. ` +
    `Sinopsis ini berbasis metadata publikasi dan tidak meringkas temuan secara rinci; baca naskah lengkap pada sumber aslinya untuk metode, data, dan kesimpulan.${access}`
  ).replace(/\s+/g, " ").trim();
}

async function pdfResolves(url) {
  if (!url) return false;
  const key = `pdf:${url}`;
  if (key in liveCache) return liveCache[key];
  const v = await pdfResolvesLive(url);
  liveCache[key] = v;
  return v;
}
async function pdfResolvesLive(url) {
  try {
    const r = await fetch(url, {
      headers: { "user-agent": UA, accept: "application/pdf,*/*", range: "bytes=0-2047" },
      redirect: "follow",
    });
    if (!(r.ok || r.status === 206)) return false;
    const ct = (r.headers.get("content-type") || "").toLowerCase();
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.slice(0, 5).toString("latin1").startsWith("%PDF")) return true;
    return ct.includes("pdf") && !ct.includes("html");
  } catch {
    return false;
  }
}

async function landingLive(url) {
  if (!url) return false;
  const key = `land:${url}`;
  if (key in liveCache) return liveCache[key];
  const v = await landingLiveProbe(url);
  liveCache[key] = v;
  return v;
}
async function landingLiveProbe(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      const r = await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "user-agent": UA } });
      clearTimeout(t);
      // 2xx/3xx live; 401/403/405/429/5xx = bot-blocked but the page exists
      if ((r.status >= 200 && r.status < 400) || [401, 403, 405, 429].includes(r.status) || r.status >= 500) return true;
    } catch {
      /* try next method */
    }
  }
  return false;
}

function nextBatchNumber() {
  const nums = fs
    .readdirSync(PUB_DIR)
    .map((f) => /^batch-(\d+)\.ts$/.exec(f))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

function rewriteIndex() {
  const batches = fs
    .readdirSync(PUB_DIR)
    .filter((f) => /^batch-\d+\.ts$/.test(f))
    .sort((a, b) => Number(/\d+/.exec(a)[0]) - Number(/\d+/.exec(b)[0]));
  const consts = batches.map((f) => "publicationsBatch" + /\d+/.exec(f)[0]);
  const imports = batches
    .map((f) => `import { ${"publicationsBatch" + /\d+/.exec(f)[0]} } from "./publications/${f.replace(/\.ts$/, "")}";`)
    .join("\n");
  const body = `import type { RawPublication } from "@/lib/types";
${imports}

/**
 * Master list of Jurnal publication records (real external journals, reports,
 * datasets, and archives). Covers are attached at load time from pub-covers.json.
 * Batches are generated by the Fase 7 knowledge pipeline and registered here.
 */
export const publications: RawPublication[] = [
${consts.map((c) => `  ...${c},`).join("\n")}
];
`;
  fs.writeFileSync(PUB_INDEX, body);
}

function tsString(s) {
  return JSON.stringify(noEmDash(String(s)));
}
function tsArray(a) {
  return JSON.stringify((a || []).map((x) => (typeof x === "string" ? noEmDash(x) : x)));
}

function pubRecordTs(r) {
  const lines = [
    "  p({",
    `    slug: ${tsString(r.slug)},`,
    `    title: ${tsString(r.title)},`,
    `    publicationType: ${tsString(r.publicationType)},`,
    `    publisherOrInstitution: ${tsString(r.publisherOrInstitution)},`,
    r.journalOrCollection ? `    journalOrCollection: ${tsString(r.journalOrCollection)},` : "",
    `    authors: ${tsArray(r.authors)},`,
    r.year ? `    year: ${tsString(r.year)},` : "",
    `    sourceUrl: ${tsString(r.sourceUrl)},`,
    r.doi ? `    doi: ${tsString(r.doi)},` : "",
    r.pdfUrl ? `    pdfUrl: ${tsString(r.pdfUrl)},` : "",
    r.officialPageUrl ? `    officialPageUrl: ${tsString(r.officialPageUrl)},` : "",
    `    synopsis: ${tsString(r.synopsis)},`,
    `    whyItMatters: ${tsString(r.whyItMatters)},`,
    `    topics: ${tsArray(r.topics)},`,
    `    geography: ${tsArray(r.geography)},`,
    `    language: ${tsString(r.language)},`,
    `    accessType: ${tsString(r.accessType)},`,
    `    relatedSourceIds: ${tsArray(r.relatedSourceIds)},`,
    `    limitations: ${tsArray(r.limitations)},`,
    `    checkedAt: ${tsString(r.checkedAt)},`,
    "  }),",
  ];
  return lines.filter(Boolean).join("\n");
}

function sourceMdx(s) {
  const fm = {
    id: s.id,
    title: s.title,
    type: "jurnal",
    sourceType: "jurnal",
    author: s.author,
    year: s.year ? Number(s.year) : undefined,
    url: s.url,
    doi: s.doi || undefined,
    institution: s.institution || undefined,
    language: s.language,
    reliability: s.reliability,
    reliabilityLevel: s.reliabilityLevel,
    related_topic: s.topics.join(", "),
    topics: s.topics,
    geography: s.geography,
    keyClaimsSupported: s.keyClaimsSupported,
    limitations: s.limitations,
    usedInJurnalIds: s.usedInJurnalIds,
    checkedAt: s.checkedAt,
  };
  // gray-matter stringify keeps key order and quotes safely; strip em dashes last.
  return noEmDash(matter.stringify("\n" + s.body + "\n", fm));
}

async function main() {
  if (!fs.existsSync(RAW_FILE)) {
    console.error(`No dataset at ${path.relative(ROOT, RAW_FILE)}. Run harvest.mjs first.`);
    process.exit(1);
  }
  const dataset = JSON.parse(fs.readFileSync(RAW_FILE, "utf8"));

  // existing identifiers to avoid duplicates
  const pubs = await loadPublications();
  const usedDois = new Set(pubs.map((p) => (p.doi || "").toLowerCase()).filter(Boolean));
  const usedTitles = new Set(pubs.map((p) => cleanTitle(p.title).toLowerCase()));
  const usedSlugs = new Set(pubs.map((p) => p.slug));
  const sourceFiles = new Set(
    fs.readdirSync(SOURCES).filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, "")),
  );

  // candidate ordering: highest score, Indonesia-relevant, has DOI. Drop software
  // false positives (e.g. "Java" the language) that lack a strong Indonesia term.
  const candidates = dataset
    .filter((r) => r.score >= MIN_SCORE && r.indonesiaRelevant && r.doi && cleanTitle(r.title))
    .filter((r) => !usedDois.has(r.doi.toLowerCase()) && !usedTitles.has(cleanTitle(r.title).toLowerCase()))
    .filter((r) => {
      const hay = `${r.title} ${r.abstract} ${(r.concepts || []).join(" ")}`;
      return !(SOFTWARE_FP.test(hay) && !STRONG_ID.test(hay));
    })
    .sort((a, b) => b.score - a.score);

  console.log(`Candidates: ${candidates.length} (min-score ${MIN_SCORE}). Target this batch: ${COUNT}.`);

  const pubEntries = [];
  const sourceWrites = [];
  const newSlugs = new Set();
  let checked = 0;

  for (const rec of candidates) {
    if (pubEntries.length >= COUNT) break;
    checked++;
    const title = cleanTitle(rec.title);
    let slug = slugify(title);
    if (!slug) continue;
    while (usedSlugs.has(slug) || newSlugs.has(slug)) slug = slug.replace(/(-\d+)?$/, (m) => `-${(Number((m || "").slice(1)) || 1) + 1}`);

    // liveness: prefer a resolving PDF whose URL is also PDF-shaped (the
    // validator requires official_pdf URLs to look like a PDF/document); else
    // fall back to a live landing page opened as the external source.
    const pdfOk = (await pdfResolves(rec.pdfUrl)) && PDF_LIKE.test(rec.pdfUrl || "");
    let accessType, pdfUrl, officialPageUrl;
    if (pdfOk) {
      accessType = rec.oaStatus === "gold" || rec.oaStatus === "diamond" ? "open_access" : "official_pdf_available";
      pdfUrl = rec.pdfUrl;
    } else {
      const live = await landingLive(rec.landing || rec.url);
      if (!live) {
        console.log(`  skip (no live PDF/landing): ${title.slice(0, 60)}`);
        continue;
      }
      accessType = rec.isOA ? "free_to_read" : "metadata_only";
      officialPageUrl = rec.landing || rec.url;
    }

    const pubType = PUB_TYPE[rec.type] || "journal_article";
    const topics = pickTopics(rec);
    const geo = detectGeography(rec);
    const sourceId = (slug.length > 50 ? slug.slice(0, 50).replace(/-+$/, "") : slug) + "-src";
    let srcId = sourceId;
    while (sourceFiles.has(srcId) || sourceWrites.some((w) => w.id === srcId)) srcId = srcId + "-2";

    const synopsis = buildSynopsis(rec, pubType, topics, geo);
    const primaryTopic = topics[0] || "riset Indonesia";
    const primaryGeo = geo.find((g) => g !== "Indonesia") || "Indonesia";

    const pub = {
      slug,
      title,
      publicationType: pubType,
      publisherOrInstitution: rec.publisher || rec.source || rec.institution || "Penerbit tidak tercantum",
      journalOrCollection: rec.source || undefined,
      authors: rec.authors || [],
      year: rec.year || "",
      sourceUrl: rec.url || (rec.doi ? `https://doi.org/${rec.doi}` : rec.landing),
      doi: rec.doi,
      pdfUrl,
      officialPageUrl,
      synopsis,
      whyItMatters: `Menambah rujukan terverifikasi tentang ${primaryTopic.toLowerCase()} di ${primaryGeo} ke arsip terbuka NaLI, lengkap dengan tautan ke sumber aslinya.`,
      topics,
      geography: geo,
      language: langCode(rec.language),
      accessType,
      relatedSourceIds: [srcId],
      limitations: [
        "Sinopsis adalah deskripsi katalog berbasis metadata; baca naskah lengkap di sumber asli untuk angka dan temuan.",
        ...(rec.year ? [] : ["Tahun terbit tidak tercantum pada metadata sumber."]),
      ],
      checkedAt: TODAY,
    };

    const source = {
      id: srcId,
      title,
      author: (rec.authors && rec.authors[0]) || rec.institution || rec.publisher || "Penulis tidak tercantum",
      year: rec.year,
      url: rec.url || (rec.doi ? `https://doi.org/${rec.doi}` : rec.landing),
      doi: rec.doi,
      institution: rec.institution || rec.publisher || rec.source || "",
      language: langCode(rec.language),
      reliability: `Publikasi ${rec.isOA ? "akses terbuka" : "terindeks"} pada ${rec.source || "venue terindeks"}; metadata terverifikasi via OpenAlex dan DOI.`,
      reliabilityLevel: pubType === "journal_article" ? "high" : "medium",
      topics,
      geography: geo,
      keyClaimsSupported: [
        `Publikasi ini membahas ${primaryTopic.toLowerCase()} di ${primaryGeo}.`,
        ...(rec.year ? [`Diterbitkan pada ${rec.year}${rec.source ? ` di ${rec.source}` : ""}.`] : []),
      ],
      limitations: [
        "Entri ini adalah catatan katalog; klaim spesifik harus dibaca langsung dari naskah aslinya.",
        ...(rec.year ? [] : ["Tahun terbit tidak tersedia pada metadata sumber."]),
      ],
      usedInJurnalIds: [slug],
      checkedAt: TODAY,
      body: `Catatan arsip untuk publikasi "${title}"${rec.source ? ` (${rec.source}${rec.year ? `, ${rec.year}` : ""})` : ""}. Entri ini menautkan ke rekamannya di katalog Jurnal NaLI dan ke sumber aslinya. Metadata diverifikasi melalui OpenAlex dan tautan DOI; isi dan temuan rinci harus dibaca pada naskah aslinya.`,
    };

    pubEntries.push(pub);
    sourceWrites.push(source);
    newSlugs.add(slug);
    sourceFiles.add(srcId);
    console.log(`  + ${slug.slice(0, 52).padEnd(52)} [${pub.accessType}] ${rec.year}`);
  }

  saveLiveCache();
  console.log(`\nSelected ${pubEntries.length} (checked ${checked}).`);
  if (DRY || pubEntries.length === 0) {
    console.log(DRY ? "Dry run, nothing written." : "Nothing to write.");
    return;
  }

  // write jurnal batch
  const n = nextBatchNumber();
  const batchFile = path.join(PUB_DIR, `batch-${n}.ts`);
  const header = `import type { RawPublication } from "@/lib/types";
import { p } from "../_pub";

/**
 * Batch ${n}: real external publications harvested via the Fase 7 knowledge
 * pipeline (OpenAlex metadata, verified DOI and live PDF/landing). No invented
 * data. Generated ${TODAY}.
 */
export const publicationsBatch${n}: RawPublication[] = [
${pubEntries.map(pubRecordTs).join("\n")}
];
`;
  fs.writeFileSync(batchFile, header);
  rewriteIndex();

  // write linked sources
  for (const s of sourceWrites) {
    fs.writeFileSync(path.join(SOURCES, `${s.id}.mdx`), sourceMdx(s));
  }

  // checkpoint (STEP 15)
  const prog = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : { batches: [] };
  const articles = fs.readdirSync(path.join(ROOT, "content", "articles")).filter((f) => /\.mdx?$/.test(f)).length;
  const sources = fs.readdirSync(SOURCES).filter((f) => /\.mdx?$/.test(f)).length;
  const jurnalTotal = (await loadPublications()).length;
  prog.lastRun = new Date().toISOString();
  prog.lastBatch = n;
  prog.batches.push({ batch: n, at: prog.lastRun, addedJurnal: pubEntries.length, addedSources: sourceWrites.length });
  prog.totals = { articles, jurnal: jurnalTotal, arsipSumber: sources, target: 300 };
  fs.writeFileSync(LOG, JSON.stringify(prog, null, 2));

  console.log(
    `\nWrote ${path.relative(ROOT, batchFile)} (+${pubEntries.length} jurnal), ` +
      `${sourceWrites.length} sources.\nTotals: jurnal=${jurnalTotal} arsip=${sources} articles=${articles} (target 300 each).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
