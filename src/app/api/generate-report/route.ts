import { NextRequest } from "next/server";
import { CAPABLE_MODEL_WATERFALL } from "@/lib/openrouter-models";
import { NALI_SYSTEM_PROMPT, NALI_FOLLOWUP_SYSTEM_PROMPT } from "@/lib/nali-system-prompt";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export const maxDuration = 60;

// Number of characters to buffer before checking for structured output.
// ---NALI-HEADER--- appears at the very start, so 100 chars is more than enough.
// If not found by then, the model is hallucinating.
const HEADER_CHECK_CHARS = 100;
const NALI_HEADER_MARKER = "---NALI-HEADER---";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Request tidak valid." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const prompt = body?.prompt as string | undefined;
  const incomingMessages = (body?.messages as ConversationMessage[] | undefined) ?? [];
  const sessionId = body?.sessionId as string | null | undefined;
  const imageBase64 = body?.imageBase64 as string | undefined;
  const selectedModel = typeof body?.selectedModel === "string" ? (body.selectedModel as string) : undefined;

  const validImage = imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:image/");

  if (!prompt || String(prompt).trim().length < 10) {
    return new Response(JSON.stringify({ error: "Prompt terlalu pendek. Tulis minimal 10 karakter." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Kapasitas AI belum dikonfigurasi. Hubungi admin.",
        code: "NO_API_KEY",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // Resolve auth before stream creation
  const cookieStore = await cookies();
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://dummy.supabase.co")
    .trim()
    .replace(/\/rest\/v1\/?$/, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "dummy").trim();
  const supabase = createServerClient(rawUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cs) {
        try {
          cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* read-only ctx */
        }
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const promptStr = String(prompt).trim();
  const isMultiTurn = incomingMessages.length > 0;
  const systemPrompt = isMultiTurn ? NALI_FOLLOWUP_SYSTEM_PROMPT : NALI_SYSTEM_PROMPT;

  type UserContent = string | Array<{ type: string; [k: string]: unknown }>;
  const userContent: UserContent = validImage
    ? [
        { type: "image_url", image_url: { url: imageBase64 } },
        { type: "text", text: promptStr },
      ]
    : promptStr;

  const openRouterMessages: Array<{ role: string; content: UserContent }> = [
    { role: "system", content: systemPrompt },
    ...(isMultiTurn ? incomingMessages.map((m) => ({ role: m.role, content: m.content })) : []),
    { role: "user", content: userContent },
  ];

  // Vision-capable models for image prompts
  const VISION_MODELS = [
    "meta-llama/llama-4-maverick:free",
    "meta-llama/llama-4-scout:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "google/gemma-3-27b-it:free",
  ];

  // Use capable models for structured report generation; vision models override for images.
  // If the user picked a NaLI tier (mapped to an engine that exists in the waterfall),
  // try that engine first, then fall back through the rest of the waterfall on 429/error.
  const baseWaterfall: readonly string[] = validImage ? VISION_MODELS : CAPABLE_MODEL_WATERFALL;
  const modelsToTry: readonly string[] =
    selectedModel && baseWaterfall.includes(selectedModel)
      ? [selectedModel, ...baseWaterfall.filter((m) => m !== selectedModel)]
      : baseWaterfall;

  const encoder = new TextEncoder();
  const now = new Date().toISOString();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = "";
      let usedModel: string | null = null;

      // Try each model in waterfall order.
      // Buffer the first HEADER_CHECK_CHARS characters before flushing to the client.
      // If the model hasn't produced ---NALI-HEADER--- in those chars, abort and try next.
      modelLoop: for (const model of modelsToTry) {
        let upstreamRes: Response;
        try {
          upstreamRes = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": "https://naliai.vercel.app",
              "X-Title": "NaLI - Nature Life Intelligence",
            },
            body: JSON.stringify({
              model,
              messages: openRouterMessages,
              max_tokens: 2500,
              temperature: 0.3,
              stream: true,
            }),
          });

          if (upstreamRes.status === 429) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          if (!upstreamRes.ok) continue;
        } catch {
          continue;
        }

        const reader = upstreamRes.body!.getReader();
        const decoder = new TextDecoder();

        // Per-model state
        let modelText = "";
        let charsReceived = 0;
        // Follow-up responses use the simple conversational prompt so skip header check.
        // For new reports, buffer until we confirm structured output starts correctly.
        let bufferFlushed: boolean = isMultiTurn;
        const tokenBuffer: string[] = [];

        let modelAborted = false;

        try {
          outer: while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") continue;

              let token: string;
              try {
                const parsed = JSON.parse(payload);
                token = parsed.choices?.[0]?.delta?.content ?? "";
              } catch {
                continue;
              }

              if (!token) continue;

              modelText += token;
              charsReceived += token.length;

              if (bufferFlushed) {
                // Past buffer zone or follow-up — stream directly to client
                fullText += token;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token, model })}\n\n`));
              } else {
                // Still buffering — hold until we confirm structured output
                tokenBuffer.push(token);

                const headerFound = modelText.includes(NALI_HEADER_MARKER);

                if (headerFound) {
                  // Good model — flush buffer immediately
                  bufferFlushed = true;
                  for (const t of tokenBuffer) {
                    fullText += t;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: t, model })}\n\n`));
                  }
                  tokenBuffer.length = 0;
                } else if (charsReceived >= HEADER_CHECK_CHARS) {
                  // Model produced HEADER_CHECK_CHARS chars without the header marker.
                  // This is a hallucination signal — abort this model and try next.
                  modelAborted = true;
                  reader.cancel().catch(() => {});
                  break outer;
                }
              }
            }
          }
        } catch {
          modelAborted = true;
        }

        if (!modelAborted) {
          // Stream ended normally (possibly before hitting check threshold for short outputs)
          // Flush any remaining buffer
          if (tokenBuffer.length > 0) {
            for (const t of tokenBuffer) {
              fullText += t;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: t, model })}\n\n`));
            }
          }
          usedModel = model;
          break modelLoop;
        }
        // else: try next model in waterfall
      }

      // Persist to Supabase after stream complete
      let savedSessionId: string | null = sessionId ?? null;

      if (usedModel && user && fullText.trim()) {
        const userMsg: ConversationMessage = { role: "user", content: promptStr, timestamp: now };
        const assistantMsg: ConversationMessage = {
          role: "assistant",
          content: fullText,
          timestamp: new Date().toISOString(),
        };

        try {
          if (isMultiTurn && sessionId) {
            const { data: existing } = await supabase
              .from("report_sessions")
              .select("messages")
              .eq("id", sessionId)
              .eq("user_id", user.id)
              .single();

            const existingMessages: ConversationMessage[] = (existing?.messages as ConversationMessage[]) ?? [];
            const updatedMessages = [...existingMessages, userMsg, assistantMsg];

            await supabase
              .from("report_sessions")
              .update({
                messages: updatedMessages,
                result: fullText,
                updated_at: new Date().toISOString(),
              })
              .eq("id", sessionId)
              .eq("user_id", user.id);
          } else {
            const title = promptStr.slice(0, 60) + (promptStr.length > 60 ? "..." : "");
            const { data: newSession } = await supabase
              .from("report_sessions")
              .insert({
                user_id: user.id,
                title,
                prompt: promptStr,
                result: fullText,
                model_used: usedModel,
                messages: [userMsg, assistantMsg],
              })
              .select("id")
              .single();
            savedSessionId = newSession?.id ?? null;
          }
        } catch {
          /* persistence errors are non-fatal */
        }
      }

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: savedSessionId, model: usedModel })}\n\n`),
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
