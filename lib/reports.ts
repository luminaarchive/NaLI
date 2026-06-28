import { createSupabaseServerClient } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/*  Citizen reports data layer (Bucket B, Step 2.3)                            */
/*                                                                            */
/*  Reads the `citizen_reports` table (migration 0008). RLS keeps reports      */
/*  PRIVATE: anon can only INSERT (via /api/report); only an admin session     */
/*  (private.is_admin()) can read/triage. Nothing here is public.              */
/* -------------------------------------------------------------------------- */

export type CitizenReportStatus = "baru" | "ditinjau" | "terverifikasi" | "ditolak";

export interface CitizenReport {
  id: number;
  subject: string;
  description: string;
  locationLabel: string | null;
  lat: number | null;
  lng: number | null;
  photoUrl: string | null;
  reporterName: string | null;
  reporterContact: string | null;
  missionId: string | null;
  status: CitizenReportStatus;
  adminNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

function mapRow(row: Record<string, unknown>): CitizenReport {
  return {
    id: row.id as number,
    subject: row.subject as string,
    description: row.description as string,
    locationLabel: (row.location_label as string | null) ?? null,
    lat: (row.lat as number | null) ?? null,
    lng: (row.lng as number | null) ?? null,
    photoUrl: (row.photo_url as string | null) ?? null,
    reporterName: (row.reporter_name as string | null) ?? null,
    reporterContact: (row.reporter_contact as string | null) ?? null,
    missionId: (row.mission_id as string | null) ?? null,
    status: row.status as CitizenReportStatus,
    adminNotes: (row.admin_notes as string | null) ?? null,
    createdAt: row.created_at as string,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
  };
}

/**
 * All reports for the admin triage screen, newest first. Returns [] for
 * non-admins (RLS) or on error.
 */
export async function getAllReports(): Promise<CitizenReport[]> {
  try {
    const sb = createSupabaseServerClient();
    const { data, error } = await sb
      .from("citizen_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

/** Update a report's triage status (+ optional notes). Admin only (RLS). */
export async function setReportStatus(
  id: number,
  status: CitizenReportStatus,
  adminNotes?: string,
): Promise<boolean> {
  try {
    const sb = createSupabaseServerClient();
    const patch: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) patch.admin_notes = adminNotes;
    const { error } = await sb.from("citizen_reports").update(patch).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
