// src/app/api/sessions/route.ts
// POST /api/sessions — creates a new session and streams the first AI response via SSE
// GET  /api/sessions — lists current user's sessions

import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateSessionResponse } from "@/lib/sessions/sessionGeneration";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";

/**
 * Stream text content as SSE deltas in word-sized chunks (typewriter effect).
 */
function* chunkText(text: string, chunkSize = 4): Generator<string> {
  const words = text.split(/(\s+)/);
  let buffer = "";
  for (const word of words) {
    buffer += word;
    if (buffer.split(/\s+/).filter(Boolean).length >= chunkSize) {
      yield buffer;
      buffer = "";
    }
  }
  if (buffer) {
    yield buffer;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { query?: string };
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    const trimmedQuery = query.trim().slice(0, 2000);

    // Rate limiting
    const rateLimit = await checkRateLimit({
      actionType: "generate_report",
      request: req,
    });

    if (!rateLimit.allowed) {
      return Response.json(
        {
          error: RATE_LIMITED_MESSAGE,
          code: "RATE_LIMIT",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429, headers: rateLimitHeaders(rateLimit) },
      );
    }

    // Create Supabase client
    let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
    try {
      supabase = await createServerSupabaseClient();
    } catch {
      return Response.json({ error: "Database tidak tersedia" }, { status: 503 });
    }

    // Get current user (may be null for anonymous)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Create session in Supabase
    const { data: session, error: sessionError } = await supabase
      .from("nali_sessions")
      .insert({
        user_id: user?.id ?? null,
        first_query: trimmedQuery,
        title: trimmedQuery.slice(0, 80),
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("Session creation error:", sessionError);
      // Graceful fallback — table might not exist yet
      return Response.json(
        { error: "Gagal membuat sesi. Tabel mungkin belum tersedia.", fallback: true },
        { status: 500 },
      );
    }

    const sessionId = session.id as string;

    // Save user message
    await supabase.from("nali_messages").insert({
      session_id: sessionId,
      role: "user",
      content: trimmedQuery,
      position: 0,
    });

    // Set up SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function send(chunk: object) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          } catch {
            // Controller may be closed
          }
        }

        try {
          // Tell client the session ID immediately
          send({ type: "session_created", sessionId });

          // Generate AI response using existing pipeline
          const startMs = Date.now();
          const result = await generateSessionResponse(trimmedQuery);

          if (!result.ok) {
            send({ type: "error", error: result.error });

            // Save error to DB
            await supabase.from("nali_messages").insert({
              session_id: sessionId,
              role: "assistant",
              content: result.error,
              position: 1,
              has_error: true,
              error_message: result.errorCode,
            });

            controller.close();
            return;
          }

          // Stream the content in chunks for typewriter effect
          for (const chunk of chunkText(result.content)) {
            send({ type: "delta", content: chunk });
            // Small delay between chunks is handled client-side by render timing
          }

          const generationMs = Date.now() - startMs;

          // Save completed assistant message
          const { data: assistantMsg } = await supabase
            .from("nali_messages")
            .insert({
              session_id: sessionId,
              role: "assistant",
              content: result.content,
              position: 1,
              model_slug: result.modelSlug,
              generation_ms: generationMs,
            })
            .select("id")
            .single();

          send({ type: "done", messageId: assistantMsg?.id });
          controller.close();
        } catch (err) {
          console.error("Session generation error:", err);
          send({
            type: "error",
            error: "Terjadi kesalahan saat memproses. Coba lagi.",
          });

          try {
            await supabase
              .from("nali_messages")
              .insert({
                session_id: sessionId,
                role: "assistant",
                content: "Terjadi kesalahan. Silakan coba lagi.",
                position: 1,
                has_error: true,
                error_message: err instanceof Error ? err.message : "Unknown error",
              });
          } catch {
            // Swallow DB errors during error handling
          }

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Sessions POST error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
    try {
      supabase = await createServerSupabaseClient();
    } catch {
      return Response.json({ sessions: [] });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ sessions: [] });
    }

    const { data: sessions, error } = await supabase
      .from("nali_sessions")
      .select("id, title, first_query, message_count, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Sessions list error:", error);
      return Response.json({ sessions: [] });
    }

    return Response.json({ sessions: sessions ?? [] });
  } catch {
    return Response.json({ sessions: [] });
  }
}
