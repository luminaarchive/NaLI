"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Clipboard, ClipboardCheck, Download, FileText, Loader2 } from "lucide-react";
import { parseNaLIOutput } from "@/lib/parse-nali-output";
import { calculatePalantirScore, getConfidenceColor } from "@/lib/calculate-palantir-score";
import { NaLIChatLogo } from "@/components/report/NaLIChatLogo";
import { ThinkingBlock } from "@/components/agent/ThinkingBlock";
import { CollapsibleCard } from "@/components/agent/CollapsibleCard";
import { cn } from "@/lib/utils";

function statusColor(status: string): string {
  if (status.includes("Terkonfirmasi")) return "#00FFB3";
  if (status.includes("Inferensi")) return "#F59E0B";
  return "#FB7185";
}

function pillarColor(v: number): string {
  if (v < 0.3) return "#FB7185";
  if (v < 0.6) return "#F59E0B";
  if (v < 0.8) return "#00897B";
  return "#00FFB3";
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

function cleanBody(raw: string, reportMarkdown: string, isV2: boolean): string {
  let md = isV2 ? reportMarkdown : raw;
  md = md.replace(/\[LAPORAN UTAMA\]/gi, "");
  md = md.replace(/---NALI-[A-Z-]+---/g, "");
  md = md.replace(/---END-HEADER---/gi, "");
  return md.trim();
}

function formatTimestamp(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

interface NaLIMessageProps {
  content: string;
  timestamp?: string;
  isPrimary?: boolean;
  isLatest?: boolean;
  isStreaming?: boolean;
  thinkingModelLabel?: string;
  thinkingElapsed?: number;
  scoreDelta?: { before: number; after: number } | null;
  exporting: "pdf" | "docx" | null;
  onCopy: (content: string) => void;
  onExport: (format: "pdf" | "docx", content: string) => void;
  onAnswerQuestion?: (num: number, question: string) => void;
}

export function NaLIMessage({
  content,
  timestamp,
  isPrimary = false,
  isLatest = false,
  isStreaming = false,
  thinkingModelLabel,
  thinkingElapsed,
  scoreDelta,
  exporting,
  onCopy,
  onExport,
  onAnswerQuestion,
}: NaLIMessageProps) {
  const [copied, setCopied] = useState(false);
  const parsed = useMemo(() => parseNaLIOutput(content), [content]);
  const score = useMemo(() => calculatePalantirScore(parsed), [parsed]);
  const isV2 = parsed.hasStructuredOutput && parsed.header !== null;
  const body = useMemo(() => cleanBody(content, parsed.reportMarkdown, isV2), [content, parsed.reportMarkdown, isV2]);

  const handleCopy = () => {
    onCopy(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col">
      {/* Score delta pill */}
      {scoreDelta && scoreDelta.before !== scoreDelta.after && (
        <div className="mb-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              scoreDelta.after > scoreDelta.before
                ? "border-[#00FFB3]/30 bg-[#00FFB3]/10 text-[#00FFB3]"
                : "border-rose-400/30 bg-rose-400/10 text-rose-400",
            )}
          >
            Skor {scoreDelta.after > scoreDelta.before ? "naik" : "turun"} {scoreDelta.before}% → {scoreDelta.after}%
          </span>
        </div>
      )}

      {/* NaLI label */}
      <div className="mb-2 flex items-center gap-2">
        <NaLIChatLogo size={20} />
        <span className="text-[11px] font-semibold text-white/40">NaLI</span>
        {timestamp && <span className="text-[10px] text-white/20">· {formatTimestamp(timestamp)}</span>}
      </div>

      {/* Content — subtle left line */}
      <div className="space-y-4 border-l border-white/[0.08] pl-4">
        {/* Thinking summary (primary report only) */}
        {isPrimary && thinkingModelLabel && (
          <ThinkingBlock
            activeStep={10}
            isComplete
            defaultCollapsed
            modelName={thinkingModelLabel}
            elapsedSeconds={thinkingElapsed}
          />
        )}

        {isStreaming && body.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-[13px] text-white/50">
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "0ms" }} />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40"
                style={{ animationDelay: "300ms" }}
              />
            </span>
            NaLI menganalisis...
          </div>
        ) : (
          <>
            {/* Report body */}
            <div className="nali-msg-content prose prose-invert prose-sm max-w-none">
              <style>{`
                .nali-msg-content h1 { font-size: 1.3rem; font-weight: 700; color: #f5f0e8; margin-bottom: 0.6rem; font-family: Georgia, serif; }
                .nali-msg-content h2 { font-weight: 700; color: rgba(245,240,232,0.85); margin-top: 1.3rem; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; }
                .nali-msg-content h3 { font-size: 0.9rem; font-weight: 600; color: rgba(245,240,232,0.8); }
                .nali-msg-content p { color: rgba(245,240,232,0.78); line-height: 1.7; margin-bottom: 0.7rem; font-size: 0.9rem; }
                .nali-msg-content ul, .nali-msg-content ol { color: rgba(245,240,232,0.72); padding-left: 1.25rem; margin-bottom: 0.7rem; }
                .nali-msg-content li { margin-bottom: 0.25rem; font-size: 0.9rem; }
                .nali-msg-content table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.8rem; }
                .nali-msg-content th { background: rgba(255,255,255,0.04); color: rgba(245,240,232,0.6); padding: 0.5rem 0.7rem; text-align: left; border: 1px solid rgba(255,255,255,0.08); font-size: 0.72rem; text-transform: uppercase; }
                .nali-msg-content td { padding: 0.5rem 0.7rem; border: 1px solid rgba(255,255,255,0.06); color: rgba(245,240,232,0.65); vertical-align: top; }
                .nali-msg-content code { background: rgba(255,255,255,0.06); padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.82em; color: rgba(245,240,232,0.85); }
                .nali-msg-content blockquote { border-left: 2px solid rgba(255,255,255,0.12); padding-left: 1rem; color: rgba(245,240,232,0.5); font-style: italic; }
                .nali-msg-content em { color: rgba(245,240,232,0.55); }
                .nali-infer { color: rgba(214,178,120,0.95); font-weight: 600; font-style: normal; }
                .nali-weak { color: rgba(212,150,150,0.95); font-weight: 600; font-style: normal; }
                .nali-ok { color: rgba(150,200,182,0.95); font-weight: 600; font-style: normal; }
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
                {body}
              </ReactMarkdown>
              {isStreaming && (
                <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-[#00FFB3]/60 align-middle" />
              )}
            </div>

            {/* Inline cards — only once streaming is done and structured output is present */}
            {!isStreaming && isV2 && (
              <div className="space-y-2.5">
                {/* Score card */}
                <CollapsibleCard
                  title="Palantir Confidence Score"
                  dotColor={getConfidenceColor(score.overall)}
                  summary={`Skor: ${score.overall}% · ${score.level}`}
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      { label: "Genetik ×0.60", val: score.genetic },
                      { label: "Visual ×0.20", val: score.visual },
                      { label: "Habitat ×0.15", val: score.habitat },
                      { label: "Integritas ×0.10", val: score.integrity },
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
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(val * 100, 100)}%`, backgroundColor: pillarColor(val) }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.05] pt-3">
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-semibold text-white/60">
                      Li {score.linguisticMultiplier.toFixed(2)}×
                    </span>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-semibold text-white/60">
                      P(t) {score.temporalDecay.toFixed(2)}
                    </span>
                  </div>
                </CollapsibleCard>

                {/* Evidence card */}
                {parsed.evidenceTable.length > 0 && (
                  <CollapsibleCard title="Bukti & Klaim" summary={`${parsed.evidenceTable.length} klaim`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.07]">
                            {["Klaim", "Sumber", "Status", "Keterangan"].map((h) => (
                              <th
                                key={h}
                                className="px-2 py-2 text-left text-[10px] font-bold tracking-wider text-white/40 uppercase"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.evidenceTable.map((row, i) => (
                            <tr key={i} className="border-b border-white/[0.05]">
                              <td className="max-w-[180px] px-2 py-2 text-white/70">{row.klaim}</td>
                              <td className="px-2 py-2 text-white/50">{row.sumber}</td>
                              <td className="px-2 py-2 font-semibold" style={{ color: statusColor(row.status) }}>
                                {row.status}
                              </td>
                              <td className="max-w-[180px] px-2 py-2 text-white/40">{row.keterangan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CollapsibleCard>
                )}

                {/* Missing evidence card */}
                {parsed.missingEvidence.length > 0 && (
                  <CollapsibleCard title="Data yang dibutuhkan" summary={`${parsed.missingEvidence.length} item`}>
                    <div className="space-y-2">
                      {parsed.missingEvidence.map((item) => (
                        <div key={item.number} className="flex items-start gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">
                            {item.number}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white/80">{item.item}</p>
                            {item.reason && (
                              <p className="mt-0.5 text-xs leading-relaxed text-white/50">{item.reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleCard>
                )}
              </div>
            )}

            {/* Export row */}
            {!isStreaming && (
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {copied ? (
                    <>
                      <ClipboardCheck className="h-3.5 w-3.5 text-[#00FFB3]" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-3.5 w-3.5" /> Salin
                    </>
                  )}
                </button>
                <button
                  onClick={() => onExport("pdf", content)}
                  disabled={exporting !== null}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                >
                  {exporting === "pdf" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  PDF
                </button>
                <button
                  onClick={() => onExport("docx", content)}
                  disabled={exporting !== null}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                >
                  {exporting === "docx" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  DOCX
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Follow-up questions as a distinct NaLI bubble (latest report only).
          Each question is tappable — it drops the answer scaffold into the composer. */}
      {!isStreaming && isLatest && isV2 && parsed.followUpQuestions.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center gap-2">
            <NaLIChatLogo size={18} />
            <span className="text-[11px] font-semibold text-white/45">NaLI bertanya</span>
          </div>
          <p className="mb-3 text-[13.5px] leading-relaxed text-white/80">
            Untuk mempertajam laporan ini, aku perlu tahu beberapa hal. Ketuk pertanyaan untuk menjawabnya:
          </p>
          <div className="space-y-2">
            {parsed.followUpQuestions.map((q) => (
              <button
                key={q.number}
                type="button"
                onClick={() => onAnswerQuestion?.(q.number, q.question)}
                className="group flex w-full items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 text-left transition hover:border-white/[0.16] hover:bg-white/[0.04]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/55">
                  {q.number}
                </span>
                <span className="flex-1 text-[13.5px] leading-relaxed text-white/80">{q.question}</span>
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/60" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-white/35 italic">
            Atau tulis jawabanmu langsung di kotak bawah. Lewati jika datanya belum ada.
          </p>
        </div>
      )}
    </div>
  );
}
