// GET /api/skills — returns builtin skills + user's custom skills
import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: skills, error } = await supabase
      .from("nali_skills")
      .select("id, name, description, prompt_template, category, icon_emoji, is_builtin, usage_count")
      .or(`is_builtin.eq.true${user ? `,user_id.eq.${user.id}` : ""}`)
      .order("is_builtin", { ascending: false })
      .order("usage_count", { ascending: false });

    if (error) {
      return Response.json({ skills: [] });
    }

    return Response.json({ skills: skills ?? [] });
  } catch {
    return Response.json({ skills: [] });
  }
}
