import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ResearchMission } from "@/types/missions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MISSIONS_DIR = path.join(process.cwd(), "content", "missions");
// Dev-only sink for missions promoted from the Lab while testing without a real
// admin session / DB write (see app/api/lab/promote). Gitignored, non-prod only.
const LAB_DEV_DIR = path.join(MISSIONS_DIR, "_lab-dev");

/**
 * Coerce any partial/loose mission object into a fully-formed ResearchMission
 * with safe defaults. The /misi page reads nested fields (kontributor.*,
 * kebutuhanBukti.map, judul.localeCompare) directly, so a single missing field
 * from the DB or a hand-edited JSON seed must never be able to crash the render.
 */
function normalizeMission(raw: Partial<ResearchMission> & { id: string }): ResearchMission {
  const k = raw.kontributor ?? { peneliti: 0, pembaca: 0, penerjemah: 0 };
  return {
    id: String(raw.id),
    judul: typeof raw.judul === "string" && raw.judul.trim() ? raw.judul : "Misi tanpa judul",
    deskripsi: typeof raw.deskripsi === "string" ? raw.deskripsi : "",
    status: raw.status === "selesai" ? "selesai" : "aktif",
    progressPercentage: Number.isFinite(raw.progressPercentage as number)
      ? (raw.progressPercentage as number)
      : 0,
    kebutuhanBukti: Array.isArray(raw.kebutuhanBukti) ? raw.kebutuhanBukti.filter(Boolean) : [],
    kontributor: {
      peneliti: Number.isFinite(k.peneliti) ? k.peneliti : 0,
      pembaca: Number.isFinite(k.pembaca) ? k.pembaca : 0,
      penerjemah: Number.isFinite(k.penerjemah) ? k.penerjemah : 0,
    },
    logSubmission: Array.isArray(raw.logSubmission) ? raw.logSubmission : [],
    source: raw.source === "lab" ? "lab" : "editorial",
    leadId: raw.leadId ?? null,
  };
}

/** Read + parse every *.json mission in a directory (non-recursive). */
function readJsonMissions(dir: string): ResearchMission[] {
  if (!fs.existsSync(dir)) return [];
  const out: ResearchMission[] = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    try {
      const m = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as Partial<ResearchMission>;
      if (!m || !m.id) continue;
      out.push(normalizeMission({ source: "editorial", ...m, id: String(m.id) }));
    } catch {
      /* skip malformed */
    }
  }
  return out;
}

/** Map a DB row (English status, snake_case) to the public ResearchMission. */
function mapDbRow(row: Record<string, unknown>): ResearchMission {
  return normalizeMission({
    id: String(row.id),
    judul: row.title as string,
    deskripsi: row.description as string,
    status: row.status === "closed" ? "selesai" : "aktif",
    progressPercentage: (row.progress as number) ?? 0,
    kebutuhanBukti: Array.isArray(row.evidence_needed) ? (row.evidence_needed as string[]) : [],
    // DB missions do not track contributors yet; report the honest zero state.
    kontributor: { peneliti: 0, pembaca: 0, penerjemah: 0 },
    logSubmission: [],
    source: (row.source as "editorial" | "lab") ?? "editorial",
    leadId: (row.lead_id as number | null) ?? null,
  });
}

/** Missions from the DB (public read). [] if the table is empty/unreachable. */
async function getDbMissions(): Promise<ResearchMission[]> {
  try {
    const sb = createSupabaseServerClient();
    const { data, error } = await sb.from("missions").select("*");
    if (error || !Array.isArray(data)) return [];
    return data.map(mapDbRow);
  } catch {
    return [];
  }
}

/**
 * Modul 5 + Step 3.4: research missions, DB-backed with a static-JSON fallback.
 *
 * Source order (deduped by id, first wins): DB rows -> editorial JSON seeds ->
 * (non-production only) locally promoted Lab missions. The JSON seeds guarantee
 * /misi never renders empty even if the table is unreachable. Active first.
 */
export async function getMissions(): Promise<ResearchMission[]> {
  const byId = new Map<string, ResearchMission>();
  const add = (list: ResearchMission[]) => {
    for (const m of list) if (m.id && !byId.has(m.id)) byId.set(m.id, m);
  };

  add(await getDbMissions());
  add(readJsonMissions(MISSIONS_DIR));
  if (process.env.NODE_ENV !== "production") add(readJsonMissions(LAB_DEV_DIR));

  return [...byId.values()].sort((a, b) => {
    if (a.status !== b.status) return a.status === "aktif" ? -1 : 1;
    return a.judul.localeCompare(b.judul);
  });
}
