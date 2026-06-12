import type { MetadataRoute } from "next";
import { getAllArticles, getAllSources } from "@/lib/content";
import { getAllJournalEntries } from "@/lib/jurnal";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/articles",
    "/jurnal",
    "/seri",
    "/alam",
    "/sejarah",
    "/investigasi",
    "/catatan-lapangan",
    "/arsip-sumber",
    "/peta-eksplorasi",
    "/metodologi",
    "/pedoman-sumber",
    "/lisensi-foto",
    "/koreksi",
    "/manifesto",
    "/tentang",
    "/kontak",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const articles = (await getAllArticles()).map((article) => ({
    url: `${SITE.url}/articles/${article.slug}`,
    lastModified: new Date(article.updated ?? article.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const sources = getAllSources().map((source) => ({
    url: `${SITE.url}/arsip-sumber/${source.slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));

  const jurnal = getAllJournalEntries().map((entry) => ({
    url: `${SITE.url}/jurnal/${entry.slug}`,
    lastModified: new Date(entry.checkedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...routes, ...articles, ...sources, ...jurnal];
}
