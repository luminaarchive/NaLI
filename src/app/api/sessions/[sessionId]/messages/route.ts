// src/app/api/sessions/[sessionId]/messages/route.ts
// POST /api/sessions/[sessionId]/messages — follow-up message with SSE streaming

import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateFollowUpResponse } from "@/lib/sessions/sessionGeneration";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";

/**
 * Stream text content as SSE deltas in word-sized chunks.
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const body = (await req.json().catch(() => ({}))) as { content?: string };
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

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

    let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
    try {
      supabase = await createServerSupabaseClient();
    } catch {
      return Response.json({ error: "Database tidak tersedia" }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Verify session exists and belongs to this user
    const { data: session, error: sessionError } = await supabase
      .from("nali_sessions")
      .select("id, user_id, message_count")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return Response.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    if (session.user_id !== null && session.user_id !== user?.id) {
      return Response.json({ error: "Tidak diizinkan" }, { status: 403 });
    }

    const trimmedContent = content.trim().slice(0, 2000);
    const nextPosition = (session.message_count as number) ?? 0;

    // Save user message
    await supabase.from("nali_messages").insert({
      session_id: sessionId,
      role: "user",
      content: trimmedContent,
      position: nextPosition,
    });

    // Get conversation history for context (cap at 20 messages)
    const { data: history } = await supabase
      .from("nali_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("position", { ascending: true })
      .limit(20);

    const historyArray = (history ?? []).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

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
          const startMs = Date.now();
          const result = await generateFollowUpResponse(trimmedContent, historyArray);

          if (!result.ok) {
            send({ type: "error", error: result.error });

            await supabase.from("nali_messages").insert({
              session_id: sessionId,
              role: "assistant",
              content: result.error,
              position: nextPosition + 1,
              has_error: true,
              error_message: result.errorCode,
            });

            controller.close();
            return;
          }

          // Stream content in chunks
          for (const chunk of chunkText(result.content)) {
            send({ type: "delta", content: chunk });
          }

          const generationMs = Date.now() - startMs;

          // Save completed assistant message
          const { data: assistantMsg } = await supabase
            .from("nali_messages")
            .insert({
              session_id: sessionId,
              role: "assistant",
              content: result.content,
              position: nextPosition + 1,
              model_slug: result.modelSlug,
              generation_ms: generationMs,
            })
            .select("id")
            .single();

          send({ type: "done", messageId: assistantMsg?.id });
          controller.close();
        } catch (err) {
          console.error("Follow-up generation error:", err);
          send({
            type: "error",
            error: "Terjadi kesalahan. Coba lagi.",
          });

          try {
            await supabase
              .from("nali_messages")
              .insert({
                session_id: sessionId,
                role: "assistant",
                content: "Terjadi kesalahan. Silakan coba lagi.",
                position: nextPosition + 1,
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
    console.error("Messages POST error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
