"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PricingCards } from "./PricingCards";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string | null;
  reportAccessKey?: string | null;
}

export function UpgradeModal({ isOpen, onClose, reportId, reportAccessKey }: UpgradeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Lock background scroll
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = ""; // Restore background scroll
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#07090e]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[1100px] max-h-[90vh] overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#07090e]/95 p-6 shadow-2xl md:p-8 z-10 transition-all duration-300"
      >
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-2xl font-bold text-white">NaLI Monetization</h2>
            <p className="text-xs text-white/40 mt-1">
              Tambahkan kredit energi untuk melanjutkan penyuntingan draf berkualitas tinggi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 text-white/50 hover:bg-white/[0.06] hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pricing Content */}
        <PricingCards
          reportId={reportId}
          reportAccessKey={reportAccessKey}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
}
