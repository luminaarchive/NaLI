#!/usr/bin/env node
/**
 * Builds real, license-verified Jurnal covers from Wikimedia Commons / public
 * archives. For each entry it:
 *   1. finds a license-clear image (public domain / CC0 / CC BY / CC BY-SA),
 *   2. downloads it to public/images/jurnal-covers/<slug>.<ext>,
 *   3. writes a cited source record content/sources/commons-<slug>.mdx,
 *   4. records the full JurnalCover in content/jurnal/covers.json.
 *
 * Never accepts unclear / all-rights-reserved / non-commercial / no-deriv files.
 * If a query yields nothing license-clear, the entry is written as a documented
 * source_card_fallback (no image) so it can still render and pass validation.
 *
 * Usage: node scripts/build-jurnal-covers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { loadJournalEntries } from "./load-jurnal.mjs";

const ROOT = process.cwd();
const OUT_IMG = path.join(ROOT, "public", "images", "jurnal-covers");
const OUT_SRC = path.join(ROOT, "content", "sources");
const MANIFEST = path.join(ROOT, "content", "jurnal", "covers.json");
const CHECKED = "2026-06-13";
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "NaLI-by-NatIve-research/0.1 (open editorial journal)";

const ACCEPT = [/^cc0/i, /^cc-by(-sa)?-/i, /public domain/i, /^pd-/i];
const REJECT = /all rights reserved|fair use|non-free|nonfree|noncommercial|-nc-|-nd-/i;

// slug -> { query, coverKind, label }
const CONFIG = {
  "komodo-lima-pulau": { q: "Komodo dragon Varanus komodoensis", kind: "public_domain_visual", label: "Komodo (Varanus komodoensis)" },
  "badak-jawa-satu-benteng": { q: "Javan rhinoceros Rhinoceros sondaicus", kind: "museum_thumbnail", label: "Badak Jawa (Rhinoceros sondaicus)" },
  "anoa-kerbau-kerdil-sulawesi": { q: "Anoa Bubalus Sulawesi", kind: "public_domain_visual", label: "Anoa, kerbau kerdil Sulawesi" },
  "babirusa-taring-melengkung": { q: "Babyrousa babirusa Sulawesi", kind: "public_domain_visual", label: "Babirusa dengan taring melengkung" },
  "tarsius-primata-malam-mungil": { q: "Tarsius tarsier Sulawesi", kind: "archive_thumbnail", label: "Tarsius, primata malam Sulawesi" },
  "maleo-burung-pengubur-telur": { q: "Maleo Macrocephalon", kind: "archive_thumbnail", label: "Maleo (Macrocephalon maleo)" },
  "coelacanth-sulawesi-fosil-hidup": { q: "Coelacanth Latimeria specimen", kind: "museum_thumbnail", label: "Coelacanth (Latimeria), spesimen museum" },
  "orangutan-tapanuli-kera-besar-termuda": { q: "Tapanuli orangutan Sumatra", kind: "public_domain_visual", label: "Orangutan Sumatra di habitatnya" },
  "cenderawasih-bulu-dan-perdagangan": { q: "Greater bird of paradise Paradisaea apoda", kind: "archive_thumbnail", label: "Cenderawasih (burung surga)" },
  "harimau-jawa-status-punah": { q: "Javan tiger Panthera tigris sondaica", kind: "public_domain_visual", label: "Harimau Jawa (Panthera tigris sondaica)" },
  "tsunami-vulkanik-tanpa-gempa": { q: "Krakatoa eruption 1883 lithograph", kind: "archive_thumbnail", label: "Letusan Krakatau, litografi sejarah" },
  "toba-letusan-super": { q: "Lake Toba caldera ASTER satellite", kind: "official_source_preview", label: "Kaldera Toba dari citra satelit" },
  "tambora-1815-tahun-tanpa-musim-panas": { q: "Mount Tambora caldera summit", kind: "public_domain_visual", label: "Kaldera puncak Gunung Tambora" },
  "merapi-awan-panas": { q: "Mount Merapi eruption", kind: "public_domain_visual", label: "Letusan Gunung Merapi" },
  "kawah-ijen-api-biru": { q: "Ijen blue flame sulfur crater", kind: "public_domain_visual", label: "Api biru belerang di Kawah Ijen" },
  "dieng-gas-co2-senyap": { q: "Dieng plateau crater Indonesia", kind: "public_domain_visual", label: "Kompleks vulkanik Dataran Tinggi Dieng" },
  "kelud-danau-kawah-direkayasa": { q: "Kelud volcano crater lake", kind: "public_domain_visual", label: "Kawah Gunung Kelud" },
  "samalas-1257-letusan-terlupakan": { q: "Rinjani caldera Segara Anak ASTER", kind: "official_source_preview", label: "Kaldera Rinjani dan danau Segara Anak" },
  "segitiga-terumbu-karang-dunia": { q: "Coral reef Raja Ampat Indonesia", kind: "public_domain_visual", label: "Terumbu karang di Raja Ampat" },
  "pemutihan-karang-dan-suhu-laut": { q: "Coral bleaching reef", kind: "public_domain_visual", label: "Karang yang memutih" },
  "sampah-plastik-laut-indonesia": { q: "Plastic waste pollution river Indonesia", kind: "public_domain_visual", label: "Sampah plastik di perairan" },
  "mangrove-karbon-biru": { q: "Mangrove forest Indonesia roots", kind: "public_domain_visual", label: "Hutan mangrove dan akarnya" },
  "gambut-karbon-dan-api": { q: "Peat swamp forest Borneo Indonesia", kind: "public_domain_visual", label: "Lahan gambut tropis" },
  "deforestasi-dipantau-satelit": { q: "Borneo fires deforestation NASA satellite", kind: "official_source_preview", label: "Kebakaran dan hilangnya hutan dari citra satelit" },
  "jakarta-penurunan-tanah": { q: "Jakarta flooding", kind: "public_domain_visual", label: "Banjir di jalanan Jakarta" },
  "citarum-sungai-dan-pencemaran": { q: "Citarum river West Java", kind: "public_domain_visual", label: "Sungai Citarum, Jawa Barat" },

  // Batch 1a: endemic species and conservation status
  "harimau-sumatra": { q: "Sumatran tiger Panthera tigris sumatrae", kind: "public_domain_visual", label: "Harimau Sumatra (Panthera tigris sumatrae)" },
  "gajah-sumatra": { q: "Sumatran elephant Elephas maximus sumatranus", kind: "public_domain_visual", label: "Gajah Sumatra (Elephas maximus sumatranus)" },
  "badak-sumatra": { q: "Sumatran rhinoceros Dicerorhinus sumatrensis", kind: "public_domain_visual", label: "Badak Sumatra (Dicerorhinus sumatrensis)" },
  "orangutan-kalimantan": { q: "Bornean orangutan Pongo pygmaeus", kind: "public_domain_visual", label: "Orangutan Kalimantan (Pongo pygmaeus)" },
  "orangutan-sumatra": { q: "Sumatran orangutan Pongo abelii", kind: "public_domain_visual", label: "Orangutan Sumatra (Pongo abelii)" },
  "bekantan-hidung-panjang": { q: "Proboscis monkey Nasalis larvatus", kind: "public_domain_visual", label: "Bekantan (Nasalis larvatus)" },
  "owa-jawa": { q: "Javan gibbon Hylobates moloch", kind: "public_domain_visual", label: "Owa Jawa (Hylobates moloch)" },
  "siamang-kantung-suara": { q: "Siamang Symphalangus syndactylus", kind: "public_domain_visual", label: "Siamang (Symphalangus syndactylus)" },
  "beruang-madu": { q: "Sun bear Helarctos malayanus", kind: "public_domain_visual", label: "Beruang madu (Helarctos malayanus)" },
  "tapir-asia-belang": { q: "Malayan tapir Tapirus indicus", kind: "public_domain_visual", label: "Tapir Asia (Tapirus indicus)" },
  "trenggiling-sisik": { q: "Sunda pangolin Manis javanica", kind: "public_domain_visual", label: "Trenggiling Sunda (Manis javanica)" },
  "macan-tutul-jawa": { q: "Javan leopard Panthera pardus melas", kind: "public_domain_visual", label: "Macan tutul Jawa (Panthera pardus melas)" },
  "banteng-sapi-liar": { q: "Banteng Bos javanicus", kind: "public_domain_visual", label: "Banteng (Bos javanicus)" },
  "rusa-bawean": { q: "Bawean deer Axis kuhlii", kind: "public_domain_visual", label: "Rusa Bawean (Axis kuhlii)" },
  "kucing-merah-kalimantan": { q: "Bay cat Catopuma badia Borneo", kind: "public_domain_visual", label: "Kucing merah Kalimantan (Catopuma badia)" },
  "kucing-kepala-datar": { q: "Flat-headed cat Prionailurus planiceps", kind: "public_domain_visual", label: "Kucing kepala datar (Prionailurus planiceps)" },
  "macan-dahan-sunda": { q: "Sunda clouded leopard Neofelis diardi", kind: "public_domain_visual", label: "Macan dahan Sunda (Neofelis diardi)" },
  "binturong-bau-popcorn": { q: "Binturong Arctictis binturong", kind: "public_domain_visual", label: "Binturong (Arctictis binturong)" },
  "dugong-pemakan-lamun": { q: "Dugong dugon", kind: "public_domain_visual", label: "Dugong (Dugong dugon)" },
  "pesut-mahakam": { q: "Irrawaddy dolphin Orcaella brevirostris", kind: "public_domain_visual", label: "Pesut, lumba-lumba Irrawaddy (Orcaella brevirostris)" },
  "yaki-sulawesi": { q: "Celebes crested macaque Macaca nigra", kind: "public_domain_visual", label: "Yaki (Macaca nigra)" },
  "kukang-jawa": { q: "Javan slow loris Nycticebus javanicus", kind: "public_domain_visual", label: "Kukang Jawa (Nycticebus javanicus)" },
  "monyet-mentawai": { q: "Kloss gibbon Hylobates klossii", kind: "public_domain_visual", label: "Primata Mentawai (bilou, Hylobates klossii)" },
};

function licenseOk(short, code) {
  const s = `${short ?? ""} ${code ?? ""}`;
  if (REJECT.test(s)) return false;
  if (/^cc-by-nc|^cc-by-nd|-nc-|-nd-/i.test(code ?? "")) return false;
  return ACCEPT.some((re) => re.test(short ?? "") || re.test(code ?? ""));
}
function strip(html) {
  return String(html ?? "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", maxlag: "5", ...params })}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status === 503) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    throw new Error(`API ${res.status}`);
  }
  throw new Error("API 429 after retries");
}
async function findCover(query) {
  const data = await api({
    action: "query", generator: "search", gsrnamespace: "6",
    gsrsearch: `${query} filetype:bitmap`, gsrlimit: "20",
    prop: "imageinfo", iiprop: "url|extmetadata|mime|size", iiurlwidth: "1200",
  });
  const pages = Object.values(data?.query?.pages ?? {});
  const cands = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/^image\/(jpeg|png)$/.test(ii.mime ?? "")) continue;
    if ((ii.width ?? 0) < 480) continue;
    const m = ii.extmetadata ?? {};
    const short = m.LicenseShortName?.value, code = m.License?.value;
    if (!licenseOk(short, code)) continue;
    cands.push({
      title: p.title, pageUrl: ii.descriptionurl, thumb: ii.thumburl ?? ii.url, width: ii.width,
      license: strip(short), licenseCode: code, licenseUrl: m.LicenseUrl?.value,
      artist: strip(m.Artist?.value) || strip(m.Credit?.value) || "Kontributor Wikimedia Commons",
      isPd: /public domain|^pd-|^cc0/i.test(`${short} ${code}`),
    });
  }
  cands.sort((a, b) => Number(b.isPd) - Number(a.isPd) || b.width - a.width);
  return cands[0] ?? null;
}

function sourceMdx(slug, c, entry) {
  const id = `commons-${slug}`;
  const yearMatch = String(c.title).match(/\b(1[5-9]\d\d|20[0-2]\d)\b/);
  const year = yearMatch ? yearMatch[1] : null;
  const fm = {
    id, title: `Wikimedia Commons, ${strip(c.title).replace(/^File:/, "")}`,
    type: "arsip", sourceType: "arsip",
    author: c.artist, institution: "Wikimedia Commons",
    ...(year ? { year: Number(year) } : {}),
    url: c.pageUrl, language: "en",
    reliabilityLevel: "contextual",
    reliability: `Materi visual berlisensi terbuka (${c.license}) yang dipakai sebagai sampul Jurnal, dengan provenans dan lisensi tercatat.`,
    license: c.license,
    topics: entry.topics, geography: entry.geography,
    keyClaims: [`Rekaman visual untuk ${CONFIG[slug].label}, dipakai sebagai sampul entri Jurnal.`],
    keyClaimsSupported: [`Rekaman visual untuk ${CONFIG[slug].label}, dipakai sebagai sampul entri Jurnal.`],
    limitations: [
      "Materi visual berlisensi terbuka, bukan data primer; gunakan untuk ilustrasi, bukan sebagai bukti klaim.",
      "Tahun terbit visual tidak selalu tercantum; verifikasi pada halaman sumber Wikimedia Commons.",
      ...(/cc-by/i.test(c.licenseCode ?? "") ? ["Lisensi CC mewajibkan atribusi pencipta dan tautan lisensi saat ditampilkan."] : []),
    ],
    usedInJurnalIds: [slug],
    checkedAt: CHECKED,
  };
  const yaml = Object.entries(fm).map(([k, v]) => {
    if (Array.isArray(v)) return `${k}:\n${v.map((x) => `  - ${JSON.stringify(x)}`).join("\n")}`;
    if (typeof v === "number") return `${k}: ${v}`;
    return `${k}: ${JSON.stringify(String(v))}`;
  }).join("\n");
  const body = `Entri arsip ini mencatat materi visual berlisensi terbuka dari Wikimedia Commons yang dipakai NaLI sebagai sampul entri Jurnal "${CONFIG[slug].label}". Berkas asli: ${strip(c.title).replace(/^File:/, "")}, oleh ${c.artist}, lisensi ${c.license}. Halaman sumber memuat metadata lisensi lengkap dan dapat diperiksa publik.\n\nVisual ini dipakai untuk pengenalan subjek, bukan sebagai bukti klaim. Klaim dalam entri tetap bersandar pada sumber data dan literatur yang tercantum di daftar sumber entri.`;
  fs.writeFileSync(path.join(OUT_SRC, `${id}.mdx`), `---\n${yaml}\n---\n${body}\n`);
  return id;
}

function buildCover(slug, c, sourceId) {
  const cfg = CONFIG[slug];
  const isPd = /public domain|cc0/i.test(`${c.license} ${c.licenseCode}`);
  const displayBasis = isPd
    ? "Domain publik atau CC0; bebas ditampilkan, sumber tetap disebut."
    : `Lisensi ${c.license}; ditampilkan dengan atribusi pencipta dan tautan lisensi.`;
  const attribution = isPd
    ? `${c.artist}, ${c.license}, via Wikimedia Commons`
    : `${c.artist}, ${c.license}, via Wikimedia Commons`;
  return {
    id: `cover-${slug}`,
    coverKind: cfg.kind,
    title: cfg.label,
    sourceTitle: strip(c.title).replace(/^File:/, ""),
    sourceId,
    publisherOrInstitution: "Wikimedia Commons",
    creator: c.artist,
    localPath: `/images/jurnal-covers/${slug}.${c.ext}`,
    sourceUrl: c.pageUrl,
    license: c.license,
    licenseUrl: c.licenseUrl || undefined,
    displayBasis,
    attribution,
    caption: `${cfg.label}. Visual sumber terbuka yang dipakai sebagai sampul.`,
    alt: `${cfg.label}, materi visual berlisensi terbuka.`,
    checkedAt: CHECKED,
    isRealSourceCover: true,
  };
}

async function main() {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  const entries = await loadJournalEntries();
  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  // --only=slug,slug merges into the existing manifest instead of rebuilding all
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice("--only=".length).split(",") : null;
  const manifest = only && fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};
  const report = [];

  for (const [slug, cfg] of Object.entries(CONFIG)) {
    if (only && !only.includes(slug)) continue;
    const entry = bySlug.get(slug);
    if (!entry) { console.log(`SKIP ${slug}: no entry`); continue; }
    await sleep(2500); // be gentle with the Commons API
    let c;
    try { c = await findCover(cfg.q); } catch (e) { c = null; console.log(`ERR ${slug}: ${e.message}`); }

    if (!c) {
      // documented source-card fallback (no safe image found)
      const sid = entry.sourceIds[0];
      manifest[slug] = {
        id: `cover-${slug}`, coverKind: "source_card_fallback", title: cfg.label,
        sourceTitle: cfg.label, sourceId: sid, publisherOrInstitution: "Arsip Sumber NaLI",
        sourceUrl: `https://nalijournal.vercel.app/arsip-sumber/${sid}`,
        license: "Tidak menampilkan gambar", displayBasis: "Cover asli tidak ditampilkan karena lisensi belum jelas",
        attribution: "Kartu sumber NaLI", caption: "Cover asli tidak ditampilkan karena lisensi belum jelas.",
        alt: `Kartu sumber untuk ${cfg.label}`, checkedAt: CHECKED, isRealSourceCover: false,
        fallbackReason: "Tidak ditemukan gambar berlisensi aman untuk subjek ini saat pencarian.",
      };
      report.push({ slug, kind: "source_card_fallback", real: false });
      continue;
    }

    c.ext = c.thumb.toLowerCase().includes(".png") ? "png" : "jpg";
    const img = await fetch(c.thumb, { headers: { "user-agent": UA } });
    const buf = Buffer.from(await img.arrayBuffer());
    fs.writeFileSync(path.join(OUT_IMG, `${slug}.${c.ext}`), buf);

    const sourceId = sourceMdx(slug, c, entry);
    manifest[slug] = buildCover(slug, c, sourceId);
    report.push({ slug, kind: cfg.kind, real: true, license: c.license, file: c.title, bytes: buf.length });
    console.log(`OK ${slug.padEnd(40)} ${cfg.kind.padEnd(24)} ${c.license}`);
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  const real = report.filter((r) => r.real).length;
  console.log(`\nCovers built: ${real}/${report.length} real, ${report.length - real} fallback.`);
  fs.writeFileSync(path.join(ROOT, "docs", "_jurnal_cover_build.json"), JSON.stringify(report, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
