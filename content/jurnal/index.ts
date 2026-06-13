import type { RawJournalEntry } from "@/lib/types";
import { satwaEndemik } from "./clusters/satwa-endemik";
import { geologiGunungApi } from "./clusters/geologi-gunung-api";
import { lautHutanIklim } from "./clusters/laut-hutan-iklim";

/**
 * Master list of Jurnal entries. Each cluster is a separate file so batches can
 * be added without touching the rest. The loader in lib/jurnal.ts de-duplicates
 * by slug and sorts; the validator enforces source resolution and quality.
 */
export const journalEntries: RawJournalEntry[] = [
  ...satwaEndemik,
  ...geologiGunungApi,
  ...lautHutanIklim,
];
