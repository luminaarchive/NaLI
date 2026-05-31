"use client";

import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Clipboard, ClipboardCheck, Download, Loader2, X } from "lucide-react";
import { ConversationThread, type ConversationMessage } from "./ConversationThread";
import { FollowUpComposer } from "./FollowUpComposer";
import { parseNaLIOutput } from "@/lib/parse-nali-output";
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
}

type TabId = "laporan" | "bukti" | "data-hilang" | "pertanyaan" | "tindakan";

function scoreColor(score: number): string {
  if (score >= 80) return "#00FFB3";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#FB7185";
}

function pillarColor(val: number): string {
  if (val >= 0.8) return "#00FFB3";
  if (val >= 0.6) return "#F59E0B";
  if (val >= 0.4) return "#F97316";
  return "#FB7185";
}

function statusColor(status: string): string {
  if (status.includes("Terkonfirmasi")) return "#00FFB3";
  if (status.includes("Inferensi")) return "#F59E0B";
  return "#FB7185";
}

function risikoColor(risiko: string): string {
  if (risiko === "Rendah") return "#00FFB3";
  if (risiko === "Sedang") return "#F59E0B";
  return "#FB7185";
}

function colourLabel(text: string): string {
  return text
    .replace(/\[Inferensi AI\]/g, '<mark class="nali-infer">[Inferensi AI]</mark>')
    .replace(/\[Bukti kurang\]/g, '<mark class="nali-weak">[Bukti kurang]</mark>')
    .replace(/\[Terkonfirmasi\]/g, '<mark class="nali-ok">[Terkonfirmasi]</mark>');
}

