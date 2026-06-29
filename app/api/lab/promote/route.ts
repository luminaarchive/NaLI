import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getScoredLeads, type ScoredLead } from "@/lib/lab/leads";

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

  let body: { leadId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }
  const leadId = Number(body.leadId);
  if (!Number.isFinite(leadId)) {
    return NextResponse.json({ error: "leadId tidak valid" }, { status: 400 });
  }

  const { leads } = await getScoredLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 });

  const slug = `lab-${slugify(lead.taxonName)}`;
  const { title, description, evidence } = buildMission(lead);
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
            leadId: lead.id,
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

  // Production / real admin: upsert into the missions table (idempotent by id),
  // then best-effort flip the lead to 'promoted'.
  const { error: upsertErr } = await sb.from("missions").upsert(
    {
      id: slug,
      title,
      description,
      status: "active",
      source: "lab",
      lead_id: lead.id,
      evidence_needed: evidence,
      progress: 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }
  await sb.from("lab_leads").update({ status: "promoted" }).eq("id", lead.id);

  return NextResponse.json({ ok: true, id: slug, href, mode: "db" });
}
