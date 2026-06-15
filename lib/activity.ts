import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getAllArticles, getAllSources } from "./content";
import { getAllPublications } from "./jurnal";

export interface ActivityLine {
  kind: "jurnal" | "arsip" | "artikel";
  count: number;
  examples: string[];
}

export interface ActivityDay {
  tanggal: string;
  lines: ActivityLine[];
}

const PROGRESS = path.join(process.cwd(), "content", "logs", "progress.json");

/**
 * Modul 7: a research/discovery feed built from real content activity. Items are
 * grouped by their verification/update date, and within a day summarised by kind
 * with a few example titles, so a bulk pipeline day reads as one honest line
 * ("306 jurnal terverifikasi") rather than 306 noisy rows.
 */
export async function getActivityFeed(maxDays = 14): Promise<ActivityDay[]> {
  const articles = await getAllArticles();
  const sources = getAllSources();
  const publications = getAllPublications();

  // date -> kind -> titles
  const byDate = new Map<string, Map<ActivityLine["kind"], string[]>>();
  const push = (date: string | undefined, kind: ActivityLine["kind"], title: string) => {
    if (!date) return;
    if (!byDate.has(date)) byDate.set(date, new Map());
    const k = byDate.get(date)!;
    if (!k.has(kind)) k.set(kind, []);
    k.get(kind)!.push(title);
  };

  for (const s of sources) push(s.checkedAt, "arsip", s.title);
  for (const p of publications) push(p.checkedAt, "jurnal", p.title);
  for (const a of articles) {
    push(a.updated ?? a.date, "artikel", a.title);
    for (const c of a.changelog ?? []) push(c.tanggal, "artikel", `${a.title}: ${c.deskripsi}`);
  }

  const days: ActivityDay[] = [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, maxDays)
    .map(([tanggal, kinds]) => ({
      tanggal,
      lines: [...kinds.entries()].map(([kind, titles]) => ({
        kind,
        count: titles.length,
        examples: titles.slice(0, 3),
      })),
    }));

  return days;
}

export interface PipelineCheckpoint {
  batch: number;
  at: string;
  addedJurnal: number;
  addedSources: number;
}

/** Reads the Fase 7 pipeline checkpoint, if present, for the feed footer. */
export function getPipelineCheckpoints(): PipelineCheckpoint[] {
  try {
    const prog = JSON.parse(fs.readFileSync(PROGRESS, "utf8"));
    return Array.isArray(prog?.batches) ? prog.batches : [];
  } catch {
    return [];
  }
}
