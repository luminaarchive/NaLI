import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getScoredLeads, type ScoredLead } from "@/lib/lab/leads";
import { getGhostSignalById, type GhostSignal } from "@/lib/lab/ghost";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/* -------------------------------------------------------------------------- */
/*  Promote a Lab lead -> public mission (Bucket C, Step 3.4).                  */
/*                                                                            */
/*  This is the ONE-DIRECTIONAL Lab -> public hand-off. The only artifact that  */
/*  ever crosses into the public site is a QUESTION ("help us find current      */
/*  evidence"), generated here. It is NEVER a claim that a species exists or is */
/*  extinct. Admin-only (or the production-impossible dev bypass for local      */
/*  verification). In dev bypass it writes a gitignored JSON mission so the     */
/*  flow is fully testable in-browser without a service key.                   */
/* -------------------------------------------------------------------------- */

const LAB_DEV_DIR = path.join(process.cwd(), "content", "missions", "_lab-dev");

function devBypass(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.LAB_DEV_BYPASS === "1";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Build the mission text from a lead. Strictly an open question: it states what
 * the open record shows and asks for current evidence, never asserting status.
 */
function buildMission(lead: ScoredLead) {
  const name = lead.commonName ? `${lead.taxonName} (${lead.commonName})` : lead.taxonName;
  const last = lead.lastRecordYear != null ? String(lead.lastRecordYear) : "tidak diketahui";
  const iucn = lead.iucnStatus ? `, status IUCN ${lead.iucnStatus}` : "";
  return {
    title: `Cari bukti terkini: ${lead.commonName || lead.taxonName}`,
    description:
      `Lab internal NaLI menandai ${name} sebagai lead untuk diselidiki. Rekaman terbuka ` +
      `terakhir yang kami temukan: ${last}${iucn}. Ini bukan klaim bahwa spesies masih ada ` +
      `atau sudah punah, melainkan pertanyaan terbuka: adakah bukti terkini yang bisa kita ` +
      `kumpulkan bersama? Bantu kami mencari foto berlisensi, observasi terverifikasi, atau ` +
      `publikasi terbaru.`,
    evidence: [
      "Observasi terverifikasi terbaru (mis. iNaturalist research-grade) dengan tanggal dan lokasi",
      "Foto atau rekaman berlisensi jelas dari individu hidup",
      `Publikasi ilmiah atau laporan lembaga setelah ${last}`,
      "Catatan lapangan atau keterangan warga yang dapat ditelusuri sumbernya",
    ],
    slug: `lab-${slugify(lead.taxonName)}`,
  };
}

const SOURCE_LABEL: Record<GhostSignal["source"], string> = {
  inaturalist: "iNaturalist",
  "xeno-canto": "Xeno-canto",
  youtube: "YouTube",
};

/**
 * Build a FIELD-VERIFICATION mission from a ghost signal. A ghost signal is the
 * softest lead of all (an unverified external anomaly), so the question is even
 * more guarded: it asks whether the anomaly is real, never asserting it is.
 */
function buildSignalMission(sig: GhostSignal) {
  const where = sig.locationLabel ? ` (${sig.locationLabel})` : "";
  const hint = sig.taxonHint ? ` Dugaan sementara: ${sig.taxonHint}, ini belum dipastikan.` : "";
  return {
    title: `Verifikasi lapangan: ${sig.title}`.slice(0, 140),
    description:
      `Lab internal NaLI menandai sebuah anomali dari ${SOURCE_LABEL[sig.source]}${where}: ` +
      `"${sig.title}". Sinyal ini belum terverifikasi dan bukan klaim apa pun.${hint} ` +
      `Pertanyaannya terbuka: benarkah ini sesuatu yang penting, dan bisakah kita kumpulkan ` +
      `bukti yang dapat diperiksa? Sumber sinyal: ${sig.url}`,
    evidence: [
      "Konfirmasi independen identitas (pakar atau observasi terverifikasi lain)",
      "Foto, audio, atau video berlisensi jelas dengan tanggal dan lokasi",
      "Catatan lapangan atau keterangan warga yang dapat ditelusuri sumbernya",
      "Publikasi atau basis data yang mendukung atau membantah anomali ini",
    ],
    slug: `lab-sinyal-${sig.source}-${sig.externalId}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60),
  };
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Asal permintaan tidak sah" }, { status: 403 });
  }

  const bypass = devBypass();

  // Auth: admin session, unless the local dev bypass is on.
  const sb = createSupabaseServerClient();
  if (!bypass) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    const { data: isAdmin, error } = await sb.rpc("is_current_user_admin");
    if (error || isAdmin !== true) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
  }

  let body: { leadId?: number; signalId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }

  // Resolve the originating artifact (a Lazarus lead OR a ghost signal) into a
  // single mission shape + which table to flip to 'promoted'.
  let mission: { title: string; description: string; evidence: string[]; slug: string };
  let leadId: number | null = null;
  let originTable: "lab_leads" | "ghost_signals" | null = null;
  let originId: number | null = null;

  if (Number.isFinite(Number(body.leadId))) {
    const { leads } = await getScoredLeads();
    const lead = leads.find((l) => l.id === Number(body.leadId));
    if (!lead) return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 });
    mission = buildMission(lead);
    leadId = lead.id;
    originTable = "lab_leads";
    originId = lead.id;
  } else if (Number.isFinite(Number(body.signalId))) {
    const sig = await getGhostSignalById(Number(body.signalId));
    if (!sig) return NextResponse.json({ error: "Sinyal tidak ditemukan" }, { status: 404 });
    mission = buildSignalMission(sig);
    originTable = "ghost_signals";
    originId = sig.id;
  } else {
    return NextResponse.json({ error: "leadId atau signalId wajib" }, { status: 400 });
  }

  const { title, description, evidence, slug } = mission;
  const href = `/misi#misi-${slug}`;

  // Dev bypass: write a gitignored JSON mission so /misi shows it locally.
  if (bypass) {
    try {
      fs.mkdirSync(LAB_DEV_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(LAB_DEV_DIR, `${slug}.json`),
        JSON.stringify(
          {
            id: slug,
            judul: title,
            deskripsi: description,
            status: "aktif",
            progressPercentage: 0,
            kebutuhanBukti: evidence,
            kontributor: { peneliti: 0, pembaca: 0, penerjemah: 0 },
            logSubmission: [],
            source: "lab",
            leadId,
          },
          null,
          2,
        ),
      );
      return NextResponse.json({ ok: true, id: slug, href, mode: "dev" });
    } catch (e) {
      return NextResponse.json(
        { error: `Gagal menulis misi lokal: ${(e as Error).message}` },
        { status: 500 },
      );
    }
  }

  // Production / real admin: upsert into missions (idempotent by id), then
  // best-effort flip the originating lead/signal to 'promoted'.
  const { error: upsertErr } = await sb.from("missions").upsert(
    {
      id: slug,
      title,
      description,
      status: "active",
      source: "lab",
      lead_id: leadId,
      evidence_needed: evidence,
      progress: 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }
  if (originTable && originId != null) {
    await sb.from(originTable).update({ status: "promoted" }).eq("id", originId);
  }

  return NextResponse.json({ ok: true, id: slug, href, mode: "db" });
}
