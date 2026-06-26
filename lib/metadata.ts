import type { Metadata } from "next";
import { SITE } from "./site";

/* -------------------------------------------------------------------------- */
/*  Shared metadata builder for all NaLI content pages                         */
/*  Generates consistent OG / Twitter Card tags + dynamic OG image URL.        */
/* -------------------------------------------------------------------------- */

export interface ContentMetadataInput {
  title: string;
  description: string;
  /** URL path without origin, e.g. "/articles/krakatau" */
  path: string;
  /** Content pillar or type label for the OG image badge */
  category: string;
  /** ISO date string */
  date?: string;
  /** Additional OG tags array */
  tags?: string[];
  /** Override image URL (skips dynamic OG route) */
  imageOverride?: string;
}

/**
 * Build a complete Next.js `Metadata` object for a content page.
 *
 * Uses the dynamic `/api/og` route to guarantee a branded preview image
 * even when the content has no cover photo.
 */
export function buildContentMetadata({
  title,
  description,
  path,
  category,
  date,
  tags,
  imageOverride,
}: ContentMetadataInput): Metadata {
  const ogImageUrl =
    imageOverride ??
    `/api/og?${new URLSearchParams({
      title,
      category,
      ...(date ? { date } : {}),
    }).toString()}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      type: "article",
      ...(date ? { publishedTime: date } : {}),
      ...(tags?.length ? { tags } : {}),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
