#!/usr/bin/env node
/**
 * Builds real, license-verified covers for Jurnal publication records.
 * For each publication it looks up the journal/publication on Wikidata, reads its
 * logo (P154) or image (P18), verifies the Commons license (public domain / CC0 /
 * CC BY / CC BY-SA only), and downloads a rendered copy. When no license-clear
 * real cover exists, it writes a documented bibliographic source-card fallback
 * (no image) so the item still displays legally and passes validation.
 *
 * Output: public/images/jurnal-covers/<slug>.png + content/jurnal/pub-covers.json
 * Usage: node scripts/build-publication-covers.mjs [--only=slug,slug]
 */
import fs from "node:fs";
import path from "node:path";
import { loadPublications } from "./load-publications.mjs";

const ROOT = process.cwd();
const OUT_IMG = path.join(ROOT, "public", "images", "jurnal-covers");
const MANIFEST = path.join(ROOT, "content", "jurnal", "pub-covers.json");
const CHECKED = "2026-06-13";
const UA = "NaLI-research/0.1 (open editorial journal)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ACCEPT = [/^cc0/i, /^cc-by(-sa)?-/i, /public domain/i, /^pd-/i];
const REJECT = /all rights reserved|fair use|non-free|nonfree|noncommercial|-nc-|-nd-/i;

function licenseOk(short, code) {
  const s = `${short ?? ""} ${code ?? ""}`;
  if (REJECT.test(s)) return false;
  if (/^cc-by-nc|^cc-by-nd|-nc-|-nd-/i.test(code ?? "")) return false;
  return ACCEPT.some((re) => re.test(short ?? "") || re.test(code ?? ""));
}
function strip(html) {
  return String(html ?? "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
}
async function getJson(url) {
  for (let a = 0; a < 5; a++) {
    const r = await fetch(url, { headers: { "user-agent": UA } });
    if (r.ok) return r.json();
    if (r.status === 429 || r.status === 503) { await sleep(6000 * (a + 1)); continue; }
    throw new Error(`HTTP ${r.status}`);
  }
  throw new Error("rate-limited after retries");
}

async function wikidataImage(title) {
  const s = await getJson(
    "https://www.wikidata.org/w/api.php?format=json&action=wbsearchentities&language=en&type=item&limit=3&search=" +
      encodeURIComponent(title),
  );
  for (const hit of s.search ?? []) {
    await sleep(900);
    const e = await getJson(
      "https://www.wikidata.org/w/api.php?format=json&action=wbgetentities&props=claims&ids=" + hit.id,
    );
    const claims = e.entities?.[hit.id]?.claims ?? {};
    const img = [...(claims.P154 ?? []), ...(claims.P18 ?? [])]
      .map((c) => c.mainsnak?.datavalue?.value)
      .filter((v) => typeof v === "string")[0];
    if (img) return { file: img, qid: hit.id };
  }
  return null;
}

async function commonsCover(file) {
  const j = await getJson(
    "https://commons.wikimedia.org/w/api.php?format=json&action=query&prop=imageinfo&iiprop=extmetadata|url|mime&iiurlwidth=900&titles=" +
      encodeURIComponent("File:" + file),
  );
  const page = Object.values(j.query?.pages ?? {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata ?? {};
  const short = m.LicenseShortName?.value;
  const code = m.License?.value;
  if (!licenseOk(short, code)) return null;
  return {
    thumb: ii.thumburl ?? ii.url, // for SVG, thumburl is a rendered PNG
    pageUrl: ii.descriptionurl,
    license: strip(short),
    licenseCode: code,
    licenseUrl: m.LicenseUrl?.value,
    artist: strip(m.Artist?.value) || strip(m.Credit?.value) || "Wikimedia Commons",
  };
}

function sourceCard(pub, reason) {
  return {
    title: pub.title,
    sourceUrl: pub.sourceUrl,
    publisherOrInstitution: pub.publisherOrInstitution,
    license: "Tidak menampilkan gambar",
    displayBasis: "Cover asli tidak ditampilkan karena lisensi belum jelas",
    attribution: `${pub.publisherOrInstitution}${pub.year ? `, ${pub.year}` : ""}`,
    alt: `Kartu sumber untuk ${pub.title}`,
    caption: `${pub.title}. Cover asli tidak ditampilkan karena lisensi belum jelas.`,
    checkedAt: CHECKED,
    isRealSourceCover: false,
    fallbackReason: reason,
  };
}

async function main() {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  const pubs = await loadPublications();
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice("--only=".length).split(",") : null;
  const manifest = only && fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

  let real = 0, fb = 0;
  for (const pub of pubs) {
    if (only && !only.includes(pub.slug)) continue;
    await sleep(1500);
    let cover = null;
    try {
      const wd = await wikidataImage(pub.originalTitle ?? pub.title);
      if (wd) {
        await sleep(1200);
        const c = await commonsCover(wd.file);
        if (c) {
          const img = await fetch(c.thumb, { headers: { "user-agent": UA } });
          if (img.ok) {
            const buf = Buffer.from(await img.arrayBuffer());
            fs.writeFileSync(path.join(OUT_IMG, `${pub.slug}.png`), buf);
            const isPd = /public domain|cc0/i.test(`${c.license} ${c.licenseCode}`);
            cover = {
              title: pub.title,
              localPath: `/images/jurnal-covers/${pub.slug}.png`,
              sourceUrl: c.pageUrl,
              publisherOrInstitution: pub.publisherOrInstitution,
              creator: c.artist,
              license: c.license,
              licenseUrl: c.licenseUrl || undefined,
              displayBasis: isPd
                ? "Domain publik / CC0; logo atau visual publikasi bebas ditampilkan dengan menyebut sumber."
                : `Lisensi ${c.license}; logo atau visual publikasi ditampilkan dengan atribusi dan tautan lisensi.`,
              attribution: `${c.artist}, ${c.license}, via Wikimedia Commons`,
              alt: `Logo atau visual resmi ${pub.title}`,
              caption: `${pub.title}. Visual publikasi dari Wikimedia Commons.`,
              checkedAt: CHECKED,
              isRealSourceCover: true,
            };
          }
        }
      }
    } catch (e) {
      console.log(`WARN ${pub.slug}: ${e.message}`);
    }
    if (!cover) {
      cover = sourceCard(pub, "Tidak ditemukan logo/visual publikasi berlisensi aman di Wikidata/Wikimedia Commons.");
      fb++;
      console.log(`CARD ${pub.slug.padEnd(34)} source-card fallback`);
    } else {
      real++;
      console.log(`OK   ${pub.slug.padEnd(34)} ${cover.license}`);
    }
    manifest[pub.slug] = cover;
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nPublication covers: ${real} real, ${fb} source-card (this run).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
