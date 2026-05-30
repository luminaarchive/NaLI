"use client";

import { CheckCircle2 } from "lucide-react";

const WORK_STEPS = [
  "Membaca konteks input",
  "Mengidentifikasi jenis laporan",
  "Memetakan klaim dan bukti",
  "Menandai bukti yang kurang",
  "Menyusun struktur laporan",
  "Membuat draft awal",
  "Mengecek batas klaim",
  "Menyiapkan hasil",
] as const;

interface LoadingViewProps {
  prompt: string;
  model?: string | null;
  /** 0-7: which step is currently active based on real stream content */
  activeStep?: number;
  /** Accumulated streaming text so far */
  streamingText?: string;
}

export function LoadingView({ prompt, model, activeStep = 0, streamingText = "" }: LoadingViewProps) {
  const preview = streamingText.length > 0
    ? streamingText.slice(-120).replace(/\n+/g, " ").trim()
    : null;

  return (
    <div className="flex flex-col items-center justify-center pt-12 sm:pt-20 max-w-[520px] mx-auto w-full text-center">
      {/* Pulse animation */}
      <div className="relative mb-8">
        <div className="h-14 w-14 rounded-full bg-[#00FFB3]/10 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-[#00FFB3]/20 flex items-center justify-center animate-pulse">
            <span className="h-4 w-4 rounded-full bg-[#00FFB3]" />
          </div>
        </div>
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
      </div>

      <h2 className="font-serif text-xl font-semibold text-[#f5f0e8] mb-2">
        NaLI sedang menyusun laporan...
      </h2>
      <p className="text-sm text-white/45 mb-8">
        Menganalisis bahan dan memetakan klaim...
      </p>

      {/* Prompt preview */}
      {prompt && (
        <div className="w-full mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left text-xs text-white/40 italic line-clamp-2">
          &ldquo;{prompt}&rdquo;
        </div>
      )}

      {/* Real-time step list */}
      <div className="w-full space-y-1.5 text-left">
        {WORK_STEPS.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isActive = idx === activeStep;
          const isPending = idx > activeStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 ${
                isActive
                  ? "bg-[#00FFB3]/8 text-[#00FFB3]"
                  : isCompleted
                  ? "text-white/70"
                  : "text-white/25"
              }`}
            >
              {/* Icon */}
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00FFB3]" />
              ) : isActive ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00FFB3]/30 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-[#00FFB3]" />
                </span>
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.10]">
                  <span className="text-[9px] font-bold text-white/20">{idx + 1}</span>
                </span>
              )}

              <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live streaming text preview */}
      {preview && (
        <div className="mt-6 w-full rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 text-left font-mono text-[10px] text-white/35 leading-relaxed line-clamp-2 overflow-hidden">
          {preview}
          <span className="inline-block w-1.5 h-3 bg-[#00FFB3]/50 ml-0.5 animate-pulse align-middle" />
        </div>
      )}

      {model && (
        <p className="mt-4 text-[10px] italic text-white/25">
          Model: {model}
        </p>
      )}
    </div>
  );
}
