import "server-only";
import fs from "node:fs";
import path from "node:path";
import { EMPTY_GRAPH, type GraphData } from "./types";

/**
 * Load the cached evidence graph (Doctrine v2.1, Part 3).
 *
 * The graph is generated from the DB + MDX by scripts/generate-graph.mjs at
 * build/sync time and written to public/graph-data.json. At request time (Vercel
 * filesystem is read-only) we only READ that cache. Missing cache degrades to an
 * empty graph so nothing crashes.
 */

const CACHE_PATH = path.join(process.cwd(), "public", "graph-data.json");
const ONE_HOUR_MS = 60 * 60 * 1000;

let memo: { data: GraphData; readAt: number } | null = null;

export function loadGraphData(): GraphData {
  // small in-process memo so repeated reads in one request are cheap
  if (memo && Date.now() - memo.readAt < 5000) return memo.data;
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw) as GraphData;
    memo = { data, readAt: Date.now() };
    return data;
  } catch {
    return EMPTY_GRAPH;
  }
}

/** True when the cached graph is older than one hour (advisory; regen runs in the pipeline). */
export function graphIsStale(data: GraphData): boolean {
  const t = new Date(data.meta.generatedAt).getTime();
  return Number.isNaN(t) || Date.now() - t > ONE_HOUR_MS;
}
