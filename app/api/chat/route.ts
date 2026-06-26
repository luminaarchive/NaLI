import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { retrieveContext, type RetrievedChunk } from "@/lib/embeddings";

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
  });

  return result.toTextStreamResponse();
}
