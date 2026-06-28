"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  useNaliChat                                                                */
/*                                                                            */
/*  Shared streaming-chat logic for the NaLI RAG assistant (/api/chat).        */
/*  Used by both the knowledge-graph side panel (AIChatPanel) and the          */
/*  per-article tutor drawer (ArticleTutor). Single source of truth for the    */
/*  fetch + ReadableStream handling so streaming bugs are fixed in one place.  */
/* -------------------------------------------------------------------------- */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface UseNaliChatOptions {
  /** Slug of the scoped node/article (scopes RAG retrieval). */
  nodeSlug?: string;
  /** Node type (artikel, sumber, seri, topik). */
  nodeType?: string;
  /** Display label of the node/article. */
  nodeLabel?: string;
}

export interface UseNaliChat {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  /** Submit an arbitrary prompt directly (e.g. a starter-question chip). */
  send: (text: string) => void;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useNaliChat({
  nodeSlug,
  nodeType,
  nodeLabel,
}: UseNaliChatOptions): UseNaliChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset chat when the scoped node changes (graph panel switches nodes).
  const prevSlugRef = useRef(nodeSlug);
  useEffect(() => {
    if (prevSlugRef.current !== nodeSlug) {
      setMessages([]);
      setError(null);
      prevSlugRef.current = nodeSlug;
    }
  }, [nodeSlug]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setInput("");
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setInput("");
      setError(null);

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      // Snapshot the prior history synchronously for the request body.
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      (async () => {
        try {
          abortRef.current = new AbortController();

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: apiMessages,
              nodeSlug,
              nodeType,
              nodeLabel,
            }),
            signal: abortRef.current.signal,
          });

          if (!res.ok) throw new Error(`Server error: ${res.status}`);

          const reader = res.body?.getReader();
          if (!reader) throw new Error("No response body");

          const decoder = new TextDecoder();
          let accumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: accumulated } : m,
              ),
            );
          }

          // A 200 with an empty body means the model produced nothing (e.g. a
          // swallowed provider error or exhausted quota). Never leave a blank
          // bubble: show a graceful fallback instead.
          if (!accumulated.trim()) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content:
                        "Maaf, jawaban tidak dapat dirangkai saat ini. Coba lagi sebentar.",
                    }
                  : m,
              ),
            );
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          setError("Terjadi kesalahan. Coba lagi.");
          // Drop the empty assistant bubble on error.
          setMessages((prev) =>
            prev.filter((m) => m.id !== assistantMsg.id || m.content.length > 0),
          );
        } finally {
          setIsLoading(false);
          abortRef.current = null;
        }
      })();
    },
    [isLoading, messages, nodeSlug, nodeType, nodeLabel],
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      send(input);
    },
    [input, send],
  );

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    send,
    isLoading,
    error,
    reset,
  };
}
