"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import type { ConversationMessage } from "./ConversationThread";
import { UploadDropdown } from "@/components/composer/UploadDropdown";
import { AttachedFileChip } from "@/components/composer/AttachedFileChip";
import type { ExtractedFile } from "@/lib/extract-file-content";

interface FollowUpComposerProps {
  sessionId: string | null;
  conversationMessages: ConversationMessage[];
  onStreamStart: (userMsg: ConversationMessage) => void;
  onStreamToken: (token: string) => void;
  onStreamDone: (finalSessionId: string | null) => void;
  onError: (msg: string) => void;
}

export function FollowUpComposer({
  sessionId,
  conversationMessages,
  onStreamStart,
  onStreamToken,
  onStreamDone,
  onError,
}: FollowUpComposerProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<ExtractedFile | null>(null);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const followUpCount = Math.floor(conversationMessages.slice(2).length / 2);

  const handleFileAttach = async (file: File) => {
    setIsExtractingFile(true);
    try {
      const { extractFileContent } = await import("@/lib/extract-file-content");
      const extracted = await extractFileContent(file);
      setAttachedFile(extracted);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal membaca file.";
      onError(msg);
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleSubmit = async () => {
    const text = input.trim();
    const currentFile = attachedFile;
    if ((!text && !currentFile) || loading) return;

    // Build enriched prompt
    let fullPrompt = text;
    let imageBase64: string | undefined;
    if (currentFile) {
      if (currentFile.type === "pdf" || currentFile.type === "text") {
        const fileBlock = `\n\n--- Lampiran: ${currentFile.name} ---\n${currentFile.content.slice(0, 8000)}`;
        fullPrompt = text ? `${text}${fileBlock}` : `Tolong analisis dokumen berikut:${fileBlock}`;
      } else if (currentFile.type === "image") {
        imageBase64 = currentFile.base64;
        if (!text) fullPrompt = "Tolong analisis gambar yang dilampirkan.";
      }
    }

    setInput("");
    setAttachedFile(null);
    setLoading(true);

    const userMsg: ConversationMessage = {
      role: "user",
      content: text || currentFile?.name || "",
      timestamp: new Date().toISOString(),
    };
    onStreamStart(userMsg);

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          messages: conversationMessages,
          sessionId,
          imageBase64,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        onError((data as any).error ?? "Gagal mengirim pesan.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let finalSessionId: string | null = sessionId;

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.token) onStreamToken(parsed.token);
            if (parsed.done) {
              finalSessionId = parsed.sessionId ?? sessionId;
              onStreamDone(finalSessionId);
              break outer;
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      onError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  return (
    <div className="mt-8 border-t border-white/[0.06] pt-6">
      {followUpCount > 0 && (
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/25">
          {followUpCount} pertukaran dalam sesi ini
        </p>
      )}

      <div className="relative flex flex-col gap-1 rounded-2xl border border-[#00FFB3]/15 bg-white/[0.02] p-3 focus-within:border-[#00FFB3]/30 transition-colors">
        {/* Attached file chip */}
        {attachedFile && (
          <AttachedFileChip
            file={attachedFile}
            onRemove={() => setAttachedFile(null)}
            isLoading={isExtractingFile}
          />
        )}

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={loading}
            placeholder="Tanya lebih lanjut atau minta revisi..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-white/80 placeholder-white/25 outline-none max-h-[100px] leading-6 disabled:opacity-50"
            style={{ lineHeight: "1.5rem" }}
          />

          <div className="flex items-center gap-1 shrink-0">
            <UploadDropdown
              onFileSelected={handleFileAttach}
              disabled={loading || isExtractingFile}
            />
            {isExtractingFile && (
              <span className="text-[11px] text-white/40">Membaca...</span>
            )}
            <button
              onClick={handleSubmit}
              disabled={(!input.trim() && !attachedFile) || loading}
              aria-label="Kirim"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00FFB3] transition hover:bg-[#00FFB3]/90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? (
                <span className="h-3 w-3 rounded-full border border-[#050F12]/40 border-t-[#050F12] animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 text-[#050F12]" />
              )}
            </button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-white/20">Tekan Enter untuk kirim, Shift+Enter untuk baris baru</p>
    </div>
  );
}
