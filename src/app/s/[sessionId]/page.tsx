// src/app/s/[sessionId]/page.tsx
// Manus-style chat session page with sidebar, streaming, and history.
// Full-screen layout — no PublicAppShell.

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Plus, Send, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NaLILogo, NaLILogoMark } from "@/components/ui/NaLILogo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/report/MarkdownRenderer";
import type { StreamChunk } from "@/lib/types/session";

// ─── Types (client-side only) ──────────────────────────────────
interface SessionMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  position: number;
  hasError?: boolean;
  errorMessage?: string;
}

interface SessionInfo {
  id: string;
  title: string | null;
  first_query: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Extracted static components ───────────────────────────────

function MessageBubble({
  message,
  streaming,
}: {
  message: SessionMessage;
  streaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="mt-1 flex-shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#14261c] bg-[#1e3525]">
            <NaLILogoMark variant="light" size={14} />
          </div>
        </div>
      )}

      {/* Message content */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-[#1e3525] text-[#f5f0e8]"
            : "rounded-bl-sm border border-[#14261c] bg-[#08100c] text-[#f5f0e8]"
        } ${message.hasError ? "border-red-500/40 bg-red-950/20" : ""}`}
      >
        {message.hasError && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span>Terjadi kesalahan</span>
          </div>
        )}

        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {streaming && (
          <span className="ml-0.5 inline-block animate-pulse text-[#00FFB3]">
            ▋
          </span>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="mt-1 flex-shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1e3525]/40 bg-[#14261c]">
            <span className="text-[10px] text-[#a1b3a8]">U</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  sessions,
  sessionId,
  onNewChat,
}: {
  sessions: SessionInfo[];
  sessionId: string;
  onNewChat: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0b1a12]">
      <div className="flex items-center justify-between border-b border-[#14261c] px-4 py-3">
        <NaLILogo variant="light" size={24} />
        <Button
          variant="ghost"
          size="icon"
          className="text-[#f5f0e8]/60 hover:bg-[#14261c] hover:text-[#00FFB3]"
          onClick={onNewChat}
          title="Percakapan baru"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        {sessions.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-[#a1b3a8]/50">
            Belum ada riwayat percakapan.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/s/${s.id}`}
                className={`block truncate rounded-lg px-3 py-2 text-sm leading-snug transition-colors duration-100 ${
                  s.id === sessionId
                    ? "bg-[#1e3525] text-[#f5f0e8]"
                    : "text-[#a1b3a8] hover:bg-[#14261c] hover:text-[#f5f0e8]"
                }`}
              >
                {s.title ?? s.first_query ?? "Percakapan"}
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-[#14261c] px-4 py-3">
        <p className="text-[10px] leading-relaxed text-[#a1b3a8]/40">
          NaLI CP1 · Public alpha non-paid
        </p>
      </div>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────
export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error" | "not_found">("loading");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleNewChat = useCallback(() => router.push("/"), [router]);

  // ── Scroll to bottom ──────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // ── Load session ──────────────────────────────────────────
  const loadSession = useCallback(async () => {
    setLoadState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.status === 404) {
        setLoadState("not_found");
        return;
      }
      if (!res.ok) {
        setLoadState("error");
        return;
      }
      const data = await res.json();
      setSessionTitle(data.title ?? data.first_query ?? null);
      setMessages(
        (data.nali_messages ?? []).map(
          (m: {
            id: string;
            role: string;
            content: string;
            createdAt: string;
            position: number;
            hasError?: boolean;
            errorMessage?: string;
          }) => ({
            id: m.id,
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
            createdAt: m.createdAt,
            position: m.position,
            hasError: m.hasError,
            errorMessage: m.errorMessage,
          }),
        ),
      );
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // ── Load session list for sidebar ─────────────────────────
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions ?? []);
        }
      } catch {
        // Sidebar history is non-critical
      }
    }
    loadSessions();
  }, [sessionId]);

  // ── Send follow-up message ────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setInput("");
    setError(null);

    // Optimistic user message
    const tempUserMsg: SessionMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
      position: messages.length,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: string }).error ?? "Gagal mengirim pesan",
        );
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (!reader) throw new Error("No stream body");

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (done) break;

        const text = decoder.decode(result.value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const chunk = JSON.parse(line.slice(6)) as StreamChunk;

            if (chunk.type === "delta" && chunk.content) {
              fullContent += chunk.content;
              setStreamingContent(fullContent);
            } else if (chunk.type === "done") {
              const finalMsg: SessionMessage = {
                id: chunk.messageId ?? `msg-${Date.now()}`,
                role: "assistant",
                content: fullContent,
                createdAt: new Date().toISOString(),
                position: messages.length + 1,
              };
              setMessages((prev) => [...prev, finalMsg]);
              setStreamingContent("");
            } else if (chunk.type === "error") {
              throw new Error(chunk.error ?? "Terjadi kesalahan");
            }
          } catch (parseErr) {
            // Re-throw real errors, skip parse errors
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
              if (parseErr.message.includes("Terjadi") || parseErr.message.includes("Gagal")) {
                throw parseErr;
              }
            }
          }
        }
      }
    } catch (err) {
      // Show inline error — do NOT navigate away, do NOT lose messages
      const errMsg =
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.";
      setError(errMsg);
      // Keep the optimistic user message — it was the user's actual input
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      textareaRef.current?.focus();
    }
  }, [input, isStreaming, sessionId, messages.length]);

  // ── Keyboard shortcut ─────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── Loading state ─────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060b08]">
        <div className="flex flex-col items-center gap-3">
          <NaLILogo variant="light" size={32} href={null} />
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#00FFB3]"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── 404 state — redirect home ─────────────────────────────
  if (loadState === "not_found") {
    router.push("/");
    return (
      <div className="flex h-screen items-center justify-center bg-[#060b08]">
        <p className="text-sm text-[#a1b3a8]">Sesi tidak ditemukan. Mengarahkan…</p>
      </div>
    );
  }

  // ── Error state — retry button ────────────────────────────
  if (loadState === "error") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#060b08]">
        <NaLILogo variant="light" size={32} href={null} />
        <p className="text-sm text-[#a1b3a8]">Gagal memuat percakapan.</p>
        <div className="flex gap-3">
          <Button
            onClick={loadSession}
            className="rounded-xl bg-[#1e3525] text-[#f5f0e8] hover:bg-[#162d1d]"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Coba lagi
          </Button>
          <Button
            variant="ghost"
            onClick={handleNewChat}
            className="rounded-xl text-[#a1b3a8] hover:bg-[#14261c] hover:text-[#f5f0e8]"
          >
            Kembali ke beranda
          </Button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#060b08] text-[#f5f0e8]">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] flex-shrink-0 border-r border-[#14261c] md:flex">
        <SidebarContent sessions={sessions} sessionId={sessionId} onNewChat={handleNewChat} />
      </aside>

      {/* Main chat area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex flex-shrink-0 items-center gap-3 border-b border-[#14261c] bg-[#060b08]/80 px-4 py-3 backdrop-blur-sm">
          {/* Mobile sidebar trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#f5f0e8]/60 hover:bg-[#14261c] hover:text-[#f5f0e8] md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[260px] border-r border-[#14261c] bg-[#0b1a12] p-0"
            >
              <SidebarContent sessions={sessions} sessionId={sessionId} onNewChat={handleNewChat} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#f5f0e8]">
              {sessionTitle ?? "Percakapan"}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-[#f5f0e8]/60 hover:bg-[#14261c] hover:text-[#00FFB3]"
            onClick={handleNewChat}
            title="Percakapan baru"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </header>

        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-[720px]">
            {/* Error banner — inline, does NOT navigate away */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400/60 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Streaming assistant response */}
            {isStreaming && streamingContent && (
              <MessageBubble
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingContent,
                  createdAt: new Date().toISOString(),
                  position: messages.length,
                }}
                streaming
              />
            )}

            {/* Typing indicator (before first token) */}
            {isStreaming && !streamingContent && (
              <div className="mb-4 flex justify-start gap-3">
                <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#14261c] bg-[#1e3525]">
                  <NaLILogoMark variant="light" size={14} />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-[#14261c] bg-[#08100c] px-4 py-3">
                  <div className="flex h-5 items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#00FFB3]/60"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {/* Input bar — sticky bottom */}
        <div className="flex-shrink-0 border-t border-[#14261c] bg-[#060b08] px-4 py-3">
          <div className="mx-auto max-w-[720px]">
            <div className="flex items-end gap-2 rounded-2xl border border-[#14261c] bg-[#08100c] px-4 py-3 transition-colors focus-within:border-[#1e3525]">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tindak lanjuti atau ajukan pertanyaan baru…"
                rows={1}
                disabled={isStreaming}
                className="max-h-[160px] min-h-[24px] flex-1 resize-none overflow-y-auto border-none bg-transparent p-0 text-sm leading-relaxed text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
              />
              <Button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                size="icon"
                className="h-8 w-8 flex-shrink-0 rounded-xl bg-[#00FFB3] text-[#060b08] transition-all duration-150 hover:bg-[#00e6a0] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#a1b3a8]/35">
              NaLI menghasilkan draft berdasarkan input kamu. Batas bukti tetap
              milik pengguna.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
