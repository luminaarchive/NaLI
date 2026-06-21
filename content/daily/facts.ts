import type { Confidence } from "@/lib/types";

/**
 * Verifiable one-line facts drawn from existing NaLI articles. Each points back to
 * the article that carries the sources and the confidence label, so "Fakta hari ini"
 * stays honest: no claim without a traceable home. Rotates deterministically per day.
 */
export interface DailyFact {
  fakta: string;
  slug: string;
  confidence: Confidence;
}

export const DAILY_FACTS: DailyFact[] = [
  {
    fakta: "Coelacanth, ikan yang dikira punah bersama dinosaurus, ditemukan hidup di perairan Sulawesi pada 1997-1998.",
    slug: "coelacanth-sulawesi-fosil-hidup-laut-dalam",
    confidence: "high",
  },
  {
    fakta: "Echidna paruh panjang Attenborough difoto kembali di Papua pada 2023, lebih dari enam dekade setelah catatan terakhir.",
    slug: "echidna-attenborough-papua-ditemukan-kembali",
    confidence: "high",
  },
  {
    fakta: "Black-browed babbler menghilang dari catatan sains selama 172 tahun sebelum ditemukan ulang di Kalimantan Selatan.",
    slug: "black-browed-babbler-burung-hilang-172-tahun",
    confidence: "high",
  },
  {
    fakta: "Megachile pluto, lebah terbesar di dunia, kembali difoto hidup di Halmahera pada 2019.",
    slug: "lebah-raksasa-wallace-megachile-pluto",
    confidence: "high",
  },
  {
    fakta: "Letusan Tambora 1815 begitu besar sampai memicu tahun tanpa musim panas di belahan bumi utara pada 1816.",
    slug: "tambora-1815-iklim-dunia",
    confidence: "high",
  },
  {
    fakta: "Badak jawa kini hanya bertahan di satu tempat, Taman Nasional Ujung Kulon.",
    slug: "badak-jawa-benteng-terakhir",
    confidence: "high",
  },
  {
    fakta: "Pesut Mahakam termasuk mamalia air paling terancam, dengan populasi tersisa hanya puluhan individu.",
    slug: "pesut-mahakam-populasi-terakhir",
    confidence: "high",
  },
  {
    fakta: "Letusan Samalas 1257 di Lombok terekam dalam inti es kutub dan diduga mengubah iklim global sesaat.",
    slug: "samalas-1257-babad-geologi",
    confidence: "high",
  },
  {
    fakta: "Harimau jawa dinyatakan punah, namun klaim DNA 2024 dari sehelai rambut masih belum cukup bukti untuk menyatakannya hidup.",
    slug: "harimau-jawa-lazarus-species",
    confidence: "needs-verification",
  },
  {
    fakta: "Prasasti Yupa dari Kutai adalah dokumen tertulis tertua yang ditemukan di Indonesia.",
    slug: "prasasti-yupa-kutai-dokumen-tertua",
    confidence: "high",
  },
];
