import type { RawJournalEntry } from "@/lib/types";

/**
 * Compact constructor for a raw Jurnal entry. `id` defaults to `slug`. The
 * mandatory cover is NOT authored here: it is resolved at load time from the
 * covers manifest (content/jurnal/covers.json), which is built by
 * scripts/build-jurnal-covers.mjs from real, license-verified source visuals.
 */
export function j(entry: Omit<RawJournalEntry, "id"> & { id?: string }): RawJournalEntry {
  return { ...entry, id: entry.id ?? entry.slug };
}
