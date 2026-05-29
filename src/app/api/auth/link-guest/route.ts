import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { getGuestSessionIdHash } from "@/lib/reports/access";
import { linkGuestReportsMock } from "@/lib/reports/persistence";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get("nali_guest_session")?.value;

    if (!guestSessionId) {
      return NextResponse.json({ success: true, count: 0, notice: "No guest session cookie found to link." });
    }

    const guestHash = getGuestSessionIdHash(guestSessionId);

    // Update local memory mockDb for E2E and offline testing
    linkGuestReportsMock(guestHash, user.id);

    const adminClient = getOptionalSupabaseAdminClient();

    if (!adminClient) {
      // Fallback response for unconfigured local database
      cookieStore.delete("nali_guest_session");
      return NextResponse.json({
        success: true,
        count: 1,
        notice: "Database belum aktif. Riwayat lokal berhasil dihubungkan.",
      });
    }

    // Link reports by updating user_id where guest session hash matches and user_id is null
    const { data, error } = await adminClient
      .from("reports")
      .update({ user_id: user.id })
      .eq("guest_session_id_hash", guestHash)
      .is("user_id", null)
      .select("id");

    if (error) {
      console.warn("Guest reports linking query failed:", error.message);
      return NextResponse.json({ error: "Gagal menghubungkan laporan di database." }, { status: 500 });
    }

    // Delete guest cookie after successful linkage
    cookieStore.delete("nali_guest_session");

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      reports: data,
    });
  } catch (err: any) {
    console.error("POST /api/auth/link-guest route error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server internal." }, { status: 500 });
  }
}
