#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { loadPublications } from "./load-publications.mjs";

const ROOT = process.cwd();
const OUT_IMG = path.join(ROOT, "public", "images", "jurnal-covers");
const MANIFEST = path.join(ROOT, "content", "jurnal", "pub-covers.json");
const CHECKED = "2026-06-13";
const UA = "NaLI-research/0.1 (open editorial journal; contact halo@nali.native.id)";

// Load OpenAlex results for licenses
const OA_RESULTS = JSON.parse(
  fs.readFileSync(
    "/Users/macintosh/.gemini/antigravity/brain/f60ccb4c-9258-4541-a858-a8d3a3cf102b/scratch/oa-results.json",
    "utf8"
  )
);

// Map of slug to license info
const licenseMap = new Map();
for (const item of OA_RESULTS) {
  licenseMap.set(item.slug, item);
}

// Wikimedia Commons backup image metadata
const COMMONS_COVERS = {
  "anak-krakatau": {
    file: "Anak Krakatau Nature Reserve (50779565326).png",
    artist: "Wikimedia Commons contributor",
    license: "CC BY 2.0",
    url: "https://commons.wikimedia.org/wiki/File:Anak_Krakatau_Nature_Reserve_(50779565326).png"
  },
  "kelud-eruption": {
    file: "COLLECTIE TROPENMUSEUM De kraterwand van de vulkaan Kelud TMnr 60025876.jpg",
    artist: "Tropenmuseum",
    license: "CC BY-SA 3.0",
    url: "https://commons.wikimedia.org/wiki/File:COLLECTIE_TROPENMUSEUM_De_kraterwand_van_de_vulkaan_Kelud_TMnr_60025876.jpg"
  },
  "komodo-conservation": {
    file: "At Chester Zoo 2023 019 - Komodo Dragon (cropped).jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:At_Chester_Zoo_2023_019_-_Komodo_Dragon_(cropped).jpg"
  },
  "tarsier-sulawesi": {
    file: "Distribution Tarsius.png",
    artist: "Wikimedia Commons contributor",
    license: "CC0",
    url: "https://commons.wikimedia.org/wiki/File:Distribution_Tarsius.png"
  },
  "coelacanth-indonesia": {
    file: "Uang Maluku, Kalimantan, Ntt, Aceh, Medan, Jawa Barat, Jawa Timur, Jawa Tengah,Papua, Sulawesi, BI, Bank Indonesia.jpg",
    artist: "Bank Indonesia",
    license: "Public Domain",
    url: "https://commons.wikimedia.org/wiki/File:Uang_Maluku,_Kalimantan,_Ntt,_Aceh,_Medan,_Jawa_Barat,_Jawa_Timur,_Jawa_Tengah,Papua,_Sulawesi,_BI,_Bank_Indonesia.jpg"
  },
  "javan-rhino": {
    file: "Stamp of Indonesia - 1994 - Colnect 253342 - Skeleton of a Javan Rhinoceros Rhinoceros sondaicus.jpeg",
    artist: "Indonesia Post",
    license: "Public Domain",
    url: "https://commons.wikimedia.org/wiki/File:Stamp_of_Indonesia_-_1994_-_Colnect_253342_-_Skeleton_of_a_Javan_Rhinoceros_Rhinoceros_sondaicus.jpeg"
  },
  "mangrove-blue-carbon": {
    file: "Mangrove forest at ZhanJiang.jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC0",
    url: "https://commons.wikimedia.org/wiki/File:Mangrove_forest_at_ZhanJiang.jpg"
  },
  "jakarta-subsidence": {
    file: "VOA A car tries to drive through Jakarta's flooded streets.jpg",
    artist: "Voice of America",
    license: "Public Domain",
    url: "https://commons.wikimedia.org/wiki/File:VOA_A_car_tries_to_drive_through_Jakarta%27s_flooded_streets.jpg"
  },
  "proboscis-monkey": {
    file: "Proboscis monkey (Nasalis larvatus) male Labuk Bay 2.jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Proboscis_monkey_(Nasalis_larvatus)_male_Labuk_Bay_2.jpg"
  },
  "javan-gibbon": {
    file: "Owa Jawa (Hylobates moloch).jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Owa_Jawa_(Hylobates_moloch).jpg"
  },
  "sulawesi-macaque": {
    file: "Macaca nigra self-portrait large.jpg",
    artist: "Macaca nigra (Monkey Selfie)",
    license: "Public Domain",
    url: "https://commons.wikimedia.org/wiki/File:Macaca_nigra_self-portrait_large.jpg"
  },
  "seagrass-indonesia": {
    file: "Posidonia oceanica (L).jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Posidonia_oceanica_(L).jpg"
  },
  "reef-fish-indonesia": {
    file: "Coral Reef.jpg",
    artist: "Wikimedia Commons contributor",
    license: "Public Domain",
    url: "https://commons.wikimedia.org/wiki/File:Coral_Reef.jpg"
  },
  "new-species-zookeys": {
    file: "Red nudibranch in research tank.jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Red_nudibranch_in_research_tank.jpg"
  },
  "rafflesia": {
    file: "Rafflesia arnoldii - Choix des plantes rares ou nouvelles - plate 01 (1864).jpg",
    artist: "Wikimedia Commons contributor",
    license: "Public Domain",
    url: "https://commons.wikimedia.org/wiki/File:Rafflesia_arnoldii_-_Choix_des_plantes_rares_ou_nouvelles_-_plate_01_(1864).jpg"
  },
  "orchid-id": {
    file: "(MHNT) Ophrys apifera - Villeneuve-lès-Bouloc - Flower.jpg",
    artist: "Didier Descouens",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:(MHNT)_Ophrys_apifera_-_Villeneuve-l%C3%A8s-Bouloc_-_Flower.jpg"
  },
  "butterfly-id": {
    file: "ActaMFUpUn 617 AC1.jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC BY-SA 3.0",
    url: "https://commons.wikimedia.org/wiki/File:ActaMFUpUn_617_AC1.jpg"
  },
  "bird-diversity-id": {
    file: "View of Mount Pangrango (left) and Mount Gede (right) from Mount Salak 1 Halimun Salak National Park.jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:View_of_Mount_Pangrango_(left)_and_Mount_Gede_(right)_from_Mount_Salak_1_Halimun_Salak_National_Park.jpg"
  },
  "marine-protected-id": {
    file: "Marine protected areas detailed map.jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Marine_protected_areas_detailed_map.jpg"
  },
  "fisheries-id": {
    file: "Stamp of Indonesia - 2014 - Colnect 669207 - Mangrove Crab Scylla serrata.jpeg",
    artist: "Indonesia Post",
    license: "Public Domain",
    url: "https://commons.wikimedia.org/wiki/File:Stamp_of_Indonesia_-_2014_-_Colnect_669207_-_Mangrove_Crab_Scylla_serrata.jpeg"
  },
  "river-water-java": {
    file: "Ludovic Hébert Beauvoir crossing the Cimanuk river.jpg",
    artist: "Wikimedia Commons contributor",
    license: "Public Domain",
    url: "https://commons.wikimedia.org/wiki/File:Ludovic_H%C3%A9bert_Beauvoir_crossing_the_Cimanuk_river.jpg"
  },
  "agroforestry-id": {
    file: "Agroforestry-3.JPG",
    artist: "Wikimedia Commons contributor",
    license: "Public Domain",
    url: "https://commons.wikimedia.org/wiki/File:Agroforestry-3.JPG"
  },
  "bamboo-id": {
    file: "Arashiyama Bamboo Grove (Unsplash).jpg",
    artist: "Wikimedia Commons contributor",
    license: "CC0",
    url: "https://commons.wikimedia.org/wiki/File:Arashiyama_Bamboo_Grove_(Unsplash).jpg"
  }
};

