import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/articles",
    "/alam",
    "/sejarah",
    "/investigasi",
    "/catatan-lapangan",
    "/arsip-sumber",
    "/peta-eksplorasi",
    "/manifesto",
    "/tentang",
    "/kontak",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const articles = getAllArticles().map((article) => ({
    url: `${SITE.url}/articles/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...routes, ...articles];
}
