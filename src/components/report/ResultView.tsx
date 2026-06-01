"use client";

import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Clipboard,
  ClipboardCheck,
  Download,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { ConversationThread, type ConversationMessage } from "./ConversationThread";
import { FollowUpComposer, type FollowUpComposerHandle } from "./FollowUpComposer";
import { parseNaLIOutput, type ParsedNaLIOutput, type NaLIHeader } from "@/lib/parse-nali-output";
import { calculatePalantirScore, getConfidenceColor, type PalantirScore } from "@/lib/calculate-palantir-score";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ThinkingBlock } from "@/components/agent/ThinkingBlock";
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
}

type TabId = "laporan" | "analisis" | "tindak-lanjut";

function statusColor(status: string): string {
  if (status.includes("Terkonfirmasi")) return "#00FFB3";
  if (status.includes("Inferensi")) return "#F59E0B";
  return "#FB7185";
}

// Fix 4: one line of actionable context based on the overall score
function scoreContext(score: number): string {
  if (score < 20) return "Tambahkan koordinat GPS dan foto untuk meningkatkan skor";
  if (score < 40) return "Skor naik jika ada foto atau sampel biologis";
  if (score < 60) return "Skor cukup untuk laporan awal. Tambahkan data GPS untuk investigasi aktif.";
  if (score < 80) return "Skor kuat. Pertimbangkan pengambilan sampel genetik.";
  return "Skor Forensik Grade. Siap untuk publikasi dengan verifikasi akhir.";
}

// Fix 7: color-code each pillar bar by its value
function pillarColor(v: number): string {
  if (v < 0.3) return "#FB7185"; // rose (includes 0)
  if (v < 0.6) return "#F59E0B"; // amber
  if (v < 0.8) return "#00897B"; // teal
  return "#00FFB3"; // bright teal
}

