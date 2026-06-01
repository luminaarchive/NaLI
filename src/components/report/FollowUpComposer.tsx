"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Send, Square } from "lucide-react";
import type { ConversationMessage } from "./ConversationThread";
import { UploadDropdown } from "@/components/composer/UploadDropdown";
import { AttachedFileChip } from "@/components/composer/AttachedFileChip";
import type { ExtractedFile } from "@/lib/extract-file-content";

export interface FollowUpComposerHandle {
  /** Replace the composer text and move focus + cursor to the end. */
  prefill: (text: string) => void;
  focus: () => void;
}

interface FollowUpComposerProps {
  sessionId: string | null;
  conversationMessages: ConversationMessage[];
  onStreamStart: (userMsg: ConversationMessage) => void;
  onStreamToken: (token: string) => void;
  onStreamDone: (finalSessionId: string | null, fullText?: string) => void;
  onError: (msg: string) => void;
  placeholder?: string;
  variant?: "inline" | "pinned";
}

export const FollowUpComposer = forwardRef<FollowUpComposerHandle, FollowUpComposerProps>(function FollowUpComposer(
  {
    sessionId,
    conversationMessages,
    onStreamStart,
    onStreamToken,
    onStreamDone,
    onError,
    placeholder,
    variant = "inline",
  },
  ref,
) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<ExtractedFile | null>(null);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleStop = () => {
    abortRef.current?.abort();
  };

  useImperativeHandle(ref, () => ({
    prefill: (text: string) => {
      setInput(text);
      setTimeout(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        const end = el.value.length;
        el.setSelectionRange(end, end);
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    },
    focus: () => textareaRef.current?.focus(),
  }));

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

    const controller = new AbortController();
    abortRef.current = controller;

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
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        onError((data as any).error ?? "Gagal mengirim pesan.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let finalSessionId: string | null = sessionId;
      let accumulated = "";

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
            if (parsed.token) {
              accumulated += parsed.token;
              onStreamToken(parsed.token);
            }
            if (parsed.done) {
              finalSessionId = parsed.sessionId ?? sessionId;
              onStreamDone(finalSessionId, accumulated);
              break outer;
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        onError("Dihentikan.");
      } else {
        onError("Koneksi bermasalah. Coba lagi.");
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const isPinned = variant === "pinned";

  return (
    <div className={isPinned ? "" : "mt-8 border-t border-white/[0.06] pt-6"}>
      {!isPinned && followUpCount > 0 && (
        <p className="mb-3 text-[10px] font-semibold tracking-wider text-white/25 uppercase">
          {followUpCount} pertukaran dalam sesi ini
        </p>
      )}

      <div className="relative flex flex-col gap-1 rounded-2xl border border-[#00FFB3]/15 bg-[#1a1a1a] p-3 transition-colors focus-within:border-[#00FFB3]/30">
        {/* Attached file chip */}
        {attachedFile && (
          <AttachedFileChip file={attachedFile} onRemove={() => setAttachedFile(null)} isLoading={isExtractingFile} />
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
            placeholder={placeholder ?? "Tanya lebih lanjut atau minta revisi..."}
            rows={1}
            className="max-h-[100px] flex-1 resize-none bg-transparent text-sm leading-6 text-white/80 placeholder-white/25 outline-none disabled:opacity-50"
            style={{ lineHeight: "1.5rem" }}
          />

          <div className="flex shrink-0 items-center gap-1">
            <UploadDropdown onFileSelected={handleFileAttach} disabled={loading || isExtractingFile} />
            {isExtractingFile && <span className="text-[11px] text-white/40">Membaca...</span>}
            {loading ? (
              <button
                onClick={handleStop}
                type="button"
                aria-label="Hentikan"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 transition hover:bg-white"
              >
                <Square className="h-3 w-3 fill-[#050F12] text-[#050F12]" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim() && !attachedFile}
                aria-label="Kirim"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00FFB3] transition hover:bg-[#00FFB3]/90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5 text-[#050F12]" />
              </button>
            )}
          </div>
        </div>
      </div>
      {!isPinned && (
        <p className="mt-2 text-[10px] text-white/20">Tekan Enter untuk kirim, Shift+Enter untuk baris baru</p>
      )}
    </div>
  );
});
