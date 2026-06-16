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
