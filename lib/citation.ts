import { SITE } from "./site";

export type CitationFormat = "apa" | "mla" | "chicago" | "bibtex" | "ris";

export const CITATION_FORMATS: { id: CitationFormat; label: string }[] = [
  { id: "apa", label: "APA" },
  { id: "mla", label: "MLA" },
  { id: "chicago", label: "Chicago" },
  { id: "bibtex", label: "BibTeX" },
  { id: "ris", label: "RIS" },
];

export interface Citable {
  title: string;
  slug: string;
  /** ISO date string. */
  date: string;
  /** Path prefix: "articles" or "jurnal". */
  kind?: "articles" | "jurnal";
  /** Optional external authors (for jurnal); defaults to NaLI. */
  authors?: string[];
}

const AUTHOR = "NaLI";

function accessedID(): string {
  return new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Academic citation generator (F5.1) for articles and jurnal items. Five
 * formats with copy + download support in the UI. NaLI is the author/publisher
 * for its own articles; external authors can be passed for jurnal records.
 */
export function generateCitation(item: Citable, format: CitationFormat): string {
  const year = new Date(item.date).getFullYear() || new Date().getFullYear();
  const url = `${SITE.url}/${item.kind ?? "articles"}/${item.slug}`;
  const author = item.authors?.length ? item.authors.join(", ") : AUTHOR;
  const accessed = accessedID();

  switch (format) {
    case "apa":
      return `${author}. (${year}). ${item.title}. ${SITE.name}. ${url}`;

    case "mla":
      return `"${item.title}." ${SITE.name}, ${year}, ${url}. Diakses ${accessed}.`;

    case "chicago":
      return `${author}. "${item.title}." ${SITE.name}, ${year}. ${url}.`;

    case "bibtex": {
      const key = `nali${year}${item.slug.replace(/[^a-z0-9]/gi, "")}`;
      return `@misc{${key},
  author    = {${author}},
  title     = {${item.title}},
  year      = {${year}},
  publisher = {${SITE.name}},
  url       = {${url}},
  note      = {Jurnal riset terbuka. Diakses ${accessed}}
}`;
    }

    case "ris":
      return [
        "TY  - ELEC",
        `AU  - ${author}`,
        `TI  - ${item.title}`,
        `PY  - ${year}`,
        `PB  - ${SITE.name}`,
        `UR  - ${url}`,
        `Y2  - ${accessed}`,
        "ER  - ",
      ].join("\n");
  }
}

/** File extension + MIME for the downloadable formats. */
export function citationFile(format: CitationFormat): { ext: string; mime: string } | null {
  if (format === "bibtex") return { ext: "bib", mime: "application/x-bibtex" };
  if (format === "ris") return { ext: "ris", mime: "application/x-research-info-systems" };
  return null;
}