export function ResultView({
  prompt,
  result,
  model,
  sessionId,
  onNewReport,
  conversationMessages,
  onConversationUpdate,
  onSessionIdUpdate,
}: ResultViewProps) {
  const [copied, setCopied] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [isPDFGenerating, setIsPDFGenerating] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("laporan");
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [submittingQuestion, setSubmittingQuestion] = useState<number | null>(null);
  const [confidenceDelta, setConfidenceDelta] = useState<{ before: number; after: number } | null>(null);
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const followUpRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseNaLIOutput(result), [result]);
  const isV2 = parsed.version === "v2" && parsed.header !== null;
  const prevScore = useRef<number>(parsed.header?.palantir.overall ?? 0);

  useEffect(() => {
    prevScore.current = parsed.header?.palantir.overall ?? 0;
  }, [parsed.header?.palantir.overall]);

  const generatedAt = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const showDelta = (before: number, after: number) => {
    if (before === after) return;
    setConfidenceDelta({ before, after });
    if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
    deltaTimerRef.current = setTimeout(() => setConfidenceDelta(null), 5000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  const handleDownloadPDF = async () => {
    if (!result || isPDFGenerating) return;
    setIsPDFGenerating(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { NaLIPDFDocument } = await import("./NaLIPDFDocument");
      const { parseReportMarkdown } = await import("@/lib/parse-report-markdown");

      const bodyText = isV2 ? parsed.reportMarkdown : result;
      const parsedReport = parseReportMarkdown(bodyText);
      const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

      const docElement = NaLIPDFDocument({
        reportTitle: parsedReport.reportTitle,
        sections: parsedReport.sections,
        prompt: prompt || "",
        modelUsed: model || "openrouter/free",
        generatedAt: dateStr,
        v2Header: isV2 ? parsed.header : undefined,
        v2FollowUpQuestions: isV2 ? parsed.followUpQuestions : undefined,
      });

      const blob = await pdf(docElement).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NaLI_${parsedReport.reportTitle.slice(0, 40).replace(/[\s/\\:*?"<>|]+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setIsPDFGenerating(false);
    }
  };

  const handleStreamStart = (userMsg: ConversationMessage) => {
    setFollowUpError(null);
    setIsFollowUpStreaming(true);
    const emptyAssistant: ConversationMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    onConversationUpdate([...conversationMessages, userMsg, emptyAssistant]);
  };

  const handleStreamToken = (token: string) => {
    onConversationUpdate((prev: ConversationMessage[]) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === "assistant") {
        updated[updated.length - 1] = { ...last, content: last.content + token };
      }
      return updated;
    });
  };

  const handleStreamDone = (finalSessionId: string | null, fullText?: string) => {
    setIsFollowUpStreaming(false);
    if (finalSessionId) onSessionIdUpdate(finalSessionId);

    if (fullText && isV2) {
      const headerMatch = fullText.match(/---NALI-INTELLIGENCE-HEADER---([\s\S]*?)---END-INTELLIGENCE-HEADER---/);
      if (headerMatch) {
        const overallMatch = headerMatch[1].match(/PALANTIR CONFIDENCE SCORE:\s*([\d.]+)%/);
        if (overallMatch) {
          const newScore = parseFloat(overallMatch[1]);
          showDelta(prevScore.current, newScore);
          prevScore.current = newScore;
        }
      }
    }
  };

  const handleFollowUpError = (msg: string) => {
    setIsFollowUpStreaming(false);
    setFollowUpError(msg);
    onConversationUpdate((prev: ConversationMessage[]) => {
      const updated = [...prev];
      if (updated[updated.length - 1]?.role === "assistant" && updated[updated.length - 1]?.content === "") {
        updated.pop();
      }
      return updated;
    });
  };

  const submitQuestionAnswer = async (qNum: number, question: string, answer: string) => {
    const trimmed = answer.trim();
    if (!trimmed || submittingQuestion !== null) return;

    const fullPrompt = `Jawaban untuk pertanyaan NaLI:\n\nPertanyaan: ${question}\n\nJawaban: ${trimmed}`;
    const userMsg: ConversationMessage = {
      role: "user",
      content: `[Pertanyaan NaLI ${qNum}] ${trimmed}`,
      timestamp: new Date().toISOString(),
    };

    setSubmittingQuestion(qNum);
    setFollowUpError(null);
    setIsFollowUpStreaming(true);

    const emptyAssistant: ConversationMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    onConversationUpdate((prev) => [...prev, userMsg, emptyAssistant]);

    if (followUpRef.current) {
      followUpRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    let accumulated = "";
    let finalSessionId: string | null = sessionId;

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          messages: conversationMessages,
          sessionId,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        handleFollowUpError((data as Record<string, string>).error ?? "Gagal mengirim jawaban.");
        setSubmittingQuestion(null);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const parsedChunk = JSON.parse(raw);
            if (parsedChunk.token) {
              accumulated += parsedChunk.token;
              onConversationUpdate((prev: ConversationMessage[]) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: accumulated };
                }
                return updated;
              });
            }
            if (parsedChunk.done) {
              finalSessionId = parsedChunk.sessionId ?? sessionId;
              break outer;
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch {
      handleFollowUpError("Koneksi bermasalah. Coba lagi.");
      setSubmittingQuestion(null);
      return;
    }

    setIsFollowUpStreaming(false);
    setSubmittingQuestion(null);
    if (finalSessionId) onSessionIdUpdate(finalSessionId);

    if (accumulated && isV2) {
      const headerMatch = accumulated.match(/---NALI-INTELLIGENCE-HEADER---([\s\S]*?)---END-INTELLIGENCE-HEADER---/);
      if (headerMatch) {
        const overallMatch = headerMatch[1].match(/PALANTIR CONFIDENCE SCORE:\s*([\d.]+)%/);
        if (overallMatch) {
          const newScore = parseFloat(overallMatch[1]);
          showDelta(prevScore.current, newScore);
          prevScore.current = newScore;
        }
      }
    }

    setQuestionAnswers((prev) => ({ ...prev, [qNum]: "" }));
    setActiveTab("laporan");
  };

  const tabs: { id: TabId; label: string }[] = isV2
    ? [
        { id: "laporan", label: "Laporan" },
        { id: "bukti", label: "Bukti & Klaim" },
        { id: "data-hilang", label: "Data Hilang" },
        { id: "pertanyaan", label: "Pertanyaan NaLI" },
        { id: "tindakan", label: "Tindakan Cepat" },
      ]
    : [
        { id: "laporan", label: "Laporan" },
        { id: "tindakan", label: "Tindakan Cepat" },
      ];

  const palantir = parsed.header?.palantir;
  const hasDuplicate = palantir?.entityResolution?.includes("DUPLIKASI");

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col">
      {/* Confidence Delta Toast */}
      {confidenceDelta && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl transition-all",
            confidenceDelta.after > confidenceDelta.before
              ? "border-[#00FFB3]/30 bg-[#00FFB3]/10 text-[#00FFB3]"
              : "border-rose-400/30 bg-rose-400/10 text-rose-400",
          )}
        >
          <span>
            Palantir Score diperbarui: {confidenceDelta.before.toFixed(0)}%{" "}
            {confidenceDelta.after > confidenceDelta.before ? "naik ke" : "turun ke"} {confidenceDelta.after.toFixed(0)}
            %
            {confidenceDelta.after > confidenceDelta.before
              ? ` (+${(confidenceDelta.after - confidenceDelta.before).toFixed(0)}%)`
              : ` (-${(confidenceDelta.before - confidenceDelta.after).toFixed(0)}%)`}
          </span>
          <button
            onClick={() => setConfidenceDelta(null)}
            className="shrink-0 opacity-60 hover:opacity-100"
            aria-label="Tutup notifikasi"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#191919]/95 px-1 py-3 backdrop-blur-sm">
        <button
          onClick={onNewReport}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Buat laporan baru
        </button>
        <div className="flex items-center gap-2">
          {model && <span className="hidden font-mono text-[10px] text-white/25 sm:inline">{model}</span>}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
          >
            {copied ? (
              <>
                <ClipboardCheck className="h-3.5 w-3.5 text-[#00FFB3]" />
                Tersalin!
              </>
            ) : (
              <>
                <Clipboard className="h-3.5 w-3.5" />
                Salin teks
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isPDFGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPDFGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Menyiapkan PDF...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Unduh PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Palantir Score Panel - v2 only */}
      {isV2 && palantir && (
        <div className="mb-4 rounded-2xl border border-white/[0.08] bg-[#111]/80 p-4 shadow-xl">
          {/* Entity Resolution Banner */}
          {hasDuplicate && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              <span className="mt-0.5 shrink-0">!</span>
              <span>
                Entity Resolution: Terdeteksi kemungkinan data ganda dalam input. Skor dihitung berdasarkan individu
                unik setelah konsolidasi.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* LEFT: Large score */}
            <div className="shrink-0 text-center sm:min-w-[100px] sm:text-left">
              <div
                className="font-mono text-5xl leading-none font-bold"
                style={{ color: scoreColor(palantir.overall) }}
              >
                {palantir.overall.toFixed(0)}%
              </div>
              <div className="mt-1 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                {palantir.level}
              </div>
            </div>

            {/* CENTER: 4 pillar gauges */}
            <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-2">
              {[
                { label: "Genetik x0.60", val: palantir.geneticPillar },
                { label: "Visual x0.20", val: palantir.visualPillar },
                { label: "Habitat x0.15", val: palantir.habitatPillar },
                { label: "Integritas x0.10", val: palantir.integrityPillar },
              ].map(({ label, val }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-white/40">{label}</span>
                    <span className="font-mono text-[10px] font-semibold" style={{ color: pillarColor(val) }}>
                      {val.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(val * 100, 100)}%`,
                        backgroundColor: pillarColor(val),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Metadata pills */}
            <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-semibold text-white/60">
                Li {palantir.linguisticMultiplier.toFixed(2)}x
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-semibold text-white/60">
                P(t) {palantir.temporalDecayFactor.toFixed(2)}
              </span>
              {palantir.entityResolution && (
                <span className="max-w-[140px] text-right text-[9px] leading-tight text-white/30">
                  {palantir.entityResolution}
                </span>
              )}
            </div>
          </div>

          {/* Intelligence meta row */}
          {parsed.header && (
            <div className="mt-3 flex flex-wrap gap-3 border-t border-white/[0.05] pt-3">
              {[
                { label: "Tipe", val: parsed.header.tipeLaporan },
                { label: "Kualitas", val: parsed.header.kualitasBukti },
                { label: "Risiko", val: parsed.header.risikoKlaim },
                { label: "Publikasi", val: parsed.header.kesiapanPublikasi },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-semibold tracking-wider text-white/30 uppercase">{label}:</span>
                  <span className="text-white/70">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Original prompt block */}
      <div className="mb-4 rounded-xl border-l-2 border-[#00FFB3]/40 bg-white/[0.03] px-4 py-3">
        <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-[#00FFB3]/60 uppercase">Bahan kamu</p>
        <p className={`text-sm leading-relaxed text-white/50 italic ${!promptExpanded ? "line-clamp-3" : ""}`}>
          {prompt}
        </p>
        {prompt.length > 200 && (
          <button
            onClick={() => setPromptExpanded((v) => !v)}
            className="mt-1.5 text-[11px] text-[#00FFB3]/50 transition-colors hover:text-[#00FFB3]"
          >
            {promptExpanded ? "Sembunyikan" : "...lihat semua"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-1 overflow-x-auto border-b border-white/[0.07] pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-[#00FFB3] text-[#00FFB3]"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Laporan */}
      {activeTab === "laporan" && (
        <div>
          <hr className="mb-6 border-white/[0.06]" />
          <div className="prose prose-invert prose-sm nali-report-content max-w-none">
            <style>{`
              .nali-report-content h1 { font-size: 1.35rem; font-weight: 700; color: #f5f0e8; margin-bottom: 0.75rem; font-family: serif; }
              .nali-report-content h2 { font-weight: 700; color: rgba(245,240,232,0.85); margin-top: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; }
              .nali-report-content h3 { font-size: 0.9rem; font-weight: 600; color: rgba(245,240,232,0.8); }
              .nali-report-content p { color: rgba(245,240,232,0.75); line-height: 1.7; margin-bottom: 0.75rem; font-size: 0.875rem; }
              .nali-report-content ul, .nali-report-content ol { color: rgba(245,240,232,0.70); padding-left: 1.25rem; margin-bottom: 0.75rem; }
              .nali-report-content li { margin-bottom: 0.25rem; font-size: 0.875rem; }
              .nali-report-content table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.8rem; }
              .nali-report-content th { background: rgba(255,255,255,0.04); color: rgba(245,240,232,0.60); padding: 0.5rem 0.75rem; text-align: left; border: 1px solid rgba(255,255,255,0.08); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; }
              .nali-report-content td { padding: 0.5rem 0.75rem; border: 1px solid rgba(255,255,255,0.06); color: rgba(245,240,232,0.65); vertical-align: top; }
              .nali-report-content tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
              .nali-report-content code { background: rgba(255,255,255,0.06); padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.82em; color: #00FFB3; }
              .nali-report-content blockquote { border-left: 2px solid rgba(0,255,179,0.3); padding-left: 1rem; color: rgba(245,240,232,0.50); font-style: italic; }
              .nali-report-content hr { border-color: rgba(255,255,255,0.06); margin: 1.5rem 0; }
              .nali-report-content em { color: rgba(245,240,232,0.55); }
              .nali-infer { background: rgba(251,191,36,0.12); color: rgb(251,191,36); border-radius: 4px; padding: 0.05em 0.3em; font-weight: 600; font-style: normal; }
              .nali-weak { background: rgba(248,113,113,0.12); color: rgb(248,113,113); border-radius: 4px; padding: 0.05em 0.3em; font-weight: 600; font-style: normal; }
              .nali-ok { background: rgba(0,255,179,0.1); color: #00FFB3; border-radius: 4px; padding: 0.05em 0.3em; font-weight: 600; font-style: normal; }
            `}</style>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => {
                  const str = String(children);
                  if (
                    str.includes("[Inferensi AI]") ||
                    str.includes("[Bukti kurang]") ||
                    str.includes("[Terkonfirmasi]")
                  ) {
                    return <p dangerouslySetInnerHTML={{ __html: colourLabel(str) }} />;
                  }
                  return <p>{children}</p>;
                },
                td: ({ children }) => {
                  const str = String(children);
                  if (
                    str.includes("[Inferensi AI]") ||
                    str.includes("[Bukti kurang]") ||
                    str.includes("[Terkonfirmasi]")
                  ) {
                    return <td dangerouslySetInnerHTML={{ __html: colourLabel(str) }} />;
                  }
                  return <td>{children}</td>;
                },
              }}
            >
              {isV2 ? parsed.reportMarkdown : result}
            </ReactMarkdown>
          </div>

          {/* Integrity statement for v2 */}
          {isV2 && parsed.integrityStatement && (
            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold tracking-wider text-white/30 uppercase">
                Pernyataan Integritas NaLI
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-line text-white/40">{parsed.integrityStatement}</p>
            </div>
          )}

          {/* v1 footer */}
          {!isV2 && (
            <div className="mt-8 space-y-1 border-t border-white/[0.06] pt-4 text-center">
              <p className="text-[11px] text-white/30">Draft NaLI. Verifikasi akhir tetap tanggung jawab pengguna.</p>
              <p className="text-[10px] text-white/20">{generatedAt}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Bukti & Klaim */}
      {activeTab === "bukti" && isV2 && (
        <div>
          {parsed.evidenceTable.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">Tabel bukti tidak terdeteksi dalam output ini.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.03]">
                    {["Klaim", "Pilar Bukti", "Sumber", "Status", "Risiko", "Kelemahan"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[10px] font-bold tracking-wider text-white/40 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.evidenceTable.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]",
                        i % 2 === 1 ? "bg-white/[0.01]" : "",
                      )}
                    >
                      <td className="max-w-[180px] px-3 py-2.5 text-white/70">{row.klaim}</td>
                      <td className="px-3 py-2.5 text-white/50">{row.pilarBukti}</td>
                      <td className="px-3 py-2.5 text-white/50">{row.sumber}</td>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: statusColor(row.status) }}>
                        {row.status}
                      </td>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: risikoColor(row.risiko) }}>
                        {row.risiko}
                      </td>
                      <td className="max-w-[160px] px-3 py-2.5 text-white/40">{row.kelemahan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Data Hilang */}
      {activeTab === "data-hilang" && isV2 && (
        <div className="space-y-3">
          {parsed.missingEvidence.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">Tidak ada data hilang yang terdeteksi.</p>
          ) : (
            parsed.missingEvidence.map((item) => {
              const pct = Math.min((item.impactScore / 0.6) * 100, 100);
              return (
                <div key={item.number} className="space-y-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">
                        {item.number}
                      </span>
                      <p className="text-sm font-semibold text-white/80">{item.item}</p>
                    </div>
                    {item.impactScore > 0 && (
                      <span className="shrink-0 font-mono text-[10px] font-semibold text-amber-400">
                        +{item.impactScore.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {item.impactScore > 0 && (
                    <div className="h-1 w-full rounded-full bg-white/[0.05]">
                      <div className="h-full rounded-full bg-amber-400/60" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  {item.impact && (
                    <p className="text-xs leading-relaxed text-white/50">
                      Menambahkan ini akan meningkatkan skor sekitar{" "}
                      <span className="font-semibold text-amber-400">{item.impact}</span>
                    </p>
                  )}
                  {item.cara && (
                    <p className="border-t border-white/[0.05] pt-2 text-[11px] leading-relaxed text-white/35">
                      Cara mendapatkan: {item.cara}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: Pertanyaan NaLI */}
      {activeTab === "pertanyaan" && isV2 && (
        <div className="space-y-4">
          {parsed.followUpQuestions.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">Tidak ada pertanyaan follow-up yang terdeteksi.</p>
          ) : (
            <>
              {parsed.followUpQuestions.map((q) => (
                <div key={q.number} className="space-y-3 rounded-xl border border-[#00FFB3]/20 bg-white/[0.02] p-4">
                  <p className="text-[10px] font-semibold tracking-wider text-[#00FFB3]/50 uppercase">
                    Pertanyaan {q.number} dari NaLI
                  </p>
                  <p className="text-sm leading-relaxed text-white/80">{q.question}</p>
                  <div className="flex gap-2">
                    <textarea
                      value={questionAnswers[q.number] ?? ""}
                      onChange={(e) => setQuestionAnswers((prev) => ({ ...prev, [q.number]: e.target.value }))}
                      placeholder="Jawaban kamu..."
                      rows={2}
                      disabled={submittingQuestion !== null}
                      className="flex-1 resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/80 placeholder-white/25 outline-none focus:border-[#00FFB3]/30 disabled:opacity-50"
                    />
                    <button
                      onClick={() => submitQuestionAnswer(q.number, q.question, questionAnswers[q.number] ?? "")}
                      disabled={!questionAnswers[q.number]?.trim() || submittingQuestion !== null}
                      className="shrink-0 self-end rounded-lg bg-[#00FFB3] px-4 py-2 text-xs font-semibold text-[#050F12] transition hover:bg-[#00FFB3]/90 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {submittingQuestion === q.number ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Kirim Jawaban"
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] px-4 py-3">
                <p className="text-[11px] leading-relaxed text-white/35">
                  Setelah kamu menjawab, NaLI akan menghitung ulang Palantir Score dan memperbarui laporan secara
                  otomatis.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 5: Tindakan Cepat */}
      {activeTab === "tindakan" && (
        <div className="space-y-4">
          <p className="mb-4 text-xs text-white/40">Aksi cepat berdasarkan laporan ini:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Salin teks laporan", action: handleCopy },
              { label: "Unduh PDF", action: handleDownloadPDF },
              ...(isV2 && parsed.followUpQuestions.length > 0
                ? [{ label: "Lihat pertanyaan follow-up", action: () => setActiveTab("pertanyaan") }]
                : []),
              ...(isV2 && parsed.evidenceTable.length > 0
                ? [{ label: "Lihat tabel bukti", action: () => setActiveTab("bukti") }]
                : []),
              ...(isV2 && parsed.missingEvidence.length > 0
                ? [{ label: "Lihat data yang hilang", action: () => setActiveTab("data-hilang") }]
                : []),
              { label: "Buat laporan baru", action: onNewReport },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="inline-flex items-center rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation thread */}
      <div ref={followUpRef}>
        <ConversationThread messages={conversationMessages} isLastMessageStreaming={isFollowUpStreaming} />
      </div>

      {followUpError && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {followUpError}
        </div>
      )}

      <FollowUpComposer
        sessionId={sessionId}
        conversationMessages={conversationMessages}
        onStreamStart={handleStreamStart}
        onStreamToken={handleStreamToken}
        onStreamDone={handleStreamDone}
        onError={handleFollowUpError}
      />
    </div>
  );
}