function pillarLabel(v: number): string {
  if (v <= 0) return "Tidak ada";
  if (v < 0.3) return "Sangat rendah";
  if (v < 0.6) return "Sedang";
  if (v < 0.8) return "Kuat";
  return "Sangat kuat";
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
  thinkingModelLabel,
  thinkingElapsed,
}: ResultViewProps) {
  const [copied, setCopied] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [isPDFGenerating, setIsPDFGenerating] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("laporan");
  const [confidenceDelta, setConfidenceDelta] = useState<{ before: number; after: number } | null>(null);
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const followUpRef = useRef<HTMLDivElement>(null);
  const composerHandleRef = useRef<FollowUpComposerHandle>(null);

  // Live score override: a follow-up answer can produce an updated header/score
  const [liveScore, setLiveScore] = useState<PalantirScore | null>(null);
  const [liveHeader, setLiveHeader] = useState<NaLIHeader | null>(null);

  // Follow-up question chips: which have been routed to the composer / resolved
  const [engagedQ, setEngagedQ] = useState<Set<number>>(new Set());
  const [answeredQ, setAnsweredQ] = useState<Set<number>>(new Set());

  // Mobile: score panel collapsed by default
  const [scoreExpanded, setScoreExpanded] = useState(false);

  const parsed = useMemo(() => parseNaLIOutput(result), [result]);
  const palantirScore = useMemo(() => calculatePalantirScore(parsed), [parsed]);
  const isV2 = parsed.hasStructuredOutput && parsed.header !== null;

  const isMobile = useIsMobile();

  // Live score/header override the original once a follow-up updates them (Fix 8)
  const displayScore = liveScore ?? palantirScore;
  const displayHeader = liveHeader ?? parsed.header;

  const currentScoreRef = useRef(displayScore.overall);
  useEffect(() => {
    currentScoreRef.current = displayScore.overall;
  }, [displayScore.overall]);

  // Fix 9: strip internal labels / leaked delimiters from the visible report body
  const reportBody = useMemo(() => {
    let md = isV2 ? parsed.reportMarkdown : result;
    md = md.replace(/\[LAPORAN UTAMA\]/gi, "");
    md = md.replace(/---NALI-[A-Z-]+---/g, "");
    md = md.replace(/---END-HEADER---/gi, "");
    return md.trim();
  }, [isV2, parsed.reportMarkdown, result]);

  const unansweredQuestions = isV2 ? parsed.followUpQuestions.filter((q) => !answeredQ.has(q.number)) : [];

  // Fix 10: contextual composer placeholder
  const composerPlaceholder = useMemo(() => {
    if (unansweredQuestions.length > 0) return "Jawab pertanyaan NaLI, atau minta perubahan laporan...";
    if (displayScore.overall < 30) return "Tambahkan lokasi, waktu, atau foto untuk meningkatkan akurasi...";
    return "Tambahkan data baru, atau minta format berbeda (KKN, jurnal, dll)...";
  }, [unansweredQuestions.length, displayScore.overall]);

  // Fix 3: once a follow-up stream finishes, resolve any engaged question chips
  const prevStreamingRef = useRef(false);
  useEffect(() => {
    if (prevStreamingRef.current && !isFollowUpStreaming && engagedQ.size > 0) {
      setAnsweredQ((prev) => new Set([...prev, ...engagedQ]));
      setEngagedQ(new Set());
    }
    prevStreamingRef.current = isFollowUpStreaming;
  }, [isFollowUpStreaming, engagedQ]);

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
      const dateStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const docElement = NaLIPDFDocument({
        reportTitle: parsedReport.reportTitle,
        sections: parsedReport.sections,
        prompt: prompt || "",
        modelUsed: model || "openrouter/free",
        generatedAt: dateStr,
        v2Header: isV2 ? parsed.header : undefined,
        v2PalantirScore: isV2 ? palantirScore : undefined,
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

  function buildExportPayload(
    parsedOut: ParsedNaLIOutput,
    score: PalantirScore,
    rawMarkdown: string,
    promptText?: string,
  ): Record<string, unknown> {
    const titleMatch = rawMarkdown.match(/^#\s+(.+)/m);
    const title = titleMatch?.[1]?.trim() || promptText?.slice(0, 80) || "Laporan NaLI";

    const sections: Array<[string, string]> = [];
    const headingRe = /^##\s+(.+)\n([\s\S]*?)(?=^##\s|\n---NALI|$)/gm;
    let m: RegExpExecArray | null;
    while ((m = headingRe.exec(rawMarkdown)) !== null) {
      const heading = m[1].trim().toUpperCase();
      const body = m[2].trim();
      const skip = ["ABSTRAK", "ABSTRACT", "KATA KUNCI", "KEYWORDS"];
      if (body && !skip.some((s) => heading.includes(s))) {
        sections.push([heading, body]);
      }
    }

    const absIdRe = /##\s+Abstrak\s*\n([\s\S]*?)(?=^##\s|---NALI)/im;
    const absEnRe = /##\s+Abstract\s*\n([\s\S]*?)(?=^##\s|---NALI)/im;
    const abstractId = absIdRe.exec(rawMarkdown)?.[1]?.trim() ?? "";
    const abstractEn = absEnRe.exec(rawMarkdown)?.[1]?.trim() ?? "";

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

    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      title,
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

  const handleExport = async (format: "pdf" | "docx") => {
    if (!result || !parsed || exporting) return;
    setExporting(format);

    try {
      const payload = buildExportPayload(parsed, palantirScore, result, prompt || undefined);
      const endpoint = format === "pdf" ? "/api/export-pdf" : "/api/export-docx";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`Export ${format} failed (${res.status}):`, errBody);
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

    // Fix 8: if the follow-up produced an updated header, recompute and surface the delta
    if (fullText) {
      const reParsed = parseNaLIOutput(fullText);
      if (reParsed.header) {
        const newScore = calculatePalantirScore(reParsed);
        const before = currentScoreRef.current;
        if (newScore.overall !== before) {
          setLiveScore(newScore);
          setLiveHeader(reParsed.header);
          showDelta(before, newScore.overall);
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

  // Fix 3: route a follow-up question into the single composer, cursor ready to type
  const handleAnswerQuestion = (qNum: number, question: string) => {
    setEngagedQ((prev) => new Set([...prev, qNum]));
    composerHandleRef.current?.prefill(`Jawaban Q${qNum}: ${question}\n\nJawaban: `);
  };

  const tabs: { id: TabId; label: string }[] = isV2
    ? [
        { id: "laporan", label: "Laporan" },
        { id: "analisis", label: "Analisis" },
        { id: "tindak-lanjut", label: "Tindak Lanjut" },
      ]
    : [{ id: "laporan", label: "Laporan" }];

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col">
      {/* Confidence Delta Toast */}
      {confidenceDelta && confidenceDelta.before !== confidenceDelta.after && (
        <div
          onMouseEnter={() => {
            if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
          }}
          onMouseLeave={() => {
            if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
            deltaTimerRef.current = setTimeout(() => setConfidenceDelta(null), 2000);
          }}
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
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null || isPDFGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exporting === "pdf" ? (
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
          <button
            onClick={() => handleExport("docx")}
            disabled={exporting !== null || isPDFGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exporting === "docx" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Menyiapkan DOCX...
              </>
            ) : (
              <>
                <FileText className="h-3.5 w-3.5" />
                Unduh DOCX
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsed agentic thinking summary (only for a fresh generation) */}
      {thinkingModelLabel && (
        <div className="mb-4">
          <ThinkingBlock
            activeStep={10}
            isComplete
            defaultCollapsed
            modelName={thinkingModelLabel}
            elapsedSeconds={thinkingElapsed}
          />
        </div>
      )}

      {/* Palantir Score Panel — v2 only */}
      {isV2 && (
        <div className="mb-4 rounded-2xl border border-white/[0.08] bg-[#111]/80 p-4 shadow-xl">
          {/* Score + level + (mobile) collapse toggle — always visible */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <div
                className="font-mono text-5xl leading-none font-bold transition-colors"
                style={{ color: getConfidenceColor(displayScore.overall) }}
              >
                {displayScore.overall}%
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                {displayScore.level}
              </div>
            </div>

            {isMobile && (
              <button
                onClick={() => setScoreExpanded((v) => !v)}
                aria-expanded={scoreExpanded}
                className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-white/40 transition hover:text-white/70"
              >
                Lihat detail skor
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", scoreExpanded && "rotate-180")} />
              </button>
            )}
          </div>

          {/* Fix 4: one line of actionable context */}
          <p className="mt-1.5 text-[11px] italic" style={{ color: "rgba(0,137,123,0.75)" }}>
            {scoreContext(displayScore.overall)}
          </p>

          {/* Detail block: hidden on mobile until expanded */}
          {(!isMobile || scoreExpanded) && (
            <>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* 4 pillar gauges (Fix 7: color-coded by value) */}
                <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-2">
                  {[
                    { label: "Genetik x0.60", val: displayScore.genetic },
                    { label: "Visual x0.20", val: displayScore.visual },
                    { label: "Habitat x0.15", val: displayScore.habitat },
                    { label: "Integritas x0.10", val: displayScore.integrity },
                  ].map(({ label, val }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-white/40">{label}</span>
                        <span className="font-mono text-[10px] font-semibold" style={{ color: pillarColor(val) }}>
                          {val.toFixed(2)} · {pillarLabel(val)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(val * 100, 100)}%`, backgroundColor: pillarColor(val) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metadata pills */}
                <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-semibold text-white/60">
                    Li {displayScore.linguisticMultiplier.toFixed(2)}x
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-semibold text-white/60">
                    P(t) {displayScore.temporalDecay.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Header meta row */}
              {displayHeader && (
                <div className="mt-3 flex flex-wrap gap-3 border-t border-white/[0.05] pt-3">
                  {[
                    { label: "Tipe", val: displayHeader.tipeLaporan },
                    { label: "Kualitas", val: displayHeader.kualitasBukti },
                    { label: "Risiko", val: displayHeader.risikoKlaim },
                    { label: "Bahasa", val: displayHeader.bahasaUser },
                  ].map(({ label, val }) =>
                    val ? (
                      <div key={label} className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-semibold tracking-wider text-white/30 uppercase">{label}:</span>
                        <span className="text-white/70">{val}</span>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </>
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

      {/* TAB: Laporan */}
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
              {reportBody}
            </ReactMarkdown>
          </div>

          <div className="mt-8 space-y-1 border-t border-white/[0.06] pt-4 text-center">
            <p className="text-[11px] text-white/30">Draft NaLI. Verifikasi akhir tetap tanggung jawab pengguna.</p>
            <p className="text-[10px] text-white/20">{generatedAt}</p>
          </div>
        </div>
      )}

      {/* TAB: Analisis (Bukti & Klaim + Data Hilang) */}
      {activeTab === "analisis" && isV2 && (
        <div className="space-y-8">
          {/* Evidence table */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">Bukti dan Klaim</h3>
            {parsed.evidenceTable.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">Tabel bukti tidak terdeteksi dalam output ini.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.03]">
                      {["Klaim", "Sumber", "Status", "Keterangan"].map((h) => (
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
                        <td className="max-w-[200px] px-3 py-2.5 text-white/70">{row.klaim}</td>
                        <td className="px-3 py-2.5 text-white/50">{row.sumber}</td>
                        <td className="px-3 py-2.5 font-semibold" style={{ color: statusColor(row.status) }}>
                          {row.status}
                        </td>
                        <td className="max-w-[200px] px-3 py-2.5 text-white/40">{row.keterangan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* Missing evidence */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">
              Data yang masih dibutuhkan
            </h3>
            {parsed.missingEvidence.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">Tidak ada data hilang yang terdeteksi.</p>
            ) : (
              parsed.missingEvidence.map((item) => (
                <div key={item.number} className="space-y-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">
                      {item.number}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white/80">{item.item}</p>
                      {item.reason && <p className="mt-1 text-xs leading-relaxed text-white/50">{item.reason}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: Tindak Lanjut (questions routed to the single composer + actions) */}
      {activeTab === "tindak-lanjut" && isV2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#f5f0e8]">Pertajam laporan ini</h3>
            <p className="mt-1 text-xs text-white/45">Jawab pertanyaan NaLI untuk meningkatkan Palantir Score</p>
          </div>

          {unansweredQuestions.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center">
              <p className="text-sm text-white/50">
                {parsed.followUpQuestions.length === 0
                  ? "Tidak ada pertanyaan lanjutan untuk laporan ini."
                  : "Semua pertanyaan sudah kamu jawab. NaLI sedang memperbarui laporan."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {unansweredQuestions.map((q) => {
                const engaged = engagedQ.has(q.number);
                return (
                  <div key={q.number} className="space-y-3 rounded-xl border border-[#00FFB3]/20 bg-white/[0.02] p-4">
                    <p className="text-[10px] font-semibold tracking-wider text-[#00FFB3]/50 uppercase">
                      Pertanyaan {q.number} dari NaLI
                    </p>
                    <p className="text-[15px] leading-relaxed text-white/85">{q.question}</p>
                    <button
                      onClick={() => handleAnswerQuestion(q.number, q.question)}
                      disabled={engaged}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#00FFB3]/40 px-4 py-1.5 text-xs font-semibold text-[#00FFB3] transition hover:bg-[#00FFB3]/10 disabled:opacity-50"
                    >
                      {engaged ? "Diarahkan ke kotak jawaban di bawah" : "Jawab pertanyaan ini"}
                      {!engaged && <ArrowRight className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action pills */}
          <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-5">
            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              {exporting === "pdf" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Unduh PDF
            </button>
            <button
              onClick={() => handleExport("docx")}
              disabled={exporting !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              {exporting === "docx" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              Unduh DOCX
            </button>
            <button
              onClick={onNewReport}
              className="inline-flex items-center rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            >
              Buat Laporan Baru
            </button>
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
        ref={composerHandleRef}
        sessionId={sessionId}
        conversationMessages={conversationMessages}
        placeholder={composerPlaceholder}
        onStreamStart={handleStreamStart}
        onStreamToken={handleStreamToken}
        onStreamDone={handleStreamDone}
        onError={handleFollowUpError}
      />
    </div>
  );
}
