import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const PUBLIC_DIR = path.join(ROOT, "public");

const SLUG_QUERIES = {
  "anoa-sulawesi-fragmentasi-hutan": "Bubalus depressicornis",
  "api-biru-kawah-ijen": "Kawah Ijen blue fire",
  "babirusa-evolusi-aneh-wallacea": "Babyrousa",
  "badak-jawa-benteng-terakhir": "Rhinoceros sondaicus",
  "banda-neira-pala-kekerasan-kolonial-arsip": "Banda Neira history",
  "batavia-kota-tua-jakarta": "Batavia Kota Tua",
  "burung-maleo-sulawesi": "Macrocephalon maleo",
  "cenderawasih-papua-perdagangan-habitat": "Paradisaeidae",
  "citarum-sungai-tercemar": "Citarum River pollution",
  "deforestasi-kalimantan-data-terbuka": "Borneo rainforest deforestation",
  "dieng-kawah-gas-bahaya-senyap": "Kawah Sikidang Dieng",
  "gambut-indonesia-karbon-api-kabut": "Peatland Indonesia fire",
  "harimau-bali-kepunahan-arsip": "Panthera tigris balica",
  "jakarta-tenggelam-penurunan-tanah": "Jakarta flooding",
  "kelud-danau-kawah-rekayasa-bahaya": "Gunung Kelud",
  "komodo-predator-pulau-tekanan-konservasi": "Varanus komodoensis",
  "krakatau-1883-tsunami-arsip-global": "Krakatoa 1883",
  "mangrove-indonesia-karbon-biru": "Mangrove forest Indonesia",
  "mangrove-segara-anakan": "Segara Anakan",
  "merapi-awan-panas-pemantauan": "Mount Merapi eruption",
  "orangutan-tapanuli-spesies-baru-habitat-terbatas": "Pongo tapanuliensis",
  "peta-lama-nusantara-kolonial-membaca-pulau-kuasa": "Map East Indies",
  "prasasti-yupa-kutai-dokumen-tertua": "Prasasti Yupa",
  "samalas-1257-babad-geologi": "Mount Samalas",
  "sampah-plastik-laut-indonesia-data-kebijakan": "Marine plastic waste",
  "tambora-1815-iklim-dunia": "Mount Tambora",
  "tarsius-primata-malam-sulawesi": "Tarsius tarsier",
  "terumbu-karang-indonesia-iklim": "Coral reef Indonesia",
  "toba-supervolcano-perdebatan-dampak": "Lake Toba",
  "anak-krakatau-2018-runtuhan-tsunami": "Anak Krakatau 2018",
  "deforestasi-kalimantan": "Borneo deforestation",
  "harimau-jawa-lazarus-species": "Javan tiger",
  "lazarus-taxon-bagaimana-kepunahan-dinyatakan": "Lazarus taxon animal",
  "lebah-raksasa-wallace-megachile-pluto": "Megachile pluto",
  "nepenthes-pitopangii-kantong-semar-paling-langka-sulawesi": "Nepenthes pitopangii",
  "seriwang-sangihe-burung-biru-yang-nyaris-punah": "Eutrichomyias rowleyi",
  "spesies-indonesia-yang-masih-hilang": "extinct birds specimens"
};

const HEADERS = {
  "User-Agent": "NaLI-Editorial-Scraper/1.0 (halo@nali.native.id) NodeFetch/1.0"
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function cleanHtml(html) {
  if (!html) return "";
  return html.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ").trim();
}

async function fetchCommonsImages(query, limit = 4) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap%7Cdrawing%20${encodeURIComponent(query)}&gsrnamespace=6&prop=imageinfo&iiprop=url%7Cextmetadata&format=json&gsrlimit=${limit}`;
  try {
    await sleep(2000); // 2-second rate-limiting delay
    const res = await fetch(url, { headers: HEADERS });
    const json = await res.json();
    if (!json.query || !json.query.pages) return [];
    
    const pages = Object.values(json.query.pages);
    return pages.map(p => {
      if (!p.imageinfo || p.imageinfo.length === 0) return null;
      const info = p.imageinfo[0];
      const meta = info.extmetadata || {};
      
      return {
        url: info.url,
        descriptionUrl: info.descriptionurl,
        title: cleanHtml(meta.ObjectName?.value) || p.title.replace(/^File:/, ""),
        license: meta.LicenseShortName?.value || "Public Domain",
        attribution: cleanHtml(meta.Artist?.value) || cleanHtml(meta.Credit?.value) || "Unknown",
        alt: cleanHtml(meta.ImageDescription?.value) || p.title.replace(/^File:/, ""),
        caption: cleanHtml(meta.ImageDescription?.value) || p.title.replace(/^File:/, "")
      };
    }).filter(Boolean);
  } catch (err) {
    console.error(`Error searching Commons for "${query}":`, err.message);
    return [];
  }
}

async function downloadImage(url, destPath) {
  try {
    await sleep(1500); // 1.5-second rate-limiting delay between downloads
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.error(`Failed to download image ${url}:`, err.message);
    return false;
  }
}

async function run() {
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => /\.mdx?$/.test(f));
  
  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(rawContent);
    const slug = data.slug || file.replace(/\.mdx?$/, "");
    
    // Only process published articles
    if ((data.status ?? "draft") !== "published") continue;
    
    const currentImages = Array.isArray(data.images) ? data.images : [];
    if (currentImages.length >= 4) {
      console.log(`✅ ${file} already has ${currentImages.length} images. Skipping.`);
      continue;
    }
    
    const query = SLUG_QUERIES[slug] || data.title;
    console.log(`🔍 Searching Commons for "${query}" (Article: ${slug})...`);
    
    const countNeeded = 4 - currentImages.length;
    const fetched = await fetchCommonsImages(query, countNeeded + 3); // fetch slightly more to filter out potential duplicates
    
    if (fetched.length === 0) {
      console.log(`⚠️ No images found for "${query}".`);
      continue;
    }
    
    const updatedImages = [...currentImages];
    let downloadedCount = 0;
    
    for (const img of fetched) {
      if (downloadedCount >= countNeeded) break;
      
      // Check if image already exists in updatedImages
      if (updatedImages.some(existing => existing.sourceUrl === img.descriptionUrl)) {
        continue;
      }
      
      const fileExt = path.extname(new URL(img.url).pathname) || ".jpg";
      const destFilename = `${slug}-img-${updatedImages.length + 1}${fileExt}`;
      const destFolder = path.join("images", slug);
      const relativeSrc = `/${destFolder}/${destFilename}`;
      const absoluteDest = path.join(PUBLIC_DIR, destFolder, destFilename);
      
      console.log(`   Downloading ${img.url} -> ${relativeSrc}...`);
      const success = await downloadImage(img.url, absoluteDest);
      if (success) {
        updatedImages.push({
          src: relativeSrc,
          title: img.title.slice(0, 80),
          sourceUrl: img.descriptionUrl,
          license: img.license,
          attribution: img.attribution.slice(0, 100),
          alt: img.alt.slice(0, 150),
          caption: img.caption.slice(0, 200),
          checkedAt: new Date().toISOString().split("T")[0],
          relatedArticleIds: [slug]
        });
        downloadedCount++;
      }
    }
    
    if (downloadedCount > 0) {
      data.images = updatedImages;
      // Reconstruct MDX
      const newMdx = matter.stringify(content, data);
      fs.writeFileSync(filePath, newMdx);
      console.log(`   Saved ${file} with ${updatedImages.length} images total.\n`);
    }
  }
  
  console.log("All image fetching tasks completed.");
}

run().catch(console.error);
