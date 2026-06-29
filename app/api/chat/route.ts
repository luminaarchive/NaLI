import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { retrieveContext, type RetrievedChunk } from "@/lib/embeddings";
import { isSameOrigin } from "@/lib/http";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const maxDuration = 30;

/** Simple message shape sent by our client (not the AI SDK UIMessage). */
interface ChatRequestMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * RAG chat endpoint for the NaLI knowledge graph.
 *
 * Accepts: { messages, nodeSlug?, nodeType?, nodeLabel? }
 * Returns: streaming text response from Gemini with RAG context.
 */
export async function POST(req: Request) {
  // Reject cross-site browser POSTs; this is a same-origin app endpoint.
  if (!isSameOrigin(req)) {
    return Response.json({ error: "Asal permintaan tidak sah" }, { status: 403 });
  }

  // Rate limit: this endpoint calls a paid AI model, so cap it tightly per IP
  // (15 requests / minute) to stop runaway cost and abuse.
  const rl = rateLimit(`chat:${clientIp(req)}`, 15, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  // Fail loudly (not as a silent 200 with an empty body) when the model
  // provider key is missing. The AI SDK reads GOOGLE_GENERATIVE_AI_API_KEY
  // lazily, so without this guard streamText sends a 200 then errors mid-stream,
  // leaving callers with an empty response and no signal to surface.
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("/api/chat: GOOGLE_GENERATIVE_AI_API_KEY is not set");
    return Response.json(
      {
        error:
          "Asisten NaLI belum dikonfigurasi (kunci model AI tidak tersedia).",
      },
      { status: 503 },
    );
  }

  const body = await req.json();
  const { messages, nodeSlug, nodeType, nodeLabel } = body as {
    messages: ChatRequestMessage[];
    nodeSlug?: string;
    nodeType?: string;
    nodeLabel?: string;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response("messages array is required", { status: 400 });
  }

  // Get the latest user message for retrieval
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastUserMessage) {
    return new Response("No user message found", { status: 400 });
  }

  // Retrieve relevant context from the vector store
  let contextChunks: RetrievedChunk[] = [];
  try {
    contextChunks = await retrieveContext(
      lastUserMessage.content,
      6,
      nodeSlug ?? undefined,
    );
  } catch (err) {
    console.error("RAG retrieval error:", err);
    contextChunks = [];
  }

  // Build context string from retrieved chunks
  const contextStr =
    contextChunks.length > 0
      ? contextChunks
          .map(
            (c, i) =>
              `[Sumber ${i + 1}: ${c.title} (${c.category})]\n${c.content}`,
          )
          .join("\n\n---\n\n")
      : "Tidak ada konteks yang ditemukan di arsip NaLI untuk pertanyaan ini.";

  // Build the system prompt
  const nodeContext = nodeLabel
    ? `\n\nPengguna sedang menjelajahi simpul "${nodeLabel}" (tipe: ${nodeType ?? "tidak diketahui"}) di graf pengetahuan NaLI.`
    : "";

  const systemPrompt = `Kamu adalah asisten riset NaLI (Jurnal Riset Terbuka Indonesia). Tugasmu adalah membantu pembaca memahami riset tentang alam, sejarah, dan investigasi Indonesia.

ATURAN KETAT:
1. Jawab HANYA berdasarkan konteks jurnal NaLI yang diberikan di bawah.
2. Jika informasi tidak ada dalam konteks, katakan: "Informasi ini belum tersedia di arsip NaLI."
3. Jangan mengarang fakta atau menambahkan informasi di luar konteks.
4. Sebutkan judul sumber jika relevan (misalnya: "Menurut artikel 'Judul Artikel'...").
5. Jawab dalam Bahasa Indonesia yang jelas dan ringkas.
6. Jika pengguna bertanya dalam Bahasa Inggris, jawab dalam Bahasa Inggris tetapi tetap berdasarkan konteks.${nodeContext}

--- KONTEKS DARI ARSIP NALI ---

${contextStr}

--- AKHIR KONTEKS ---`;

  // Convert our simple messages to the format streamText expects
  const modelMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: systemPrompt,
    messages: modelMessages,
    // Surface provider/stream failures in the logs instead of silently ending
    // the stream (which the client renders as a graceful fallback bubble).
    onError: ({ error }) => {
      console.error("/api/chat streamText error:", error);
    },
  });

  return result.toTextStreamResponse();
}
