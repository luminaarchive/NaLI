import type { JournalEntry, JurnalCover } from "@/lib/types";
import { SITE } from "@/lib/site";

type CoverInput = {
  type: JurnalCover["type"];
  title: string;
  alt: string;
  caption: string;
};

type EntryInput = Omit<JournalEntry, "id" | "cover"> & { id?: string; cover: CoverInput };

const COVER_PHRASE = "Visual penjelas, bukan foto lapangan.";

/**
 * Compact constructor for a Jurnal entry. Builds the full mandatory cover from a
 * light per-entry input: every cover is a NaLI-made non-AI explanatory visual at
 * /images/jurnal-covers/<slug>.svg, credited and pointed at the source record it
 * was built from. The `j()` here MUST stay in sync with the inlined shim in
 * scripts/load-jurnal.mjs used by the validator.
 */
export function j(entry: EntryInput): JournalEntry {
  const { slug, sourceIds, checkedAt } = entry;
  const caption = entry.cover.caption.includes(COVER_PHRASE)
    ? entry.cover.caption
    : `${entry.cover.caption} ${COVER_PHRASE}`;
  const cover: JurnalCover = {
    id: `cover-${slug}`,
    src: `/images/jurnal-covers/${slug}.svg`,
    type: entry.cover.type,
    title: entry.cover.title,
    creator: "NaLI by NatIve",
    sourceUrl: `${SITE.url}/arsip-sumber/${sourceIds[0]}`,
    license: "Internal explanatory visual for NaLI Jurnal",
    attribution: "Visual internal NaLI by NatIve, non-AI",
    caption,
    alt: entry.cover.alt,
    checkedAt,
    relatedJurnalIds: [slug],
  };
  return { ...entry, id: entry.id ?? slug, cover };
}
