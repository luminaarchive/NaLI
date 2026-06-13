import type { RawPublication } from "@/lib/types";

/** Compact constructor for a publication record; id defaults to slug. */
export function p(entry: Omit<RawPublication, "id"> & { id?: string }): RawPublication {
  return { ...entry, id: entry.id ?? entry.slug };
}
