import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ notes: [] });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("project_id");
    const mountain = searchParams.get("mountain");

    let query = supabase
      .from("nali_field_notes")
      .select("id, title, location_name, mountain_context, elevation_m, raw_notes, weather_notes, habitat_type, observed_at, created_at, is_processed")
      .eq("user_id", user.id)
      .order("observed_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (projectId) query = query.eq("project_id", projectId);
    if (mountain) query = query.eq("mountain_context", mountain);

    const { data: notes } = await query;
    return Response.json({ notes: notes ?? [] });
  } catch {
    return Response.json({ notes: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Login diperlukan" }, { status: 401 });

    const body = await req.json();
    const {
      title, raw_notes, location_name, mountain_context,
      elevation_m, latitude, longitude, weather_notes,
      habitat_type, observed_at, project_id, session_id,
    } = body;

    if (!title?.trim() || !raw_notes?.trim()) {
      return Response.json({ error: "Judul dan catatan diperlukan" }, { status: 400 });
    }

    const { data: note, error } = await supabase
      .from("nali_field_notes")
      .insert({
        user_id: user.id,
        title: title.trim().slice(0, 200),
        raw_notes: raw_notes.trim().slice(0, 5000),
        location_name: location_name?.trim() ?? null,
        mountain_context: mountain_context ?? null,
        elevation_m: elevation_m ? parseInt(elevation_m) : null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        weather_notes: weather_notes?.trim() ?? null,
        habitat_type: habitat_type ?? null,
        observed_at: observed_at ?? null,
        project_id: project_id ?? null,
        session_id: session_id ?? null,
      })
      .select("id, title, location_name, mountain_context, created_at")
      .single();

    if (error) return Response.json({ error: "Gagal menyimpan catatan" }, { status: 500 });
    return Response.json({ note });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
