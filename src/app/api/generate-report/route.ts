import { NextRequest } from "next/server";
import { CAPABLE_MODEL_WATERFALL } from "@/lib/openrouter-models";
import { NALI_SYSTEM_PROMPT, NALI_FOLLOWUP_SYSTEM_PROMPT, NALI_CHAT_SYSTEM_PROMPT } from "@/lib/nali-system-prompt";
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

// Decide whether a turn should produce a full evidence report (journal) or a
// conversational answer. Journal only when there are real field materials, an
// explicit report request, an image, an existing report being edited, or an
// affirmative "yes" to NaLI's offer. Casual/speculative questions stay chat.
function detectReportIntent(
  prompt: string,
  hasImage: boolean,
  isMultiTurn: boolean,
  historyHasReport: boolean,
  messages: ConversationMessage[],
): boolean {
  if (historyHasReport) return true; // editing/refining an existing report
  if (hasImage) return true; // an uploaded image is field material

  const p = prompt.toLowerCase();

  const explicitReport =
    /\b(buat|buatkan|susun|susunkan|jadikan|bikin|bikinkan|tolong\s+buat)\b[\s\S]{0,40}\b(laporan|jurnal|artikel|draft|imrad|paper|makalah)\b/.test(
      p,
    ) ||
    /\b(laporan|jurnal)\s+(observasi|praktikum|kkn|lapangan|penelitian|ilmiah)\b/.test(p) ||
    /\b(format\s+imrad|jadikan\s+laporan|susun\s+laporan|buatkan\s+laporan)\b/.test(p);
  if (explicitReport) return true;

  // Short affirmative reply right after NaLI offered to build a report.
  const lastAssistant =
    [...messages]
      .reverse()
      .find((m) => m.role === "assistant")
      ?.content?.toLowerCase() ?? "";
  const naliOfferedReport =
    /laporan berbasis bukti|susun(?:kan)? (?:ini )?jadi laporan|mau aku (?:susun|buatkan)|jadi laporan/.test(
      lastAssistant,
    );
  const affirmative =
    /^(ya|iya|yaa|yoi|oke|ok|okay|okai|boleh|mau|gas|lanjut|silakan|silahkan|setuju|buat|buatkan|lakukan|sip|yes)\b/.test(
      p.trim(),
    );
  if (isMultiTurn && naliOfferedReport && affirmative) return true;

  // Questions / definitional asks stay conversational even if they mention species.
  const isQuestion =
    /^(apa|apakah|kenapa|mengapa|bagaimana|gimana|gmn|siapa|kapan|kpn|di\s?mana|dimana|berapa|bisakah|bolehkah|haruskah|adakah|tolong\s+jelaskan|jelaskan|ceritakan|sebutkan)\b/.test(
      p.trim(),
    ) || p.trim().endsWith("?");

  // Stated research activities (declarative) → report. e.g. "hasil praktikum...",
  // "survei transek...", "data kamera trap...".
  const strongActivity =
    /\b(praktikum|observasi|pengamatan|survei|survey|transek|kamera trap|camera trap|spesimen|eksperimen|inventarisasi|monitoring)\b/.test(
      p,
    );
  if (strongActivity && !isQuestion) return true;

  // Weaker field-material signals: need corroboration AND a declarative tone.
  const observationVerb =
    /\b(mengamati|amati|menemukan|temukan|menjumpai|menemui|melihat|lihat|bertemu|berjumpa|jumpa|mencatat|merekam|memotret|memfoto)\b/.test(
      p,
    );
  const measurement = /\b\d+([.,]\d+)?\s?(cm|mm|m|km|mdpl|kg|gram|gr|ekor|individu|menit|jam|ha|hektar)\b/.test(p);
  const dateLike =
    /\b(\d{1,2}\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|pukul\s+\d|jam\s+\d)\b/.test(
      p,
    );
  const coordLike = /\b(-?\d{1,3}\.\d{3,}|koordinat|gps|lintang|bujur|ls|bt)\b/.test(p);
  const speciesHint = /\b(elang|macan|harimau|orangutan|owa|lutung|nisaetus|panthera|raptor|endemik|iucn)\b/.test(p);

  const materialSignals = [observationVerb, measurement, dateLike, coordLike, speciesHint].filter(Boolean).length;

  if (!isQuestion && observationVerb && materialSignals >= 2) return true;
  if (!isQuestion && materialSignals >= 3) return true;

  return false; // conversational by default
}

