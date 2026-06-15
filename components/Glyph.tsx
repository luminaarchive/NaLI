import type { PublicationType, SourceType } from "@/lib/types";

/**
 * Small monoline icon set (single stroke, currentColor), a consistent NaLI
 * glyph vocabulary for type tags and admin nav, replacing ad-hoc characters.
 */
export type GlyphName =
  | "article"
  | "report"
  | "book"
  | "dataset"
  | "archive"
  | "museum"
  | "media"
  | "doc"
  | "dashboard"
  | "stats"
  | "plus"
  | "external"
  | "logout";

const PATHS: Record<GlyphName, React.ReactNode> = {
  article: (
    <>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6M9 8h2" />
    </>
  ),
  report: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="1" />
      <path d="M9 4a3 3 0 0 1 6 0M9 11h6M9 15h4" />
    </>
  ),
  book: (
    <>
      <path d="M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" />
      <path d="M16 6h3v14h-7" />
    </>
  ),
  dataset: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </>
  ),
  archive: (
    <>
      <rect x="4" y="4" width="16" height="4" rx="0.5" />
      <path d="M5 8v12h14V8M10 12h4" />
    </>
  ),
  museum: (
    <>
      <path d="M4 9 12 4l8 5M5 9v9M9 9v9M15 9v9M19 9v9M3 21h18" />
    </>
  ),
  media: (
    <>
      <circle cx="7" cy="17" r="2.5" />
      <path d="M9.5 17V5l9-2v11M9.5 9l9-2" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M13 3v4h4" />
    </>
  ),
  dashboard: (
    <>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </>
  ),
  stats: (
    <>
      <path d="M4 20h16M7 20v-7M12 20V6M17 20v-10" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9M18 13v6H5V6h6" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="M9 12h12M18 9l3 3-3 3" />
    </>
  ),
};

export function Glyph({
  name,
  className = "h-3.5 w-3.5",
}: {
  name: GlyphName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}

const PUB_GLYPH: Record<PublicationType, GlyphName> = {
  journal_article: "article",
  report: "report",
  book: "book",
  monograph: "book",
  proceeding: "article",
  dataset: "dataset",
  archive_record: "archive",
  museum_record: "museum",
  institutional_document: "report",
};

const SOURCE_GLYPH: Record<SourceType, GlyphName> = {
  jurnal: "article",
  arsip: "archive",
  buku: "book",
  media: "media",
  laporan: "report",
  lainnya: "doc",
};

export const glyphForPublicationType = (t: PublicationType): GlyphName => PUB_GLYPH[t];
export const glyphForSourceType = (t: SourceType): GlyphName => SOURCE_GLYPH[t];
