// src/app/api/sessions/[sessionId]/route.ts
// GET /api/sessions/[sessionId] — returns session + messages (server-only fields stripped)

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
    try {
      supabase = await createServerSupabaseClient();
    } catch {
      return Response.json({ error: "Database tidak tersedia" }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: session, error } = await supabase
      .from("nali_sessions")
      .select(
        `
        id,
        user_id,
        title,
        first_query,
        message_count,
        created_at,
        updated_at,
        is_archived,
        nali_messages (
          id,
          role,
          content,
          created_at,
          position,
          has_error,
          error_message
        )
      `,
      )
      .eq("id", sessionId)
      .order("position", { referencedTable: "nali_messages", ascending: true })
      .single();

    if (error || !session) {
      return Response.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    // Security: only owner can view their session
    if (session.user_id !== null && session.user_id !== user?.id) {
      return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
    }

    // Strip server-only fields — model_slug, tokens_used, generation_ms
    // are intentionally excluded from the select above
    const messages = Array.isArray(session.nali_messages) ? session.nali_messages : [];
    const safeSession = {
      id: session.id,
      user_id: session.user_id,
      title: session.title,
      first_query: session.first_query,
      message_count: session.message_count,
      created_at: session.created_at,
      updated_at: session.updated_at,
      is_archived: session.is_archived,
      nali_messages: messages.map(
        (m: {
          id: string;
          role: string;
          content: string;
          created_at: string;
          position: number;
          has_error: boolean;
          error_message: string | null;
        }) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.created_at,
          position: m.position,
          hasError: m.has_error,
          errorMessage: m.error_message,
        }),
      ),
    };

    return Response.json(safeSession);
  } catch (err) {
    console.error("Session GET error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
