"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Compass, LockKeyhole, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "warning" | "error" | "success" | "locked";

interface NaliAlertProps {
  variant?: AlertVariant;
  title: string;
  explanation: string;
  nextStep?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  retryAfterSeconds?: number;
}

export function NaliAlert({
  variant = "error",
  title,
  explanation,
  nextStep,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  retryAfterSeconds,
}: NaliAlertProps) {
  // Determine icon based on variant
  const Icon = (() => {
    switch (variant) {
      case "success":
        return CheckCircle2;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertTriangle;
      case "locked":
        return LockKeyhole;
      case "info":
      default:
        return Info;
    }
  })();

  // Determine variant-specific styling classes
  const styles = {
    error: {
      border: "border-red-500/20",
      bg: "bg-red-500/10",
      text: "text-red-200",
      icon: "text-red-400",
    },
    warning: {
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
      text: "text-amber-200",
      icon: "text-amber-400",
    },
    success: {
      border: "border-emerald-400/20",
      bg: "bg-emerald-400/10",
      text: "text-emerald-200",
      icon: "text-emerald-400",
    },
    info: {
      border: "border-indigo-500/20",
      bg: "bg-indigo-500/10",
      text: "text-indigo-200",
      icon: "text-indigo-400",
    },
    locked: {
      border: "border-purple-500/20",
      bg: "bg-purple-500/10",
      text: "text-purple-200",
      icon: "text-purple-400",
    },
  }[variant];

  // Accessible attributes based on severity
  const isAssertive = variant === "error" || variant === "warning";
  const role = isAssertive ? "alert" : "status";
  const ariaLive = isAssertive ? "assertive" : "polite";

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={cn(
        "flex flex-col md:flex-row gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition duration-300 w-full text-left",
        styles.border,
        styles.bg,
        className
      )}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", styles.icon)} aria-hidden="true" />
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className={cn("text-sm font-bold tracking-tight leading-5 flex items-center gap-2 flex-wrap", styles.text)}>
            <span>{title}</span>
            {retryAfterSeconds !== undefined && retryAfterSeconds > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                {retryAfterSeconds}s
              </span>
            )}
          </h4>
          <p className="text-xs leading-relaxed text-white/70 whitespace-normal break-words">
            {explanation}
          </p>
          {nextStep && (
            <p className="text-[11px] leading-relaxed text-white/50 whitespace-normal break-words pt-0.5">
              💡 {nextStep}
            </p>
          )}
        </div>
      </div>

      {((actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction)) && (
        <div className="shrink-0 flex flex-wrap gap-2 items-center md:self-center mt-3 md:mt-0 px-8 md:px-0">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white text-zinc-950 hover:bg-white/90 px-4 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer shadow-md"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 px-4 text-xs font-semibold text-white tracking-wide border border-white/[0.08] transition duration-150 cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
