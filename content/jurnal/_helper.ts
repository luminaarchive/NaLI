import type { JournalEntry } from "@/lib/types";

/**
 * Compact constructor for a Jurnal entry. `id` defaults to `slug`, and
 * `checkedAt` defaults to the cluster-wide value passed by the author.
 * Every entry must still pass scripts/validate-editorial-content.mjs.
 */
export function j(entry: Omit<JournalEntry, "id"> & { id?: string }): JournalEntry {
  return { ...entry, id: entry.id ?? entry.slug };
}
