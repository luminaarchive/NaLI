// GET /api/projects — list user projects
// POST /api/projects — create project
import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ projects: [] });

    const { data: projects } = await supabase
      .from("nali_projects")
      .select("id, name, description, mountain_context, is_pinned, session_count, created_at, updated_at")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(50);

    return Response.json({ projects: projects ?? [] });
  } catch {
    return Response.json({ projects: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Login diperlukan" }, { status: 401 });

    const body = await req.json();
    const { name, description, instructions, mountain_context } = body;

    if (!name?.trim()) {
      return Response.json({ error: "Nama proyek diperlukan" }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from("nali_projects")
      .insert({
        user_id: user.id,
        name: name.trim().slice(0, 100),
        description: description?.trim().slice(0, 300) ?? null,
        instructions: instructions?.trim().slice(0, 1000) ?? null,
        mountain_context: mountain_context ?? null,
      })
      .select("id, name, description, mountain_context, is_pinned, session_count, created_at")
      .single();

    if (error) return Response.json({ error: "Gagal membuat proyek" }, { status: 500 });

    return Response.json({ project });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