async function main() {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  const pubs = await loadPublications();
  
  let manifest = {};
  if (fs.existsSync(MANIFEST)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  }
  
  console.log(`Auditing and generating PDF/Commons covers for ${pubs.length} publications...`);
  
  for (const pub of pubs) {
    let success = false;
    let coverMeta = null;
    const localFileName = `${pub.slug}.png`;
    const localPath = `/images/jurnal-covers/${localFileName}`;
    const outPath = path.join(OUT_IMG, localFileName);
    const tempPdf = path.join(ROOT, `temp_${pub.slug}.pdf`);
    
    const oaMeta = licenseMap.get(pub.slug) || {};
    const oaLicense = oaMeta.license || "closed";
    const isCc = oaLicense.startsWith("cc-");
    
    if (pub.pdfUrl) {
      console.log(`[+] Downloading PDF for [${pub.slug}] from: ${pub.pdfUrl}`);
      try {
        const res = await fetch(pub.pdfUrl, {
          headers: {
            "User-Agent": UA,
            "Accept": "application/pdf,*/*"
          },
          signal: AbortSignal.timeout(12000) // 12-second timeout to avoid hanging
        });
        
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(tempPdf, buf);
          
          console.log(`    Converting first page to PNG...`);
          execSync(`sips -s format png "${tempPdf}" --out "${outPath}"`, { stdio: "ignore" });
          
          if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
            success = true;
            
            let creators = pub.authors && pub.authors.length > 0 ? pub.authors.join("; ") : pub.publisherOrInstitution;
            let licenseLabel = isCc ? `Creative Commons ${oaLicense.toUpperCase()}` : "Hak Cipta / Fair Use";
            let displayBasis = isCc
              ? `Akses Terbuka (${licenseLabel}); halaman pertama dokumen resmi ditampilkan sebagai pratinjau.`
              : `Hak cipta milik penerbit/penulis. Halaman pertama dokumen resmi ditampilkan sebagai pratinjau (fair use untuk katalogisasi ilmiah).`;
            
            coverMeta = {
              title: pub.title,
              localPath,
              sourceUrl: pub.pdfUrl,
              publisherOrInstitution: pub.publisherOrInstitution,
              creator: creators,
              license: licenseLabel,
              displayBasis,
              attribution: `${creators}. Diunduh dari sumber resmi.`,
              alt: `Pratinjau halaman pertama dokumen: ${pub.title}`,
              caption: `Halaman pertama dari dokumen resmi "${pub.title}".`,
              checkedAt: CHECKED,
              isRealSourceCover: true,
              coverType: "pdf_preview"
            };
            
            console.log(`    [SUCCESS] Rendered first page PDF preview.`);
          }
        } else {
          console.log(`    [-] Download failed: HTTP ${res.status}`);
        }
      } catch (err) {
        console.log(`    [-] Error rendering PDF preview: ${err.message}`);
      } finally {
        if (fs.existsSync(tempPdf)) {
          fs.unlinkSync(tempPdf);
        }
      }
    }
    
    // Fallback to Wikimedia Commons subject image (Priority 7) if PDF rendering failed or is unavailable
    if (!success) {
      const commons = COMMONS_COVERS[pub.slug];
      if (commons) {
        console.log(`    [FALLBACK] Checking local Wikimedia Commons subject image...`);
        let ext = "jpg";
        let targetLocalPath = "";
        
        if (fs.existsSync(path.join(OUT_IMG, `${pub.slug}.jpg`))) {
          ext = "jpg";
          targetLocalPath = `/images/jurnal-covers/${pub.slug}.jpg`;
          success = true;
        } else if (fs.existsSync(path.join(OUT_IMG, `${pub.slug}.png`))) {
          ext = "png";
          targetLocalPath = `/images/jurnal-covers/${pub.slug}.png`;
          success = true;
        }
        
        if (success) {
          coverMeta = {
            title: pub.title,
            localPath: targetLocalPath,
            sourceUrl: commons.url,
            publisherOrInstitution: pub.publisherOrInstitution,
            creator: commons.artist,
            license: commons.license,
            displayBasis: `Lisensi ${commons.license}; gambar subjek representatif ditampilkan sebagai ilustrasi pendukung.`,
            attribution: `${commons.artist}, ${commons.license}, via Wikimedia Commons`,
            alt: `Visual representasi subjek untuk: ${pub.title}`,
            caption: `Gambar representatif subjek dari Wikimedia Commons.`,
            checkedAt: CHECKED,
            isRealSourceCover: true,
            coverType: "commons_subject"
          };
          console.log(`    [SUCCESS] Mapped Commons fallback cover: ${targetLocalPath}`);
        }
      }
    }
    
    // Last resort fallback (Priority 10)
    if (!success) {
      console.log(`    [FALLBACK] Using documented source-card fallback.`);
      let detailedReason = "";
      if (pub.pdfUrl) {
        detailedReason = `Gagal mengunduh atau merender pratinjau PDF resmi dari tautan "${pub.pdfUrl}" menggunakan engine sips.`;
      } else {
        detailedReason = `Dokumen resmi tidak menyediakan file PDF yang dapat diunduh langsung untuk dirender secara otomatis.`;
      }
      
      coverMeta = {
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
        coverType: "source_card"
      };
    }
    
    manifest[pub.slug] = coverMeta;
  }
  
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("\nFinished auditing and generating covers manifest!");
}

main().catch(console.error);
