import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getAllArticles, getAllSources } from "./content";
import { getAllPublications } from "./jurnal";
import type { LivingStats } from "@/types/living-engine";

const MISSIONS_DIR = path.join(process.cwd(), "content", "missions");
const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Count active research missions if Modul 5 content exists yet. Returns 0
 * cleanly when the directory or files are absent, so the dashboard never shows
 * an invented number.
 */
function countActiveMissions(): number {
  try {
    if (!fs.existsSync(MISSIONS_DIR)) return 0;
    let active = 0;
    for (const file of fs.readdirSync(MISSIONS_DIR)) {
      if (!file.endsWith(".json")) continue;
      try {
        const mission = JSON.parse(fs.readFileSync(path.join(MISSIONS_DIR, file), "utf8"));
        if (mission?.status === "aktif") active++;
      } catch {
        /* skip malformed mission file */
      }
    }
    return active;
  } catch {
    return 0;
  }
}

/**
 * Live snapshot of the evidence base for the Living Knowledge Engine dashboard
 * (Modul 1). Reads real content only; no hardcoded or fabricated figures.
 */
export async function getLivingStats(): Promise<LivingStats> {
  const articles = await getAllArticles();
  const sources = getAllSources();
  const publications = getAllPublications();
  const today = todayIso();

  const totalArsip = sources.length;
  const totalJurnal = publications.length;
  const totalInvestigasi = articles.filter(
    (a) => a.category === "investigasi" && a.status === "published",
  ).length;
  const buktiDicariCount = articles.filter(
    (a) => a.status === "published" && a.confidence !== "high",
  ).length;

  // Activity today: anything verified, updated, dated, or logged on today's date.
  const sourcesToday = sources.filter((s) => s.checkedAt === today).length;
  const pubsToday = publications.filter((p) => p.checkedAt === today).length;
  const articlesToday = articles.filter(
    (a) =>
      a.updated === today ||
      a.date === today ||
      (a.changelog ?? []).some((c) => c.tanggal === today),
  ).length;
  const revisiHariIniCount = sourcesToday + pubsToday + articlesToday;

  // Most recent activity date across the whole evidence base.
  const allDates = [
    ...sources.map((s) => s.checkedAt),
    ...publications.map((p) => p.checkedAt),
    ...articles.flatMap((a) => [
      a.updated,
      a.date,
      ...(a.changelog ?? []).map((c) => c.tanggal),
    ]),
  ]
    .filter((d): d is string => Boolean(d))
    .sort();
  const lastUpdated = allDates.length ? allDates[allDates.length - 1] : today;

  return {
    totalSumber: totalArsip + totalJurnal,
    totalJurnal,
    totalArsip,
    totalInvestigasi,
    misiAktifCount: countActiveMissions(),
    buktiDicariCount,
    kontributorAktifCount: 0,
    revisiHariIniCount,
    lastUpdated,
  };
}
