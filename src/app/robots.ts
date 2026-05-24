import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: siteMetadata.noindexPatterns,
      },
    ],
    sitemap: `${siteMetadata.canonicalBase}/sitemap.xml`,
    host: siteMetadata.canonicalBase,
  };
}
