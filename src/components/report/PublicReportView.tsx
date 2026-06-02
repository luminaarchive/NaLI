"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, FileText, Loader2 } from "lucide-react";
import { parseNaLIOutput } from "@/lib/parse-nali-output";
import { calculatePalantirScore, getConfidenceColor } from "@/lib/calculate-palantir-score";
import { buildExportPayloadFromMarkdown } from "@/lib/reports/buildExportPayload";
import { CollapsibleCard } from "@/components/agent/CollapsibleCard";
import { NaLIChatLogo } from "@/components/report/NaLIChatLogo";

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
function cleanBody(raw: string): string {
  return raw
    .replace(/\[LAPORAN UTAMA\]/gi, "")
    .replace(/---NALI-[A-Z-]+---/g, "")
    .replace(/---END-HEADER---/gi, "")
    .replace(/^#\s+.+\n?/, "") // title is rendered separately
    .trim();
}

interface PublicReportViewProps {
  title: string;
  result: string;
}

export function PublicReportView({ title, result }: PublicReportViewProps) {
  const parsed = useMemo(() => parseNaLIOutput(result), [result]);
  const score = useMemo(() => calculatePalantirScore(parsed), [parsed]);
  const isV2 = parsed.hasStructuredOutput && parsed.header !== null;
  const body = useMemo(() => cleanBody(isV2 ? parsed.reportMarkdown : result), [parsed.reportMarkdown, result, isV2]);
  // Prefer the report's own journal heading; fall back to the session title.
  const displayTitle = useMemo(() => result.match(/^#\s+(.+)/m)?.[1]?.trim() || title, [result, title]);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  const handleExport = async (format: "pdf" | "docx") => {
    if (exporting) return;
    setExporting(format);
    try {
      const payload = buildExportPayloadFromMarkdown(result, title);
      const endpoint = format === "pdf" ? "/api/export-pdf" : "/api/export-docx";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;
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
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[780px] px-4 py-10 sm:py-14">
      {/* Brand + read-only marker */}
      <div className="mb-7 flex items-center gap-2.5">
        <NaLIChatLogo size={22} />
        <span className="text-[13px] font-semibold text-white/55">NaLI</span>
        <span className="ml-auto rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
          Hanya-baca
        </span>
      </div>

      {/* Title */}
      <h1 className="mb-6 font-serif text-2xl leading-snug font-bold text-[#f5f0e8] sm:text-3xl">{displayTitle}</h1>

      {/* Journal body */}
      <div className="nali-public prose prose-invert prose-sm max-w-none">
        <style>{`
          .nali-public h1 { font-size: 1.3rem; font-weight: 700; color: #f5f0e8; margin-bottom: 0.6rem; font-family: Georgia, serif; }
          .nali-public h2 { font-weight: 700; color: rgba(245,240,232,0.85); margin-top: 1.4rem; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.72rem; }
          .nali-public h3 { font-size: 0.92rem; font-weight: 600; color: rgba(245,240,232,0.8); }
          .nali-public p { color: rgba(245,240,232,0.78); line-height: 1.75; margin-bottom: 0.75rem; font-size: 0.92rem; }
          .nali-public ul, .nali-public ol { color: rgba(245,240,232,0.72); padding-left: 1.25rem; margin-bottom: 0.75rem; }
          .nali-public li { margin-bottom: 0.3rem; font-size: 0.92rem; }
          .nali-public table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.82rem; }
          .nali-public th { background: rgba(255,255,255,0.04); color: rgba(245,240,232,0.6); padding: 0.5rem 0.7rem; text-align: left; border: 1px solid rgba(255,255,255,0.08); font-size: 0.72rem; text-transform: uppercase; }
          .nali-public td { padding: 0.5rem 0.7rem; border: 1px solid rgba(255,255,255,0.06); color: rgba(245,240,232,0.65); vertical-align: top; }
          .nali-public strong { color: rgba(245,240,232,0.92); }
          .nali-public blockquote { border-left: 2px solid rgba(255,255,255,0.12); padding-left: 1rem; color: rgba(245,240,232,0.5); font-style: italic; }
          .nali-infer { color: rgba(214,178,120,0.95); font-weight: 600; font-style: normal; }
          .nali-weak { color: rgba(212,150,150,0.95); font-weight: 600; font-style: normal; }
          .nali-ok { color: rgba(150,200,182,0.95); font-weight: 600; font-style: normal; }
        `}</style>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => {
              const str = String(children);
              if (str.includes("[Inferensi AI]") || str.includes("[Bukti kurang]") || str.includes("[Terkonfirmasi]")) {
                return <p dangerouslySetInnerHTML={{ __html: colourLabel(str) }} />;
              }
              return <p>{children}</p>;
            },
            td: ({ children }) => {
              const str = String(children);
              if (str.includes("[Inferensi AI]") || str.includes("[Bukti kurang]") || str.includes("[Terkonfirmasi]")) {
                return <td dangerouslySetInnerHTML={{ __html: colourLabel(str) }} />;
              }
              return <td>{children}</td>;
            },
          }}
        >
          {body}
        </ReactMarkdown>
      </div>

      {/* Read-only intelligence cards */}
      {isV2 && (
        <div className="mt-6 space-y-2.5">
          <CollapsibleCard
            title="Palantir Confidence Score"
            dotColor={getConfidenceColor(score.overall)}
            summary={`Skor: ${score.overall}% · ${score.level}`}
            defaultOpen
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
                      {item.reason && <p className="mt-0.5 text-xs leading-relaxed text-white/50">{item.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          )}
        </div>
      )}

      {/* Download row */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => handleExport("pdf")}
          disabled={exporting !== null}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[11.5px] font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
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
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[11.5px] font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
        >
          {exporting === "docx" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
          Unduh DOCX
        </button>
      </div>

      {/* Disclaimer */}
      <p className="mt-8 border-t border-white/[0.06] pt-5 text-[11px] leading-relaxed text-white/35">
        Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit,
        memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir.
      </p>

      {/* Growth footer */}
      <footer className="mt-6 text-center">
        <a
          href="https://naliai.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-white/30 transition hover:text-white/55"
        >
          Dibuat dengan NaLI · naliai.vercel.app
        </a>
      </footer>
    </div>
  );
}
