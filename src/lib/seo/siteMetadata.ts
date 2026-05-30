const rawUrl = process.env.NEXT_PUBLIC_APP_URL || "https://naliai.vercel.app";
export const siteUrl = rawUrl.includes("verdantai.vercel.app") ? "https://naliai.vercel.app" : rawUrl;

export const siteMetadata = {
  siteName: "NaLI",
  productDescriptor: "Laporan lapangan berbasis bukti untuk Indonesia",
  defaultTitle: "NaLI",
  defaultDescription:
    "Ubah catatan lapangan jadi laporan ilmiah dalam menit. Gratis untuk mahasiswa, ranger, dan peneliti Indonesia.",
  canonicalBase: siteUrl,

  // Public static routes registry
  routes: {
    home: {
      title: "NaLI",
      description:
        "Ubah catatan lapangan jadi laporan ilmiah dalam menit. Gratis untuk mahasiswa, ranger, dan peneliti Indonesia.",
    },
    learnReport: {
      title: "NaLI — Panduan",
      description:
        "Panduan lengkap cara menggunakan NaLI untuk menyusun laporan lapangan, praktikum biologi, dan laporan KKN berbasis bukti.",
    },
    createReport: {
      title: "NaLI — Buat Laporan",
      description:
        "Buat laporan lapangan berbasis bukti dari catatan observasi, data praktikum, atau hasil survei kamu. Gratis, tanpa format khusus.",
    },
    pricing: {
      title: "NaLI — Harga",
      description:
        "Mulai gratis dengan 3 laporan per bulan. Upgrade ke Sapling Rp 45.000 atau Forest Keeper Rp 149.000 untuk laporan tak terbatas dan ekspor PDF.",
    },
    fieldIntelligence: {
      title: "NaLI — Field Intelligence",
      description: "Layer profesional NaLI untuk ranger, peneliti, dan tim konservasi. Dalam pengembangan aktif.",
    },
    fieldNotes: {
      title: "NaLI — Catatan Lapangan",
      description: "Dokumentasikan catatan lapangan dan observasi lapangan kamu secara terstruktur dengan NaLI.",
    },
    signup: {
      title: "NaLI — Daftar",
      description: "Buat akun NaLI gratis. Mulai dokumentasi lapangan dan laporan ilmiah berbasis bukti.",
    },
  },

  // Indexing rules
  noindexPatterns: [
    "/founder",
    "/api/",
    "/report/",
    "/dashboard",
    "/observe",
    "/archive",
    "/monitoring",
    "/alerts",
    "/cases",
    "/review",
    "/patrol-plan",
    "/login",
    "/register",
    "/auth/",
    "/logout",
  ],
};
