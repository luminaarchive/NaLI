import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { getGuestSessionIdHash } from "@/lib/reports/access";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get("nali_guest_session")?.value;

    const adminClient = getOptionalSupabaseAdminClient();

    if (!adminClient) {
      // Database unconfigured: return empty list
      return NextResponse.json({ reports: [] });
    }

    let query = adminClient
      .from("reports")
      .select("id, mode, status, created_at, input, output, user_id");

    if (user) {
      // User authenticated: load user-owned reports, or guest-owned reports matching guest session hash (before linking)
      if (guestSessionId) {
        const guestHash = getGuestSessionIdHash(guestSessionId);
        query = query.or(`user_id.eq.${user.id},and(guest_session_id_hash.eq.${guestHash},user_id.is.null)`);
      } else {
        query = query.eq("user_id", user.id);
      }
    } else {
      // Guest: load reports matching guest session hash only
      if (guestSessionId) {
        const guestHash = getGuestSessionIdHash(guestSessionId);
        query = query.eq("guest_session_id_hash", guestHash).is("user_id", null);
      } else {
        return NextResponse.json({ reports: [] });
      }
    }

    const { data: reports, error } = await query
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.warn("Error fetching reports from database:", error.message);
      return NextResponse.json({ reports: [] });
    }

    const formattedReports = (reports || []).map((r) => {
      const reportOutput = r.output as any;
      const reportInput = r.input as any;
      return {
        id: r.id,
        title: reportOutput?.title || reportInput?.title || "Laporan Tanpa Judul",
        mode: r.mode,
        status: r.status,
        created_at: new Date(r.created_at).toLocaleDateString("id-ID"),
        is_linked: !!r.user_id,
      };
    });

    return NextResponse.json({ reports: formattedReports });
  } catch (err: any) {
    console.error("GET /api/reports handler error:", err);
    return NextResponse.json({ reports: [] });
  }
}
