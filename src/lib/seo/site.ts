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
  "NaLI membantu mengubah catatan, sumber, dan data lapangan menjadi draft laporan berbasis bukti dengan evidence table, uncertainty note, dan human review.";

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
          description: "Planned beta pricing; payment is not live.",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "NaLI",
        url: siteUrl,
        description: "Indonesia-first evidence-based learning, reporting, and biodiversity field intelligence project.",
      },
    ],
  };
}
