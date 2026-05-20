export const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://naliai.vercel.app";

export const seoKeywords = [
  "NaLI",
  "aplikasi laporan lapangan berbasis bukti",
  "field report generator Indonesia",
  "evidence-based academic report Indonesia",
  "draft laporan berbasis bahan",
  "laporan observasi lingkungan",
  "evidence table",
  "uncertainty note",
  "biodiversity intelligence Indonesia",
  "conservation field software Indonesia",
  "sistem observasi satwa Indonesia",
];

export const siteDescription =
  "NaLI membantu menyusun draf laporan atau panduan mulai dari catatan, topik, lokasi, dan sumber tanpa mengarang data atau sitasi.";

export function buildJsonLdGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "NaLI",
        url: siteUrl,
        description: siteDescription,
        inLanguage: ["id", "en"],
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: "NaLI",
        applicationCategory: "ScienceApplication",
        operatingSystem: "Web",
        url: siteUrl,
        description: siteDescription,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IDR",
          availability: "https://schema.org/PreOrder",
          description: "Harga beta disiapkan bertahap. Payment gateway belum aktif di MVP ini.",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "NaLI",
        url: siteUrl,
        description: "Produk Indonesia-first untuk draf laporan berbasis bahan, panduan mulai, dan workflow bukti yang direview manusia.",
      },
    ],
  };
}
