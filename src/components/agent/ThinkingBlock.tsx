"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// The 10 conceptual NaLI investigation modules.
export const THINKING_STEPS = [
  "Scope Classifier",
  "OPL Ontology Extraction",
  "Entity Resolution",
  "Claim Risk Scanner",
  "Linguistic Integrity Filter",
  "Temporal Decay Calculator",
  "Palantir Bayesian Scoring",
  "Missing Evidence Prioritizer",
  "Follow-up Question Generator",
  "Publication Readiness Scorer",
] as const;

export const TOTAL_STEPS = THINKING_STEPS.length;

type StepStatus = "pending" | "running" | "done";

interface ThinkingBlockProps {
  /** Index (0..10) of the currently running module. >= 10 means all complete. */
  activeStep: number;
  streamingText?: string;
  isComplete: boolean;
  modelName?: string;
  /** Elapsed seconds; when omitted the block tracks its own timer while running. */
  elapsedSeconds?: number;
  /** Start collapsed (used for the summary shown above a finished report). */
  defaultCollapsed?: boolean;
  /** Real detected signals per step index (parsed from the live output). */
  signals?: (string | undefined)[];
}

function stepStatus(i: number, activeStep: number, isComplete: boolean): StepStatus {
  if (isComplete || i < activeStep) return "done";
  if (i === activeStep) return "running";
  return "pending";
}

export function ThinkingBlock({
  activeStep,
  streamingText = "",
  isComplete,
  modelName,
  elapsedSeconds,
  defaultCollapsed = false,
  signals,
}: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const startRef = useRef<number>(Date.now());

  // Auto-collapse once generation finishes.
  const wasComplete = useRef(isComplete);
  useEffect(() => {
    if (isComplete && !wasComplete.current) setExpanded(false);
    wasComplete.current = isComplete;
  }, [isComplete]);

  // Live timer while running.
  useEffect(() => {
    if (isComplete) return;
    const id = setInterval(() => setLiveSeconds((Date.now() - startRef.current) / 1000), 200);
    return () => clearInterval(id);
  }, [isComplete]);

  const shownSeconds = isComplete ? (elapsedSeconds ?? liveSeconds) : liveSeconds;
  const completedCount = isComplete ? TOTAL_STEPS : Math.min(Math.max(activeStep, 0), TOTAL_STEPS);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      <style>{`
        @keyframes nali-think-pulse { 0%,100% { opacity:.5; transform:scale(1);} 50% { opacity:1; transform:scale(1.25);} }
        @keyframes nali-step-in { from { opacity:0; transform:translateY(4px);} to { opacity:1; transform:translateY(0);} }
      `}</style>

      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <span
            className="absolute h-3 w-3 rounded-full bg-[#00FFB3]"
            style={isComplete ? undefined : { animation: "nali-think-pulse 1.4s ease-in-out infinite" }}
          />
          <span className="absolute h-5 w-5 rounded-full border border-[#00FFB3]/30" />
        </span>

        <span className="min-w-0 flex-1">
          {isComplete ? (
            <span className="flex flex-wrap items-center gap-x-2 text-[13px] font-medium text-white/70">
              <Check className="h-3.5 w-3.5 text-[#00FFB3]" />
              {TOTAL_STEPS} modul selesai
              {modelName && <span className="text-white/35">· {modelName}</span>}
              <span className="text-white/35">· {shownSeconds.toFixed(1)}s</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[13px] font-medium text-white/80">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00FFB3]" />
              Menganalisis input lapangan...
              <span className="ml-auto pr-1 font-mono text-[11px] text-white/35">{shownSeconds.toFixed(1)}s</span>
            </span>
          )}
        </span>

        <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/30 transition-transform", expanded && "rotate-180")} />
      </button>

      {/* Step list */}
      {expanded && (
        <div className="border-t border-white/[0.05] px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold tracking-wider text-white/30 uppercase">
            Proses Investigasi · {completedCount}/{TOTAL_STEPS}
          </p>
          <ol className="space-y-1.5">
            {THINKING_STEPS.map((label, i) => {
              const status = stepStatus(i, activeStep, isComplete);
              return (
                <li
                  key={label}
                  className="flex items-center gap-2.5 text-[12px]"
                  style={{ animation: `nali-step-in 0.3s ease-out ${i * 0.04}s both` }}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {status === "done" && <Check className="h-3.5 w-3.5 text-[#00897B]" />}
                    {status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00FFB3]" />}
                    {status === "pending" && <span className="h-2.5 w-2.5 rounded-full border border-[#4B5563]" />}
                  </span>
                  <span
                    className={cn(
                      status === "done" && "text-white/55",
                      status === "running" && "font-medium text-[#00FFB3]",
                      status === "pending" && "text-white/30",
                    )}
                  >
                    {label}
                  </span>
                  {signals?.[i] && status !== "pending" && (
                    <span className="truncate font-mono text-[11px] text-[#00897B]">→ {signals[i]}</span>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Live streaming preview */}
          {!isComplete && streamingText.length > 0 && (
            <div className="mt-3 border-l-2 border-[#00FFB3]/30 pl-3">
              <p className="max-h-[44px] overflow-hidden font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap text-white/30">
                {streamingText.slice(-120)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
