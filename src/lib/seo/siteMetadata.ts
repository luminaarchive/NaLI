const rawUrl = process.env.NEXT_PUBLIC_APP_URL || "https://naliai.vercel.app";
export const siteUrl = rawUrl.includes("verdantai.vercel.app")
  ? "https://naliai.vercel.app"
  : rawUrl;

export const siteMetadata = {
  siteName: "NaLI",
  productDescriptor: "Nature & Evidence Intelligence OS",
  defaultTitle: "NaLI — Nature & Evidence Intelligence OS",
  defaultDescription: "NaLI membantu menyusun draf laporan lingkungan dan observasi berbasis konteks, bukti, dan batasan klaim secara jujur untuk pengguna Indonesia.",
  canonicalBase: siteUrl,
  
  // Public static routes registry
  routes: {
    home: {
      title: "NaLI — Nature & Evidence Intelligence OS",
      description: "Nature & Evidence Intelligence OS. Ubah catatan lapangan, praktikum, dan materi observasi lingkungan menjadi draf laporan terstruktur berbasis bukti secara instan dan jujur.",
    },
    learnReport: {
      title: "NaLI Learn & Report — Public Mode Panduan Belajar",
      description: "Pelajari cara menyusun laporan praktikum, observasi lingkungan, dan kegiatan lapangan dengan evidence table, uncertainty note, dan verifikasi batas bukti secara terstruktur.",
    },
    createReport: {
      title: "Buat Laporan & Kerangka Observasi — Workspace NaLI",
      description: "Mulai menyusun draf laporan lingkungan dengan template terstruktur, pengisian konteks opsional (Make It Mine), dan pengawasan kejujuran klaim akademik.",
    },
    pricing: {
      title: "Daftar Paket Laporan Beta — NaLI",
      description: "Informasi paket Laporan NaLI untuk persiapan rilis berbayar. Pembayaran dan checkout belum aktif di CP1.",
    },
    fieldIntelligence: {
      title: "Field Intelligence & Observasi Lapangan Profesional — NaLI",
      description: "Informasi roadmap Layer Profesional NaLI. Deteksi jenis satwa, Darwin Core export compliance, dan integrasi spatial PostGIS/H3 saat ini belum aktif.",
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
  ],
};
