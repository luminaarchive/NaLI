#!/usr/bin/env node
/**
 * Writes/refreshes the authoritative "umbrella" database source records that
 * Jurnal entry bodies cite (IUCN Red List, GBIF, BirdLife DataZone, FishBase,
 * etc.). usedInJurnalIds is computed from the entries that actually cite each id,
 * so these stay accurate as batches grow. Only sources that are cited by at least
 * one entry are written (the validator requires a non-empty usedInJurnalIds).
 */
import fs from "node:fs";
import path from "node:path";
import { loadJournalEntries } from "./load-jurnal.mjs";

const OUT = path.join(process.cwd(), "content", "sources");
const CHECKED = "2026-06-13";

const UMBRELLAS = {
  "iucn-red-list": {
    title: "IUCN Red List of Threatened Species",
    institution: "International Union for Conservation of Nature (IUCN)",
    url: "https://www.iucnredlist.org",
    language: "en",
    reliabilityLevel: "high",
    topics: ["konservasi", "status keterancaman", "biodiversitas"],
    geography: ["Global", "Indonesia"],
    summary:
      "Basis data otoritatif status konservasi spesies dunia, disusun para penilai dan kelompok pakar IUCN. NaLI memakainya untuk status keterancaman (misalnya Critically Endangered, Endangered, Vulnerable) pada entri Jurnal.",
    keyClaims: [
      "Status keterancaman spesies (CR, EN, VU, dan kategori lain) menurut penilaian IUCN.",
      "Tekanan utama dan tren populasi yang diringkas dalam penilaian spesies.",
    ],
    limitations: [
      "Status adalah ringkasan; rujuk halaman penilaian spesies tertentu untuk angka, tahun, dan metode.",
      "Penilaian diperbarui berkala, sehingga kategori dapat berubah seiring data baru.",
    ],
  },
  "gbif-species": {
    title: "GBIF, Global Biodiversity Information Facility",
    institution: "GBIF Secretariat",
    url: "https://www.gbif.org",
    language: "en",
    reliabilityLevel: "high",
    topics: ["biodiversitas", "rekaman keterdapatan", "sebaran"],
    geography: ["Global", "Indonesia"],
    summary:
      "Jaringan data keanekaragaman hayati terbuka yang menghimpun rekaman keterdapatan spesies dari museum, herbarium, survei, dan pengamatan warga. NaLI memakainya untuk memeriksa di mana suatu spesies tercatat.",
    keyClaims: [
      "Rekaman keterdapatan dan sebaran terdokumentasi untuk spesies tertentu.",
      "Lokasi tempat spesies pernah tercatat secara ilmiah.",
    ],
    limitations: [
      "Rekaman keterdapatan bisa tidak merata dan tidak mencakup seluruh sebaran nyata.",
      "Kualitas data bergantung pada penyumbang; sebagian rekaman perlu verifikasi taksonomi.",
    ],
  },
  "birdlife-datazone": {
    title: "BirdLife DataZone",
    institution: "BirdLife International",
    url: "https://datazone.birdlife.org",
    language: "en",
    reliabilityLevel: "high",
    topics: ["burung", "konservasi", "sebaran"],
    geography: ["Global", "Indonesia"],
    summary:
      "Basis data status, sebaran, dan ekologi burung dunia oleh BirdLife International, otoritas Daftar Merah IUCN untuk burung. NaLI memakainya untuk status dan ekologi jenis burung.",
    keyClaims: [
      "Status konservasi dan tren populasi burung menurut BirdLife.",
      "Sebaran dan kebutuhan habitat jenis burung tertentu.",
    ],
    limitations: [
      "Status diperbarui berkala; rujuk lembar jenis untuk detail.",
      "Estimasi populasi burung sering mengandung rentang ketidakpastian.",
    ],
  },
  fishbase: {
    title: "FishBase",
    institution: "FishBase Consortium",
    url: "https://www.fishbase.se",
    language: "en",
    reliabilityLevel: "high",
    topics: ["ikan", "biologi", "sebaran"],
    geography: ["Global", "Indonesia"],
    summary:
      "Basis data global biologi, ekologi, dan sebaran ikan. NaLI memakainya untuk data dasar jenis ikan, termasuk habitat dan ciri biologi.",
    keyClaims: [
      "Ciri biologi, habitat, dan sebaran jenis ikan tertentu.",
      "Status dan catatan ekologi yang terhimpun untuk ikan.",
    ],
    limitations: [
      "Kedalaman data berbeda antar jenis ikan.",
      "Sebagian catatan perlu pembaruan dari literatur terbaru.",
    ],
  },
};

function yaml(obj) {
  return Object.entries(obj)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map((x) => `  - ${JSON.stringify(x)}`).join("\n")}`;
      return `${k}: ${JSON.stringify(String(v))}`;
    })
    .join("\n");
}

const entries = await loadJournalEntries();
let written = 0;
for (const [id, def] of Object.entries(UMBRELLAS)) {
  const used = entries.filter((e) => e.sourceIds.includes(id)).map((e) => e.slug);
  if (used.length === 0) continue;
  const fm = {
    id,
    title: def.title,
    type: "laporan",
    sourceType: "laporan",
    institution: def.institution,
    url: def.url,
    language: def.language,
    reliabilityLevel: def.reliabilityLevel,
    reliability: `Sumber ${def.reliabilityLevel} yang dipakai untuk menopang klaim pada entri Jurnal sesuai cakupannya.`,
    topics: def.topics,
    geography: def.geography,
    keyClaims: def.keyClaims,
    keyClaimsSupported: def.keyClaims,
    limitations: [...def.limitations, "Tahun terbit bersifat berkelanjutan (basis data hidup); rujuk halaman entri untuk tanggal akses."],
    usedInJurnalIds: used,
    checkedAt: CHECKED,
  };
  const body = `${def.summary}\n\nDalam arsip NaLI, ${def.title} dipakai sebagai rujukan otoritatif untuk ${def.topics.join(", ")}. Entri Jurnal yang menumpang pada sumber ini: ${used.length}. Klaim spesifik tetap perlu ditelusuri ke halaman jenis atau penilaian terkait pada situs sumber.`;
  fs.writeFileSync(path.join(OUT, `${id}.mdx`), `---\n${yaml(fm)}\n---\n${body}\n`);
  written++;
  console.log(`${id}: used by ${used.length} jurnal entries`);
}
console.log(`Wrote ${written} umbrella source(s).`);
