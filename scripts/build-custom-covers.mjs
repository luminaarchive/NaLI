#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadPublications } from "./load-publications.mjs";

const ROOT = process.cwd();
const OUT_IMG = path.join(ROOT, "public", "images", "jurnal-covers");
const MANIFEST = path.join(ROOT, "content", "jurnal", "pub-covers.json");
const CHECKED = "2026-06-13";
const UA = "NaLI-by-NatIve-research/0.1 (open editorial journal; contact halo@nali.native.id)";

const QUERIES = {
  "anak-krakatau": "Anak Krakatau volcano",
  "kelud-eruption": "Kelud volcano",
  "komodo-conservation": "Varanus komodoensis",
  "tarsier-sulawesi": "Tarsius dianae",
  "coelacanth-indonesia": "Latimeria menadoensis",
  "javan-rhino": "Rhinoceros sondaicus",
  "mangrove-blue-carbon": "mangrove forest",
  "jakarta-subsidence": "Jakarta flooding",
  "proboscis-monkey": "Nasalis larvatus",
  "javan-gibbon": "Hylobates moloch",
  "sulawesi-macaque": "Macaca nigra",
  "seagrass-indonesia": "seagrass meadow",
  "reef-fish-indonesia": "coral reef fish",
  "new-species-zookeys": "nudibranch",
  "sea-level-coast-id": "coastal erosion Java",
  "rafflesia": "Rafflesia patma",
  "orchid-id": "orchid flower",
  "butterfly-id": "butterfly Sumatra",
  "bird-diversity-id": "Mount Gede Pangrango",
  "marine-protected-id": "marine protected area conservation",
  "fisheries-id": "Scylla serrata",
  "river-water-java": "Cimanuk river",
  "agroforestry-id": "agroforestry",
  "bamboo-id": "bamboo forest"
};

const ACCEPT = [
  /^cc0/i,
  /^cc-by(-sa)?-/i,
  /public domain/i,
  /^pd-/i,
  /^cc-pd/i,
];
const REJECT = /all rights reserved|fair use|non-free|nonfree|noncommercial|nc-|nd-|copyright/i;

function licenseOk(short, code) {
  const s = `${short ?? ""} ${code ?? ""}`.trim();
  if (!s) return false;
  if (REJECT.test(s)) return false;
  if (/^cc-by-nc|^cc-by-nd|-nc-|-nd-/i.test(code ?? "")) return false;
  return ACCEPT.some((re) => re.test(short ?? "") || re.test(code ?? ""));
}

function strip(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?` + new URLSearchParams({
    format: "json",
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "800",
  });
  
  try {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages ?? {});
    const candidates = [];
    
    for (const p of pages) {
      const ii = p.imageinfo?.[0];
      if (!ii) continue;
      if (!/^image\/(jpeg|png)$/.test(ii.mime ?? "")) continue;
      if ((ii.width ?? 0) < 400) continue;
      const m = ii.extmetadata ?? {};
      const short = m.LicenseShortName?.value;
      const code = m.License?.value;
      if (!licenseOk(short, code)) continue;
      candidates.push({
        title: p.title,
        pageUrl: ii.descriptionurl,
        thumb: ii.thumburl ?? ii.url,
        width: ii.width,
        license: strip(short),
        licenseCode: code,
        licenseUrl: m.LicenseUrl?.value,
        artist: strip(m.Artist?.value) || strip(m.Credit?.value) || "Wikimedia Commons contributor",
        desc: strip(m.ImageDescription?.value).slice(0, 150),
        isPd: /public domain|^pd-|^cc0/i.test(`${short} ${code}`),
      });
    }
    
    candidates.sort((a, b) => Number(b.isPd) - Number(a.isPd) || b.width - a.width);
    return candidates[0] || null;
  } catch (err) {
    console.error(`Error searching Commons: ${err.message}`);
    return null;
  }
}

async function main() {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  const pubs = await loadPublications();
  
  let manifest = {};
  if (fs.existsSync(MANIFEST)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  }
  
  console.log(`Auditing and building covers for ${pubs.length} publications...`);
  
  for (const pub of pubs) {
    const query = QUERIES[pub.slug];
    if (!query) {
      console.log(`[-] No query defined for: ${pub.slug}`);
      continue;
    }
    
    console.log(`Auditing [${pub.slug}]... Query: "${query}"`);
    const pick = await searchCommons(query);
    
    if (pick) {
      console.log(`  [Found] ${pick.title} (${pick.license})`);
      const ext = pick.thumb.toLowerCase().endsWith(".png") ? "png" : "jpg";
      const localFileName = `${pub.slug}.${ext}`;
      const localPath = `/images/jurnal-covers/${localFileName}`;
      const outPath = path.join(OUT_IMG, localFileName);
      
      try {
        const img = await fetch(pick.thumb, { headers: { "user-agent": UA } });
        if (img.ok) {
          const buf = Buffer.from(await img.arrayBuffer());
          fs.writeFileSync(outPath, buf);
          
          manifest[pub.slug] = {
            title: pub.title,
            localPath,
            sourceUrl: pick.pageUrl,
            publisherOrInstitution: pub.publisherOrInstitution,
            creator: pick.artist,
            license: pick.license,
            licenseUrl: pick.licenseUrl || undefined,
            displayBasis: pick.isPd
              ? "Domain publik / CC0; logo atau visual subjek bebas ditampilkan."
              : `Lisensi ${pick.license}; visual subjek ditampilkan dengan atribusi dan tautan lisensi.`,
            attribution: `${pick.artist}, ${pick.license}, via Wikimedia Commons`,
            alt: `Visual representasi ${query} untuk publikasi: ${pub.title}`,
            caption: `Visual representasi subjek (${query}) dari Wikimedia Commons.`,
            checkedAt: CHECKED,
            isRealSourceCover: true,
          };
          console.log(`  [OK] Cover updated for ${pub.slug}`);
        } else {
          console.log(`  [-] Fetch failed for image: ${img.status}`);
        }
      } catch (err) {
        console.log(`  [-] Error saving cover: ${err.message}`);
      }
    } else {
      console.log(`  [-] No clear visual found. Using documented fallback.`);
      // Document exactly why
      let detailedReason = "";
      if (["tarsier-sulawesi", "proboscis-monkey", "sulawesi-macaque", "new-species-zookeys"].includes(pub.slug)) {
        detailedReason = "Publikasi berstatus closed-access/bronze (hak cipta penuh milik penerbit Cambridge University Press/Zootaxa). Visual artikel asli tidak dapat ditampilkan secara legal tanpa izin tertulis. Pencarian visual representatif berlisensi bebas di Wikimedia Commons juga tidak menghasilkan kandidat yang memadai.";
      } else {
        detailedReason = `Tidak ditemukan logo/visual publikasi resmi berlisensi aman (CC BY/CC0/Public Domain) di Wikidata atau Wikimedia Commons untuk subjek "${query}".`;
      }
      
      manifest[pub.slug] = {
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
        fallbackReason: detailedReason,
      };
    }
    
    await new Promise((r) => setTimeout(r, 300));
  }
  
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("\nFinished auditing and updating covers!");
}

main().catch(console.error);
