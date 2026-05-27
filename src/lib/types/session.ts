// src/lib/types/session.ts
// Type definitions for the NaLI chat session system.
// Server-only fields (model_slug, tokens_used, generation_ms) are
// intentionally excluded — they must never reach the client.

export type MessageRole = "user" | "assistant" | "system";

export interface NaLIMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  position: number;
  hasError?: boolean;
  errorMessage?: string;
}

export interface NaLISession {
  id: string;
  userId: string | null;
  title: string | null;
  firstQuery: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  messages?: NaLIMessage[];
}

/** What the client sends to create a new session */
export interface CreateSessionRequest {
  query: string;
}

/** What the client sends to add a follow-up message */
export interface SendMessageRequest {
  sessionId: string;
  content: string;
}

/** Streaming chunk format (Server-Sent Events) */
export interface StreamChunk {
  type: "delta" | "done" | "error" | "session_created";
  content?: string;
  sessionId?: string;
  messageId?: string;
  error?: string;
}
