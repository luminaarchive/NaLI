import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = siteMetadata.canonicalBase;

  return [
    {
      url: `${base}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/learn-report`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/create-report`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/field-intelligence`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
