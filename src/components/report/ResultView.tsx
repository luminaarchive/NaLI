"use client";

import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Clipboard, Download, FileText, MoreHorizontal, Plus } from "lucide-react";
import { type ConversationMessage } from "./ConversationThread";
import { FollowUpComposer, type FollowUpComposerHandle } from "./FollowUpComposer";
import { parseNaLIOutput, type ParsedNaLIOutput } from "@/lib/parse-nali-output";
import { calculatePalantirScore, type PalantirScore } from "@/lib/calculate-palantir-score";
import { UserMessage } from "@/components/agent/UserMessage";
import { NaLIMessage } from "@/components/agent/NaLIMessage";
import { cn } from "@/lib/utils";

interface ResultViewProps {
  prompt: string;
  result: string;
  model: string | null;
  sessionId: string | null;
  onNewReport: () => void;
  conversationMessages: ConversationMessage[];
  onConversationUpdate: Dispatch<SetStateAction<ConversationMessage[]>>;
  onSessionIdUpdate: (id: string | null) => void;
  thinkingModelLabel?: string;
  thinkingElapsed?: number;
  selectedEngine?: string;
}

function scoreOf(content: string): number {
  return calculatePalantirScore(parseNaLIOutput(content)).overall;
}

export function ResultView({
  prompt,
  result,
  sessionId,
  onNewReport,
  conversationMessages,
  onConversationUpdate,
  onSessionIdUpdate,
  thinkingModelLabel,
  thinkingElapsed,
  selectedEngine,
}: ResultViewProps) {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const composerHandleRef = useRef<FollowUpComposerHandle>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // The thread is the conversation. Fall back to a synthetic pair if empty.
  const messages: ConversationMessage[] = useMemo(() => {
    if (conversationMessages.length > 0) return conversationMessages;
    const now = new Date().toISOString();
    return [
      { role: "user", content: prompt, timestamp: now },
      { role: "assistant", content: result, timestamp: now },
    ];
  }, [conversationMessages, prompt, result]);

  // Latest full report content (for the header menu export).
  const latestReport = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant" && messages[i].content.trim()) return messages[i].content;
    }
    return result;
  }, [messages, result]);

  const title = useMemo(() => {
    const firstUser = messages.find((m) => m.role === "user")?.content ?? prompt;
    return firstUser.slice(0, 60) + (firstUser.length > 60 ? "..." : "");
  }, [messages, prompt]);

  // Auto-scroll to the newest content.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isFollowUpStreaming]);

  // Close the header menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  // ── Export helpers ─────────────────────────────────────────────────────
  function buildExportPayload(parsedOut: ParsedNaLIOutput, score: PalantirScore, rawMarkdown: string) {
    const titleMatch = rawMarkdown.match(/^#\s+(.+)/m);
    const reportTitle = titleMatch?.[1]?.trim() || prompt?.slice(0, 80) || "Laporan NaLI";

    const sections: Array<[string, string]> = [];
    const headingRe = /^##\s+(.+)\n([\s\S]*?)(?=^##\s|\n---NALI|$)/gm;
    let m: RegExpExecArray | null;
    while ((m = headingRe.exec(rawMarkdown)) !== null) {
      const heading = m[1].trim().toUpperCase();
      const sbody = m[2].trim();
      const skip = ["ABSTRAK", "ABSTRACT", "KATA KUNCI", "KEYWORDS"];
      if (sbody && !skip.some((s) => heading.includes(s))) sections.push([heading, sbody]);
    }

    const abstractId = /##\s+Abstrak\s*\n([\s\S]*?)(?=^##\s|---NALI)/im.exec(rawMarkdown)?.[1]?.trim() ?? "";
    const abstractEn = /##\s+Abstract\s*\n([\s\S]*?)(?=^##\s|---NALI)/im.exec(rawMarkdown)?.[1]?.trim() ?? "";

    const evTable: string[][] = [["Klaim", "Pilar Bukti", "Status", "Catatan"]];
    for (const row of parsedOut.evidenceTable) {
      evTable.push([row.klaim || "", row.sumber || "", row.status || "", row.keterangan || ""]);
    }
    const missing = parsedOut.missingEvidence.map((item, i) => [
      String(item.number ?? i + 1),
      item.item ?? "",
      item.reason ?? "",
    ]);
    const questions = parsedOut.followUpQuestions.map((q) => q.question ?? "");
    const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    return {
      title: reportTitle,
      subtitle: "Draft Laporan Berbasis Bukti — NaLI Evidence Intelligence OS v2.0",
      date: today,
      score: score.overall,
      level: score.level,
      kualitas: parsedOut.header?.kualitasBukti ?? "Sedang",
      risiko: parsedOut.header?.risikoKlaim ?? "Sedang",
      tipe: parsedOut.header?.tipeLaporan ?? "Laporan",
      g: score.genetic,
      v: score.visual,
      h: score.habitat,
      i: score.integrity,
      li: score.linguisticMultiplier,
      decay: score.temporalDecay,
      abstract_id: abstractId,
      abstract_en: abstractEn,
      keywords: (parsedOut.header?.tipeLaporan ?? "") + ", NaLI, laporan berbasis bukti",
      sections:
        sections.length > 0
          ? sections
          : [
              [
                "LAPORAN",
                rawMarkdown
                  .replace(/^#+.+$/gm, "")
                  .trim()
                  .slice(0, 2000),
              ],
            ],
      ev_table: evTable.length > 1 ? evTable : [["Klaim", "Pilar Bukti", "Status", "Catatan"]],
      missing,
      questions,
      refs: [],
    };
  }

  const handleExport = async (format: "pdf" | "docx", content: string) => {
    if (!content || exporting) return;
    setMenuOpen(false);
    setExporting(format);
    try {
      const parsedOut = parseNaLIOutput(content);
      const score = calculatePalantirScore(parsedOut);
      const payload = buildExportPayload(parsedOut, score, content);
      const endpoint = format === "pdf" ? "/api/export-pdf" : "/api/export-docx";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error(`Export ${format} failed (${res.status}):`, await res.text());
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        String(payload.title)
          .slice(0, 50)
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_\-]/g, "") + `.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(null);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setMenuOpen(false);
  };

  // ── Follow-up streaming wiring (composer drives conversationMessages) ────
  const handleStreamStart = (userMsg: ConversationMessage) => {
    setFollowUpError(null);
    setIsFollowUpStreaming(true);
    const emptyAssistant: ConversationMessage = { role: "assistant", content: "", timestamp: new Date().toISOString() };
    onConversationUpdate([...messages, userMsg, emptyAssistant]);
  };

  // The composer streams tokens; we append them to the in-flight assistant message.
  const handleStreamTokenAccumulate = (token: string) => {
    onConversationUpdate((prev: ConversationMessage[]) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === "assistant") {
        updated[updated.length - 1] = { ...last, content: last.content + token };
      }
      return updated;
    });
  };

  const handleStreamDone = (finalSessionId: string | null) => {
    setIsFollowUpStreaming(false);
    if (finalSessionId) onSessionIdUpdate(finalSessionId);
  };

  const handleFollowUpError = (msg: string) => {
    setIsFollowUpStreaming(false);
    setFollowUpError(msg === "Dihentikan." ? null : msg);
    onConversationUpdate((prev: ConversationMessage[]) => {
      const updated = [...prev];
      if (updated[updated.length - 1]?.role === "assistant" && updated[updated.length - 1]?.content === "") {
        updated.pop();
      }
      return updated;
    });
  };

  const composerPlaceholder = isFollowUpStreaming
    ? "NaLI sedang menganalisis lapangan..."
    : "Jawab pertanyaan NaLI, tambah data, atau minta revisi...";

  // Index of the last assistant message (for isLatest / isStreaming).
  const lastAssistantIdx = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "assistant") return i;
    return -1;
  }, [messages]);

  // Precompute per-message metadata (primary flag + score delta) purely,
  // without mutating render-scoped variables.
  const messageMeta = useMemo(() => {
    const scores = messages.map((m) => (m.role === "assistant" && m.content.trim() ? scoreOf(m.content) : null));
    const assistantIdxs = messages.map((m, i) => (m.role === "assistant" ? i : -1)).filter((i) => i >= 0);
    const firstAssistant = assistantIdxs[0] ?? -1;

    return messages.map((m, i) => {
      if (m.role !== "assistant") return { isPrimary: false, delta: null as { before: number; after: number } | null };
      const isPrimary = i === firstAssistant;
      const priorScored = assistantIdxs.filter((j) => j < i && scores[j] !== null);
      const prevIdx = priorScored.length ? priorScored[priorScored.length - 1] : -1;
      const thisScore = scores[i];
      const delta =
        !isPrimary && prevIdx >= 0 && thisScore !== null
          ? { before: scores[prevIdx] as number, after: thisScore }
          : null;
      return { isPrimary, delta };
    });
  }, [messages]);

  return (
    <div className="flex w-full flex-col">
      {/* Thin thread header */}
      <div className="sticky top-0 z-20 -mx-4 mb-2 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0A0A0A]/95 px-4 py-2.5 backdrop-blur-sm md:-mx-8 md:px-8">
        <button
          onClick={onNewReport}
          className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{title}</span>
        </button>

        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/[0.06] hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute top-[calc(100%+6px)] right-0 z-30 w-52 overflow-hidden rounded-xl border border-white/[0.1] bg-[#161616] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              {[
                { label: "Salin teks", icon: Clipboard, action: () => handleCopy(latestReport) },
                { label: "Unduh PDF", icon: Download, action: () => handleExport("pdf", latestReport) },
                { label: "Unduh DOCX", icon: FileText, action: () => handleExport("docx", latestReport) },
                { label: "Buat laporan baru", icon: Plus, action: onNewReport },
              ].map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-white/70 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversation thread */}
      <div className="space-y-7 pt-4">
        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return <UserMessage key={i} content={msg.content} />;
          }
          const { isPrimary, delta } = messageMeta[i];
          const isStreaming = isFollowUpStreaming && i === lastAssistantIdx;

          return (
            <NaLIMessage
              key={i}
              content={msg.content}
              timestamp={msg.timestamp}
              isPrimary={isPrimary}
              isLatest={i === lastAssistantIdx}
              isStreaming={isStreaming}
              thinkingModelLabel={isPrimary ? thinkingModelLabel : undefined}
              thinkingElapsed={isPrimary ? thinkingElapsed : undefined}
              scoreDelta={delta}
              exporting={exporting}
              onCopy={handleCopy}
              onExport={handleExport}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Pinned composer */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-6 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent px-4 pt-8 pb-4 md:-mx-8 md:px-8">
        <div className="mx-auto max-w-[760px]">
          {followUpError && (
            <div className="mb-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
              {followUpError}
            </div>
          )}
          <FollowUpComposer
            ref={composerHandleRef}
            variant="pinned"
            selectedModel={selectedEngine}
            sessionId={sessionId}
            conversationMessages={messages}
            placeholder={composerPlaceholder}
            onStreamStart={handleStreamStart}
            onStreamToken={handleStreamTokenAccumulate}
            onStreamDone={handleStreamDone}
            onError={handleFollowUpError}
          />
        </div>
      </div>
    </div>
  );
}
