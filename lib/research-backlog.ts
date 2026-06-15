/**
 * Open research backlog (F6.2): topics actively being researched but not yet
 * published. This opens the process, not just results. Entries are honest
 * statements of intent and progress; update as research moves.
 */
export type BacklogStatus =
  | "mengumpulkan-sumber"
  | "dalam-penulisan"
  | "menunggu-review";

export const BACKLOG_STATUS_LABEL: Record<BacklogStatus, string> = {
  "mengumpulkan-sumber": "Mengumpulkan sumber",
  "dalam-penulisan": "Dalam penulisan",
  "menunggu-review": "Menunggu review",
};

export interface BacklogEntry {
  topik: string;
  kategori: "alam" | "sejarah" | "investigasi";
  status: BacklogStatus;
  sumberDitemukan: string[];
  pertanyaanTerbuka: string[];
  estimasiTerbit: string;
}

export const RESEARCH_BACKLOG: BacklogEntry[] = [
  {
    topik: "Lazarus species: apa itu, dan bagaimana sebuah spesies dinyatakan punah",
    kategori: "alam",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "Kriteria IUCN Red List (Extinct, Possibly Extinct)",
      "Literatur tentang false absence dan effort survei",
    ],
    pertanyaanTerbuka: [
      "Kenapa ketidakhadiran bukti bukan bukti ketiadaan?",
      "Berapa lama tanpa catatan sampai sebuah spesies layak disebut punah?",
    ],
    estimasiTerbit: "Kuartal 3 2026",
  },
  {
    topik: "Echidna Attenborough: hilang 60 tahun, muncul di kamera jebak Cyclops Papua",
    kategori: "alam",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "Oxford / Expedition Cyclops, November 2023",
      "npj Biodiversity 2025 (rediscovery via camera-trap + pengetahuan adat)",
      "Liputan Mongabay 2023",
    ],
    pertanyaanTerbuka: [
      "Apa yang membuat status 'lost species' akhirnya ditutup secara meyakinkan?",
      "Mengapa tetap dikategorikan Kritis meski ditemukan kembali?",
    ],
    estimasiTerbit: "Kuartal 3 2026",
  },
  {
    topik: "Black-browed babbler: burung yang hilang 172 tahun di Kalimantan Selatan",
    kategori: "alam",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "BirdingASIA / Global Wildlife Conservation 2021",
      "Spesimen tunggal 1840-an di Naturalis Biodiversity Center",
      "American Bird Conservancy",
    ],
    pertanyaanTerbuka: [
      "Bagaimana satu spesimen lama menyesatkan asal-usul spesies selama ratusan tahun?",
      "Apa yang masih belum diketahui soal populasi dan sebarannya?",
    ],
    estimasiTerbit: "Kuartal 3 2026",
  },
  {
    topik: "Lebah raksasa Wallace: lebah terbesar dunia, tanpa catatan sejak 1981",
    kategori: "alam",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "Global Wildlife Conservation, Januari 2019 (rekaman hidup pertama)",
      "Liputan Mongabay, Februari 2019",
    ],
    pertanyaanTerbuka: [
      "Seberapa rapuh populasinya di Maluku Utara?",
      "Bagaimana ancaman perdagangan kolektor memengaruhi kelangsungannya?",
    ],
    estimasiTerbit: "Kuartal 4 2026",
  },
  {
    topik: "Tumpang tindih peta konsesi dengan kawasan konservasi",
    kategori: "investigasi",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "Shapefile kawasan konservasi KLHK",
      "Data tutupan hutan Global Forest Watch",
    ],
    pertanyaanTerbuka: [
      "Bagaimana memverifikasi tumpang tindih secara reproducible dari data publik?",
      "Mana yang bisa dinyatakan sebagai fakta vs yang perlu hak jawab?",
    ],
    estimasiTerbit: "Kuartal 4 2026",
  },
  {
    topik: "Prasasti Yupa Kutai: dokumen tertulis tertua Nusantara",
    kategori: "sejarah",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "Katalog koleksi Museum Nasional",
      "Literatur epigrafi tentang aksara Pallawa di Nusantara",
    ],
    pertanyaanTerbuka: [
      "Apa yang benar-benar bisa dibaca vs interpretasi yang masih diperdebatkan?",
      "Bagaimana penanggalannya dijustifikasi dalam literatur?",
    ],
    estimasiTerbit: "Kuartal 4 2026",
  },
  {
    topik: "Perubahan garis pantai Jawa Utara dari citra satelit 20 tahun",
    kategori: "investigasi",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "Arsip citra Landsat/Copernicus",
      "Studi penurunan tanah pesisir terpublikasi",
    ],
    pertanyaanTerbuka: [
      "Berapa laju mundurnya garis pantai yang bisa diukur dengan andal?",
      "Bagaimana memisahkan subsidensi dari kenaikan muka laut?",
    ],
    estimasiTerbit: "Kuartal 1 2027",
  },
];
