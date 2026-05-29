export interface FallbackChecklistItem {
  id: string;
  label: string;
  description: string;
}

export interface ManualChecklist {
  title: string;
  description: string;
  modeLabel: string;
  items: FallbackChecklistItem[];
  suggestedOutline: string[];
  scientificImplications?: string[];
  disclaimer: string;
  nextSteps: string[];
}

export function generateManualChecklist(
  template: string,
  mode: "draft_from_materials" | "start_from_zero"
): ManualChecklist {
  const isZero = mode === "start_from_zero";
  
  const modeLabel = isZero
    ? "Panduan awal — belum menjadi draft laporan berbasis bukti."
    : "Draft bantuan belajar/penulisan berbasis bukti.";

  const disclaimer = isZero
    ? "Panduan ini belum menjadi draft laporan berbasis bukti karena bahan observasi atau sumber belum tersedia. Pengguna perlu mengumpulkan data, catatan, foto, sumber, atau hasil pengamatan terlebih dahulu sebelum NaLI dapat menyusun draft laporan."
    : "Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh digunakan untuk memalsukan data, mengarang referensi, melakukan plagiarisme, atau mengklaim karya AI sebagai karya final tanpa revisi.";

  // Standard items for environmental observation checklist
  const baseItems: FallbackChecklistItem[] = [
    {
      id: "title",
      label: "Judul / Topik",
      description: "Tentukan judul laporan yang mencerminkan fokus observasi, misalnya: 'Analisis Dampak Sampah Plastik di Pantai Parangtritis'.",
    },
    {
      id: "location",
      label: "Lokasi",
      description: "Catat koordinat GPS, nama daerah, provinsi, atau ciri geografis spesifik tempat pengamatan dilakukan.",
    },
    {
      id: "timestamp",
      label: "Tanggal / Waktu",
      description: "Catat tanggal mulai, tanggal berakhir, dan rentang waktu pengamatan harian.",
    },
    {
      id: "object",
      label: "Objek yang Diamati",
      description: "Sebutkan nama spesies flora/fauna (jika ada gunakan binomial nomenclature), kondisi fisik tebing, sungai, tanah, atau parameter biotik/abiotik lainnya.",
    },
    {
      id: "method",
      label: "Metode Pengamatan",
      description: "Jelaskan cara pengambilan data, misalnya: transek garis 10 meter, plot vegetasi, atau observasi visual langsung.",
    },
    {
      id: "evidence",
      label: "Bukti yang Dimiliki",
      description: "Identifikasi bukti fisik pendukung: foto ber-tag geotag, catatan lapangan basah, atau sampel fisik.",
    },
    {
      id: "limits",
      label: "Batasan Bukti",
      description: "Tuliskan apa saja yang belum dapat dipastikan dari bukti yang Anda miliki (contoh: 'Hanya melihat visual, tidak mengukur parameter kimia air').",
    },
    {
      id: "risk",
      label: "Risiko Klaim yang Belum Didukung",
      description: "Identifikasi pernyataan dalam draf Anda yang belum memiliki bukti kuat untuk mencegah overclaiming.",
    },
  ];

  // Specific outlines by template
  let suggestedOutline = [
    "I. Pendahuluan",
    "II. Lokasi & Waktu Pengamatan",
    "III. Hasil Observasi Lapangan",
    "IV. Analisis Temuan",
    "V. Kesimpulan & Batasan Bukti",
    "VI. Referensi & Daftar Pustaka"
  ];

  if (template.toLowerCase().includes("praktikum") || template.toLowerCase().includes("biologi")) {
    suggestedOutline = [
      "I. Tujuan Praktikum",
      "II. Alat dan Bahan",
      "III. Cara Kerja / Prosedur",
      "IV. Hasil Pengamatan & Tabel Data",
      "V. Pembahasan",
      "VI. Kesimpulan & Batasan Metode",
      "VII. Daftar Pustaka"
    ];
  } else if (template.toLowerCase().includes("jurnal") || template.toLowerCase().includes("observasi")) {
    // IMRaD structure
    suggestedOutline = [
      "Title Page & Abstract",
      "Introduction (Pendahuluan & Tinjauan Literatur)",
      "Materials and Methods (Bahan dan Metode Pengamatan)",
      "Results (Hasil Observasi)",
      "Discussion (Pembahasan & Batasan Bukti)",
      "Conclusion (Kesimpulan & Saran Masa Depan)",
      "References / Daftar Pustaka (Hanya referensi asli)"
    ];
  }

  const nextSteps = isZero
    ? [
        "1. Lakukan survey lokasi atau kumpulkan catatan lapangan awal.",
        "2. Ambil foto dokumentasi dengan metadata lokasi aktif.",
        "3. Kumpulkan referensi ilmiah primer dari jurnal terakreditasi.",
        "4. Masukkan bahan tersebut ke form NaLI mode 'Saya sudah punya bahan'."
      ]
    : [
        "1. Periksa setiap klaim dalam draf laporan Anda terhadap data lapangan nyata.",
        "2. Lengkapi tabel bukti (evidence table) dengan file dokumentasi asli.",
        "3. Tambahkan sitasi ilmiah yang relevan untuk mendukung analisis.",
        "4. Edit struktur laporan sesuai format instansi atau jurnal target Anda."
      ];

  const scientificImplications = [
    "Rekomendasi konservasi lokal berdasarkan status taksonomi.",
    "Pentingnya pencatatan parameter kuantitatif (SI/metrik).",
    "Pemberian catatan etika jika melibatkan satwa liar dilindungi."
  ];

  return {
    title: `Checklist Manual: ${template}`,
    description: `Gunakan checklist terstruktur ini untuk menyusun laporan Anda secara manual ketika mesin AI sedang tidak tersedia. Ini membantu Anda menjaga integritas akademik.`,
    modeLabel,
    items: baseItems,
    suggestedOutline,
    scientificImplications,
    disclaimer,
    nextSteps,
  };
}
