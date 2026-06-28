"use client";

import { useEffect, useRef } from "react";
import { useNaliChat } from "@/lib/hooks/useNaliChat";

/* -------------------------------------------------------------------------- */
/*  AI Chat Panel for the Knowledge Graph side panel.                          */
/*  Streaming chat logic lives in the shared useNaliChat hook.                 */
/* -------------------------------------------------------------------------- */

interface AIChatPanelProps {
  /** The slug of the selected graph node (used to scope RAG retrieval). */
  nodeSlug?: string;
  /** Node type (artikel, sumber, seri, topik). */
  nodeType?: string;
  /** Display label of the node. */
  nodeLabel?: string;
}

export function AIChatPanel({ nodeSlug, nodeType, nodeLabel }: AIChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, input, setInput, handleSubmit, isLoading, error } =
    useNaliChat({ nodeSlug, nodeType, nodeLabel });

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-dashed border-ink/40 pb-3">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-gray">
          Asisten Riset NaLI
        </p>
        {nodeLabel && (
          <p className="mt-1 font-mono text-[0.7rem] leading-snug text-ink-charcoal">
            Konteks: <span className="text-ink">{nodeLabel}</span>
          </p>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto py-3"
        style={{ maxHeight: "320px" }}
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center px-2">
            <p className="text-center font-mono text-[0.72rem] leading-relaxed text-gray">
              Tanyakan apa saja tentang topik ini. Jawaban berdasarkan arsip
              riset NaLI.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.role === "user"
                ? "ml-4 bg-ink-wash"
                : "mr-4 border-l-2 border-dashed border-ink/40 pl-3"
            } p-2.5`}
          >
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-gray">
              {msg.role === "user" ? "Anda" : "NaLI AI"}
            </p>
            <div className="mt-1 whitespace-pre-wrap font-mono text-[0.74rem] leading-relaxed text-ink-charcoal">
              {msg.content ||
                (isLoading && msg.role === "assistant" ? (
                  <span className="animate-pulse text-gray">
                    Sedang mencari di arsip…
                  </span>
                ) : null)}
            </div>
          </div>
        ))}

        {error && (
          <div className="border border-dashed border-red-400/60 bg-red-50/10 p-2.5">
            <p className="font-mono text-[0.7rem] text-red-500 dark:text-red-400">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-dashed border-ink/40 pt-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya tentang topik ini…"
          className="flex-1 border border-dashed border-ink/50 bg-paper px-3 py-2 font-mono text-[0.76rem] text-ink placeholder:text-gray/60 focus:border-ink focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="border border-ink bg-ink px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep disabled:opacity-40"
        >
          {isLoading ? "…" : "Kirim"}
        </button>
      </form>
    </div>
  );
}