// Clearly harmful / off-mission requests. NaLI declines these with a message
// instead of silently returning an empty bubble. Conservation discussion stays
// allowed (e.g. "dampak kerusakan lingkungan"); only how-to-cause-harm is blocked.
function detectHarmful(prompt: string): boolean {
  const p = prompt.toLowerCase();
  return (
    // Weapons / explosives / dangerous devices
    /\b(cara|bagaimana|gimana|tutorial|langkah)\b[\s\S]{0,30}\b(membuat|bikin|merakit|meracik)\b[\s\S]{0,30}\b(bom|peledak|bahan peledak|senjata|senjata api|granat|ranjau|napalm|tnt)\b/.test(
      p,
    ) ||
    /\b(cara|bagaimana|gimana)\b[\s\S]{0,30}\b(meracun|meracuni|membunuh|menyakiti|melukai)\b[\s\S]{0,20}\b(orang|manusia|seseorang|warga)\b/.test(
      p,
    ) ||
    // How to destroy / damage the environment, habitat, wildlife (instructions to cause harm)
    /\b(cara|bagaimana|gimana|tutorial|langkah)\b[\s\S]{0,30}\b(merusak|menghancurkan|membakar|menggunduli|meracuni|mencemari|menebang ilegal)\b[\s\S]{0,30}\b(lingkungan|hutan|habitat|alam|ekosistem|sungai|laut|terumbu)\b/.test(
      p,
    ) ||
    /\b(cara|bagaimana|gimana)\b[\s\S]{0,30}\b(berburu|membunuh|menangkap|menjual|menyelundupkan)\b[\s\S]{0,30}\b(satwa|hewan)\b[\s\S]{0,20}\b(dilindungi|langka|endemik)\b/.test(
      p,
    )
  );
}

const NALI_DECLINE_MESSAGE =
  "Maaf, aku tidak bisa membantu permintaan itu. Aku NaLI, asisten untuk konservasi alam, satwa, dan riset lapangan. Aku justru ada untuk melindungi lingkungan dan makhluk hidup. Kalau kamu mau, aku bisa bantu soal cara menjaga habitat, mengenali spesies, atau menyusun laporan lapangan berbasis bukti.";

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

  // Does the conversation already contain a generated journal report?
  const historyHasReport = incomingMessages.some(
    (m) => m.role === "assistant" && typeof m.content === "string" && m.content.includes(NALI_HEADER_MARKER),
  );

  // Clearly harmful / off-mission requests get a deterministic NaLI decline.
  const harmful = detectHarmful(promptStr);

  // Conversational by default; journal only on clear report intent.
  const reportMode = detectReportIntent(
    promptStr,
    Boolean(validImage),
    isMultiTurn,
    historyHasReport,
    incomingMessages,
  );

  const systemPrompt = !reportMode
    ? NALI_CHAT_SYSTEM_PROMPT
    : historyHasReport
      ? NALI_FOLLOWUP_SYSTEM_PROMPT
      : NALI_SYSTEM_PROMPT;

  // Only gate on the journal header when generating a fresh report from scratch.
  // Chat mode and follow-ups stream directly (the header check would wrongly abort them).
  const gateHeader = reportMode && !isMultiTurn;

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

      // Harmful / off-mission request → decline deterministically, no model call.
      if (harmful) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: NALI_DECLINE_MESSAGE })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: null })}\n\n`));
        controller.close();
        return;
      }

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
        // Only fresh report generation is gated on the journal header. Chat mode and
        // follow-ups stream directly so a missing header never aborts them.
        let bufferFlushed: boolean = !gateHeader;
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
          // A model that produced no usable content (e.g. a reasoning model that
          // streamed only its hidden chain-of-thought, or an empty completion) is
          // a miss — fall through to the next model instead of returning blank.
          if (modelText.trim().length === 0) {
            continue;
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
