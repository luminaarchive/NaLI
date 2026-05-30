"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Clipboard, ClipboardCheck, Download } from "lucide-react";

interface ResultViewProps {
  prompt: string;
  result: string;
  model: string | null;
  sessionId: string | null;
  onNewReport: () => void;
}

function colourLabel(text: string): string {
  return text
    .replace(/\[Inferensi AI\]/g, '<mark class="nali-infer">[Inferensi AI]</mark>')
    .replace(/\[Bukti kurang\]/g, '<mark class="nali-weak">[Bukti kurang]</mark>')
    .replace(/\[Terkonfirmasi\]/g, '<mark class="nali-ok">[Terkonfirmasi]</mark>');
}

export function ResultView({ prompt, result, model, onNewReport }: ResultViewProps) {
  const [copied, setCopied] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  const generatedAt = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col w-full max-w-[760px] mx-auto">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#191919]/95 backdrop-blur-sm border-b border-white/[0.06] px-1 py-3 mb-6">
        <button
          onClick={onNewReport}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Buat laporan baru
        </button>
        <div className="flex items-center gap-2">
          {model && (
            <span className="hidden sm:inline text-[10px] text-white/25 font-mono">
              {model}
            </span>
          )}
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
          <div className="relative group">
            <button
              disabled
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-white/25 cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh PDF
            </button>
            <span className="absolute right-0 top-full mt-1 whitespace-nowrap rounded-lg bg-[#222] px-2 py-1 text-[10px] text-white/50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              Segera hadir
            </span>
          </div>
        </div>
      </div>

      {/* Original prompt block */}
      <div className="mb-6 rounded-xl border-l-2 border-[#00FFB3]/40 bg-white/[0.03] px-4 py-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#00FFB3]/60">
          Bahan kamu
        </p>
        <p
          className={`text-sm italic text-white/50 leading-relaxed ${
            !promptExpanded ? "line-clamp-3" : ""
          }`}
        >
          {prompt}
        </p>
        {prompt.length > 200 && (
          <button
            onClick={() => setPromptExpanded((v) => !v)}
            className="mt-1.5 text-[11px] text-[#00FFB3]/50 hover:text-[#00FFB3] transition-colors"
          >
            {promptExpanded ? "Sembunyikan" : "...lihat semua"}
          </button>
        )}
      </div>

      <hr className="border-white/[0.06] mb-6" />

      {/* Markdown result */}
      <div className="prose prose-invert prose-sm max-w-none nali-report-content">
        <style>{`
          .nali-report-content h1 { font-size: 1.35rem; font-weight: 700; color: #f5f0e8; margin-bottom: 0.75rem; font-family: serif; }
          .nali-report-content h2 { font-size: 1.05rem; font-weight: 700; color: rgba(245,240,232,0.85); margin-top: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; }
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
              if (str.includes("[Inferensi AI]") || str.includes("[Bukti kurang]") || str.includes("[Terkonfirmasi]")) {
                return (
                  <p
                    dangerouslySetInnerHTML={{ __html: colourLabel(str) }}
                  />
                );
              }
              return <p>{children}</p>;
            },
            td: ({ children }) => {
              const str = String(children);
              if (str.includes("[Inferensi AI]") || str.includes("[Bukti kurang]") || str.includes("[Terkonfirmasi]")) {
                return (
                  <td
                    dangerouslySetInnerHTML={{ __html: colourLabel(str) }}
                  />
                );
              }
              return <td>{children}</td>;
            },
          }}
        >
          {result}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-white/[0.06] pt-4 text-center space-y-1">
        <p className="text-[11px] text-white/30">
          Draft NaLI. Verifikasi akhir tetap tanggung jawab pengguna.
        </p>
        <p className="text-[10px] text-white/20">{generatedAt}</p>
      </div>
    </div>
  );
}
