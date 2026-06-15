"use client";

import { useEffect, useState } from "react";
import { Quote, Copy, Check, Download } from "lucide-react";
import {
  generateCitation,
  citationFile,
  CITATION_FORMATS,
  type Citable,
  type CitationFormat,
} from "@/lib/citation";

/** "Sitasi" button + modal with APA/MLA/Chicago/BibTeX/RIS, copy and download (F5.1). */
export function CitationModal({ item }: { item: Citable }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<CitationFormat>("apa");
  const [copied, setCopied] = useState(false);

  const text = generateCitation(item, format);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setCopied(false), [format]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    const meta = citationFile(format);
    if (!meta) return;
    const blob = new Blob([text], { type: meta.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.slug}.${meta.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-dashed border-ink/60 px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
      >
        <Quote className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
        Sitasi
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-black/40 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Sitasi"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg border border-ink/60 bg-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dashed border-ink/50 px-4 py-3">
              <p className="font-display text-sm font-bold uppercase tracking-[0.06em] text-ink">
                Sitasi tulisan ini
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-gray hover:text-ink-deep"
              >
                Tutup
              </button>
            </div>

            {/* format tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-dashed border-ink/40 px-4 py-3">
              {CITATION_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={`border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] transition-colors ${
                    format === f.id
                      ? "border-ink bg-ink text-paper"
                      : "border-dashed border-ink/50 text-ink hover:bg-ink-wash"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="px-4 py-4">
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words border border-dashed border-ink/40 bg-ink-wash/30 p-3 font-mono text-[0.74rem] leading-relaxed text-ink-charcoal">
                {text}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-2 border border-ink bg-ink px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
                  )}
                  {copied ? "Tersalin" : "Salin"}
                </button>
                {citationFile(format) && (
                  <button
                    type="button"
                    onClick={download}
                    className="inline-flex items-center gap-2 border border-dashed border-ink/60 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
                    Unduh .{citationFile(format)!.ext}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
