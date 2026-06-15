import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ResearchMission } from "@/types/missions";

const MISSIONS_DIR = path.join(process.cwd(), "content", "missions");

/**
 * Modul 5: read research missions from local JSON. Editorial content authored by
 * NaLI describing real research gaps; contributor counts stay at their true
 * value (zero until someone contributes). Returns active missions first.
 */
export function getMissions(): ResearchMission[] {
  if (!fs.existsSync(MISSIONS_DIR)) return [];
  const missions: ResearchMission[] = [];
  for (const file of fs.readdirSync(MISSIONS_DIR)) {
    if (!file.endsWith(".json")) continue;
    try {
      missions.push(JSON.parse(fs.readFileSync(path.join(MISSIONS_DIR, file), "utf8")));
    } catch {
      /* skip malformed */
    }
  }
  return missions.sort((a, b) => {
    if (a.status !== b.status) return a.status === "aktif" ? -1 : 1;
    return a.judul.localeCompare(b.judul);
  });
}
