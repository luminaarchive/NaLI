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
    topik: "Lukisan gua tertua dunia di Maros-Pangkep, Sulawesi",
    kategori: "sejarah",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "Aubert dkk. di Nature dan Science Advances tentang penanggalan seri uranium",
      "Publikasi Brumm dan tim Griffith University-ARKENAS",
    ],
    pertanyaanTerbuka: [
      "Seberapa kuat metode penanggalan seri uranium pada kerak kalsit di atas lukisan?",
      "Apa yang bisa dan tidak bisa disimpulkan tentang siapa pelukisnya?",
    ],
    estimasiTerbit: "Kuartal 3 2026",
  },
  {
    topik: "Gunung Padang: situs megalit dan klaim umur yang diperdebatkan",
    kategori: "sejarah",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "Makalah Natawidjaja dkk. (yang kemudian ditarik penerbitnya) dan tanggapan ahli",
      "Liputan Nature dan pernyataan asosiasi arkeologi",
    ],
    pertanyaanTerbuka: [
      "Mana lapisan yang benar-benar buatan manusia vs formasi alami kolom basal?",
      "Kenapa klaim umur belasan ribu tahun ditolak komunitas arkeologi?",
    ],
    estimasiTerbit: "Kuartal 3 2026",
  },
  {
    topik: "Sundaland yang tenggelam: dataran Asia Tenggara di bawah laut",
    kategori: "alam",
    status: "mengumpulkan-sumber",
    sumberDitemukan: [
      "Rekonstruksi muka laut Pleistosen dan peta paparan Sunda",
      "Studi DNA dan linguistik tentang persebaran manusia di Sundaland",
    ],
    pertanyaanTerbuka: [
      "Berapa luas daratan yang hilang dan kapan tepatnya tenggelam?",
      "Mana yang sains mapan vs spekulasi 'peradaban yang hilang'?",
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
