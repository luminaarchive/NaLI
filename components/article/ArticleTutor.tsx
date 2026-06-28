"use client";

import { useEffect, useRef, useState } from "react";
import { useNaliChat } from "@/lib/hooks/useNaliChat";

/* -------------------------------------------------------------------------- */
/*  ArticleTutor                                                               */
/*                                                                            */
/*  Floating "Tanya NaLI" button + slide-over drawer that gives the existing  */
/*  RAG assistant (/api/chat) a per-article home. RAG is scoped to the current */
/*  article via nodeSlug. Streaming logic is shared through useNaliChat.        */
/*                                                                            */
/*  Layout: right-side panel on desktop, bottom sheet on mobile (<=640px).     */
/* -------------------------------------------------------------------------- */

interface ArticleTutorProps {
  slug: string;
  title: string;
  /** Confirmed cross-article contradictions touching this article (Step 2.1). */
  contradictionCount?: number;
}

/** Article-aware starter prompts that map to the page's own sections. */
const STARTERS = [
  "Apa klaim utama tulisan ini?",
  "Apa batasan atau hal yang belum pasti?",
  "Sumber apa saja yang mendukung tulisan ini?",
];

export function ArticleTutor({ slug, title, contradictionCount = 0 }: ArticleTutorProps) {
  const [open, setOpen] = useState(false);
  const { messages, input, setInput, handleSubmit, send, isLoading, error } =
    useNaliChat({ nodeSlug: slug, nodeType: "artikel", nodeLabel: title });

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Body scroll-lock + focus the input on open; restore focus to the opener on close.
  useEffect(() => {
    if (!open) return;
    const opener = openerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      opener?.focus();
    };
  }, [open]);

  // Esc to close + lightweight focus trap within the drawer.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, input, textarea, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* Floating opener */}
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 border border-ink bg-ink px-4 py-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-paper shadow-lg transition-colors hover:bg-ink-deep print:hidden"
      >
        <span aria-hidden>💬</span> Tanya NaLI
      </button>

      {/* Backdrop. z-[60] lifts it above the site's sticky nav (header z-50) so
          the nav is dimmed + non-interactive while the drawer is open. */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-ink-black/40 transition-opacity duration-200 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer: bottom sheet on mobile, right panel on desktop */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Tanya NaLI tentang: ${title}`}
        className={`fixed z-[70] flex flex-col border-ink bg-paper shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none
          inset-x-0 bottom-0 h-[85vh] rounded-t-xl border-t
          sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0
          ${
            open
              ? "translate-y-0 sm:translate-x-0"
              : "translate-y-full sm:translate-y-0 sm:translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-dashed border-ink/40 px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-gray">
              Asisten Riset NaLI
            </p>
            <p className="mt-1 truncate font-mono text-[0.72rem] leading-snug text-ink-charcoal">
              Tentang: <span className="text-ink">{title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup"
            className="shrink-0 border border-dashed border-ink/50 px-2.5 py-1 font-mono text-[0.7rem] text-ink transition-colors hover:bg-ink-wash"
          >
            Tutup ✕
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="font-mono text-[0.74rem] leading-relaxed text-gray">
                Tanyakan apa saja tentang tulisan ini. Jawaban dirangkai dari
                arsip riset NaLI.
              </p>
              <div className="space-y-2">
                {STARTERS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="block w-full border border-dashed border-ink/50 bg-paper px-3 py-2 text-left font-mono text-[0.74rem] text-ink transition-colors hover:bg-ink-wash"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
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
                <div className="mt-1 whitespace-pre-wrap font-mono text-[0.78rem] leading-relaxed text-ink-charcoal">
                  {msg.content ||
                    (isLoading && msg.role === "assistant" ? (
                      <span className="animate-pulse text-gray">
                        Sedang mencari di arsip…
                      </span>
                    ) : null)}
                </div>
              </div>
            ))
          )}

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
          className="flex items-center gap-2 border-t border-dashed border-ink/40 px-5 py-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya tentang tulisan ini…"
            className="flex-1 border border-dashed border-ink/50 bg-paper px-3 py-2 font-mono text-[0.78rem] text-ink placeholder:text-gray/60 focus:border-ink focus:outline-none"
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

        {/* Honesty line + connection seam for Phase 2 (contradiction detector). */}
        <div className="border-t border-dashed border-ink/30 px-5 py-2.5">
          <p className="font-mono text-[0.64rem] leading-relaxed text-ink/55">
            Jawaban dirangkai dari arsip NaLI dan bisa keliru, selalu cek sumber
            aslinya.
          </p>
          {contradictionCount > 0 && (
            <a
              href="#kontradiksi"
              onClick={() => setOpen(false)}
              className="mt-2 inline-block font-mono text-[0.7rem] font-semibold text-[#9c3c08] hover:underline dark:text-[#f0a36e]"
            >
              Lihat {contradictionCount} klaim yang diperdebatkan →
            </a>
          )}
        </div>
      </div>
    </>
  );
}
