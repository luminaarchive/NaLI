import { NextRequest } from "next/server";
import { fetchAvailableFreeModels } from "@/lib/openrouter-models";
import { NALI_SYSTEM_PROMPT, NALI_FOLLOWUP_SYSTEM_PROMPT } from "@/lib/nali-system-prompt";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export const maxDuration = 60;

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
    return new Response(
      JSON.stringify({ error: "Request tidak valid." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const prompt = body?.prompt as string | undefined;
  const incomingMessages = (body?.messages as ConversationMessage[] | undefined) ?? [];
  const sessionId = body?.sessionId as string | null | undefined;
  const imageBase64 = body?.imageBase64 as string | undefined;

  // Validate imageBase64 format if present
  const validImage = imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:image/");

  if (!prompt || String(prompt).trim().length < 10) {
    return new Response(
      JSON.stringify({ error: "Prompt terlalu pendek. Tulis minimal 10 karakter." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Kapasitas AI belum dikonfigurasi. Hubungi admin.", code: "NO_API_KEY" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // Resolve auth before stream creation
  const cookieStore = await cookies();
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://dummy.supabase.co").trim().replace(/\/rest\/v1\/?$/, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "dummy").trim();
  const supabase = createServerClient(rawUrl, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cs) {
        try { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* read-only ctx */ }
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();

  const promptStr = String(prompt).trim();
  const isMultiTurn = incomingMessages.length > 0;

  // Follow-up conversations use conversational prompt; initial reports use structured prompt
  const systemPrompt = isMultiTurn ? NALI_FOLLOWUP_SYSTEM_PROMPT : NALI_SYSTEM_PROMPT;

  // Build the last user message — support multimodal content for images
  type UserContent = string | Array<{ type: string; [k: string]: unknown }>;
  const userContent: UserContent = validImage
    ? [
        { type: "image_url", image_url: { url: imageBase64 } },
        { type: "text", text: promptStr },
      ]
    : promptStr;

  // Build messages array for OpenRouter
  const openRouterMessages: Array<{ role: string; content: UserContent }> = [
    { role: "system", content: systemPrompt },
    ...(isMultiTurn
      ? incomingMessages.map((m) => ({ role: m.role, content: m.content }))
      : []),
    { role: "user", content: userContent },
  ];

  // Vision-capable models take priority when an image is attached
  const VISION_MODELS = [
    "meta-llama/llama-4-maverick:free",
    "meta-llama/llama-4-scout:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "google/gemma-3-27b-it:free",
  ];

  const models = validImage ? VISION_MODELS : await fetchAvailableFreeModels();
  let openRouterResponse: Response | null = null;
  let usedModel: string | null = null;

  for (const model of models) {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
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
          max_tokens: 2000,
          temperature: 0.3,
          stream: true,
        }),
      });
      if (res.status === 429) { await new Promise((r) => setTimeout(r, 300)); continue; }
      if (!res.ok) continue;
      openRouterResponse = res;
      usedModel = model;
      break;
    } catch { continue; }
  }

  if (!openRouterResponse?.body) {
    return new Response(
      JSON.stringify({ error: "Kapasitas AI sedang penuh. Coba lagi dalam beberapa menit.", code: "ALL_MODELS_UNAVAILABLE" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();
  const upstreamReader = openRouterResponse.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let fullText = "";
      const now = new Date().toISOString();

      try {
        while (true) {
          const { done, value } = await upstreamReader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const parsed = JSON.parse(payload);
              const token: string = parsed.choices?.[0]?.delta?.content ?? "";
              if (token) {
                fullText += token;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token, model: usedModel })}\n\n`));
              }
            } catch { /* skip malformed */ }
          }
        }

        // Persist to Supabase after stream complete
        let savedSessionId: string | null = sessionId ?? null;

        if (user && fullText.trim()) {
          const userMsg: ConversationMessage = { role: "user", content: promptStr, timestamp: now };
          const assistantMsg: ConversationMessage = { role: "assistant", content: fullText, timestamp: new Date().toISOString() };

          if (isMultiTurn && sessionId) {
            // Append to existing session
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
              .update({ messages: updatedMessages, result: fullText, updated_at: new Date().toISOString() })
              .eq("id", sessionId)
              .eq("user_id", user.id);
          } else {
            // Create new session
            const title = promptStr.slice(0, 60) + (promptStr.length > 60 ? "..." : "");
            const initialMessages: ConversationMessage[] = [userMsg, assistantMsg];
            const { data: newSession } = await supabase
              .from("report_sessions")
              .insert({
                user_id: user.id,
                title,
                prompt: promptStr,
                result: fullText,
                model_used: usedModel,
                messages: initialMessages,
              })
              .select("id")
              .single();
            savedSessionId = newSession?.id ?? null;
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: savedSessionId, model: usedModel })}\n\n`));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
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
