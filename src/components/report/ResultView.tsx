"use client";

import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Clipboard, Download, FileText, MoreHorizontal, Plus, Sparkles, X } from "lucide-react";
import { type ConversationMessage } from "./ConversationThread";
import { FollowUpComposer, type FollowUpComposerHandle } from "./FollowUpComposer";
import { parseNaLIOutput } from "@/lib/parse-nali-output";
import { calculatePalantirScore } from "@/lib/calculate-palantir-score";
import { buildExportPayloadFromMarkdown } from "@/lib/reports/buildExportPayload";
import { UserMessage } from "@/components/agent/UserMessage";
import { NaLIMessage } from "@/components/agent/NaLIMessage";
import { NaLIChatLogo } from "./NaLIChatLogo";
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

// Report types offered in the clarifying step (Sprint 20, Part 5).
const REPORT_FORMATS = [
  "Observasi Satwa",
  "Laporan KKN",
  "Draft Jurnal Ilmiah",
  "Praktikum Biologi",
  "Survei Biodiversitas",
  "Ringkasan Umum",
] as const;

// Lightweight scan of the conversation to flag which core fields are still missing,
// so the clarifying step only asks for what isn't already there. Heuristic only —
// it never fabricates data, just nudges the user.
function detectMissingData(messages: ConversationMessage[]): string[] {
  const text = messages
    .map((m) => m.content)
    .join("\n")
    .toLowerCase();
  const missing: string[] = [];
  const hasSpecies =
    /\b(spesies|species|jenis|burung|elang|macan|harimau|orangutan|owa|lutung|ular|katak|kupu|primata|mamalia|reptil|amfibi|ikan|serangga|tumbuhan|pohon|anggrek)\b/.test(
      text,
    );
  const hasLocation =
    /\b(lokasi|koordinat|gps|lintang|bujur|desa|hutan|gunung|taman nasional|tn\b|kawasan|kabupaten|provinsi|-?\d{1,3}\.\d{3,})\b/.test(
      text,
    );
  const hasTime =
    /\b(tanggal|jam|pukul|pagi|siang|sore|malam|kemarin|hari ini|\d{1,2}[/-]\d{1,2}|\d{1,2}\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des))\b/.test(
      text,
    );
  const hasEvidence = /\b(foto|video|gambar|rekaman|audio|sampel|spesimen|jejak|kotoran|suara|dokumentasi)\b/.test(
    text,
  );
  if (!hasSpecies) missing.push("spesies / objek pengamatan");
  if (!hasLocation) missing.push("lokasi / koordinat GPS");
  if (!hasTime) missing.push("tanggal & jam");
  if (!hasEvidence) missing.push("bukti (foto/video/sampel)");
  return missing;
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
  // Sprint 20: clarifying gate state for the "Susun Laporan" button.
  const [reportGateOpen, setReportGateOpen] = useState(false);
  const [gateFormat, setGateFormat] = useState<string | null>(null);
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
  }, [messages, isFollowUpStreaming, reportGateOpen]);

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
  const handleExport = async (format: "pdf" | "docx", content: string) => {
    if (!content || exporting) return;
    setMenuOpen(false);
    setExporting(format);
    try {
      const payload = buildExportPayloadFromMarkdown(content, prompt);
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

  // Generate (or fetch existing) public read-only share link for this report.
  // Resolves to the shareable URL; throws with a user-facing message on failure.
  const shareReport = async (): Promise<string> => {
    if (!sessionId) throw new Error("Laporan belum tersimpan. Tunggu sebentar lalu coba lagi.");
    const res = await fetch("/api/share-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sessionId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) throw new Error(data?.error || "Gagal membuat link berbagi.");
    return data.url as string;
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

  // Core fields still absent from the conversation (shown in the clarifying step).
  const missingData = useMemo(() => detectMissingData(messages), [messages]);

  const openReportGate = () => {
    setGateFormat(null);
    setReportGateOpen(true);
  };

  const handleGenerateReport = () => {
    const fmt = gateFormat ?? "Ringkasan Umum";
    setReportGateOpen(false);
    setGateFormat(null);
    composerHandleRef.current?.submitReport(fmt);
  };

  // Index of the last assistant message (for isLatest / isStreaming).
  const lastAssistantIdx = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "assistant") return i;
    return -1;
  }, [messages]);

  // Precompute per-message metadata (primary flag + score delta) purely,
  // without mutating render-scoped variables.
  const messageMeta = useMemo(() => {
    // Only structured reports (those carrying the journal header) are scored.
    const scores = messages.map((m) =>
      m.role === "assistant" && m.content.includes("---NALI-HEADER---") ? scoreOf(m.content) : null,
    );
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
              thinkingModelLabel={thinkingModelLabel}
              thinkingElapsed={isPrimary ? thinkingElapsed : undefined}
              scoreDelta={delta}
              exporting={exporting}
              onCopy={handleCopy}
              onExport={handleExport}
              canShare={Boolean(sessionId)}
              onShare={shareReport}
              onAnswerQuestion={(num, question) =>
                composerHandleRef.current?.prefill(`Jawaban untuk: "${question}"\n\n`)
              }
            />
          );
        })}

        {/* Clarifying step — confirmation gate before the journal pipeline runs (Sprint 20). */}
        {reportGateOpen && (
          <div className="rounded-2xl border border-[#00FFB3]/20 bg-[#00FFB3]/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <NaLIChatLogo size={18} />
                <span className="text-[12px] font-semibold text-white/70">Sebelum aku susun laporannya</span>
              </div>
              <button
                onClick={() => setReportGateOpen(false)}
                aria-label="Tutup"
                className="flex h-6 w-6 items-center justify-center rounded-md text-white/40 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="mb-2.5 text-[12.5px] leading-relaxed text-white/60">Pilih jenis laporan yang kamu mau:</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {REPORT_FORMATS.map((fmt) => {
                const active = gateFormat === fmt;
                return (
                  <button
                    key={fmt}
                    onClick={() => setGateFormat(fmt)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12px] font-medium transition",
                      active
                        ? "border-[#00FFB3]/50 bg-[#00FFB3]/15 text-[#00FFB3]"
                        : "border-white/[0.1] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/85",
                    )}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>

            {missingData.length > 0 && (
              <div className="mb-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
                <p className="mb-1.5 text-[11.5px] font-semibold text-white/55">
                  Data ini belum ada di percakapan (boleh dilengkapi, boleh dilewati):
                </p>
                <ul className="space-y-1">
                  {missingData.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] text-white/50">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#F59E0B]/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleGenerateReport}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#00FFB3] px-4 py-2 text-[12.5px] font-semibold text-[#050F12] transition hover:bg-[#00FFB3]/90"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Susun Laporan Sekarang
              </button>
              <span className="text-[11.5px] text-white/35">atau lengkapi datanya dulu di kotak bawah</span>
            </div>
          </div>
        )}

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
            onRequestReport={openReportGate}
          />
        </div>
      </div>
    </div>
  );
}
