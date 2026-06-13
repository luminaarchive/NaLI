import type { RawPublication } from "@/lib/types";
import { publicationsBatch1 } from "./publications/batch-1";

/**
 * Master list of Jurnal publication records (real external journals, reports,
 * datasets, and archives). Covers are attached at load time from pub-covers.json.
 * Add new batches as separate files under ./publications and register them here.
 */
export const publications: RawPublication[] = [...publicationsBatch1];
