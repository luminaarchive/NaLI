"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquare } from "lucide-react";
import { NaLIChatLogo, NaLIChatLogoAnimated } from "./NaLIChatLogo";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ConversationThreadProps {
  messages: ConversationMessage[];
  isLastMessageStreaming?: boolean;
}

function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

export function ConversationThread({ messages, isLastMessageStreaming = false }: ConversationThreadProps) {
  const followUps = messages.slice(2);
  if (followUps.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 border-t border-white/[0.07]" />
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
          <MessageSquare className="h-3 w-3" />
          Percakapan Lanjutan
        </span>
        <div className="flex-1 border-t border-white/[0.07]" />
      </div>

      <div className="space-y-5">
        {followUps.map((msg, idx) => {
          const isLastMsg = idx === followUps.length - 1;
          const isStreaming = isLastMessageStreaming && isLastMsg && msg.role === "assistant";

          return (
            <div key={idx}>
              {msg.role === "user" ? (
                <div className="flex flex-col items-end">
                  <div className="max-w-[85%] rounded-2xl border-l-2 border-[#00FFB3]/40 bg-[#00FFB3]/5 px-4 py-3">
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="mt-1 text-[10px] text-white/25 pr-1">
                    Kamu &middot; {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-2">
                    {isStreaming ? (
                      <NaLIChatLogoAnimated size={20} />
                    ) : (
                      <NaLIChatLogo size={20} />
                    )}
                    <span className="text-[10px] font-semibold text-white/35">NaLI</span>
                    <span className="text-[10px] text-white/20">&middot; {formatTimestamp(msg.timestamp)}</span>
                  </div>
                  <div className="w-full rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-4 prose prose-invert prose-sm max-w-none nali-thread-content">
                    <style>{`
                      .nali-thread-content p { color: rgba(245,240,232,0.75); font-size: 0.875rem; line-height: 1.7; margin-bottom: 0.6rem; }
                      .nali-thread-content h1,.nali-thread-content h2,.nali-thread-content h3 { color: rgba(245,240,232,0.85); font-weight: 700; }
                      .nali-thread-content ul,.nali-thread-content ol { color: rgba(245,240,232,0.70); padding-left: 1.2rem; }
                      .nali-thread-content li { font-size: 0.875rem; margin-bottom: 0.2rem; }
                      .nali-thread-content table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
                      .nali-thread-content th { background: rgba(255,255,255,0.04); color: rgba(245,240,232,0.55); padding: 0.4rem 0.6rem; border: 1px solid rgba(255,255,255,0.07); font-size: 0.7rem; }
                      .nali-thread-content td { padding: 0.4rem 0.6rem; border: 1px solid rgba(255,255,255,0.05); color: rgba(245,240,232,0.65); }
                      .nali-thread-content code { background: rgba(255,255,255,0.06); padding: 0.1em 0.3em; border-radius: 3px; color: #00FFB3; font-size: 0.82em; }
                    `}</style>
                    {msg.content === "" ? (
                      <span className="inline-block w-2 h-4 bg-[#00FFB3]/60 animate-pulse" />
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
