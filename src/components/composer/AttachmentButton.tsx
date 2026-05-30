"use client";

import { useRef } from "react";
import { Paperclip } from "lucide-react";

interface AttachmentButtonProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function AttachmentButton({ onFileSelected, disabled }: AttachmentButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.csv,.md,image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 10 * 1024 * 1024) {
            alert("Ukuran file maksimal 10MB");
            return;
          }
          onFileSelected(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        title="Lampirkan file (PDF, gambar, teks)"
        className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-30"
        style={{ color: disabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)" }}
        onMouseEnter={(e) => {
          if (!disabled) (e.currentTarget as HTMLElement).style.color = "#00FFB3";
        }}
        onMouseLeave={(e) => {
          if (!disabled) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
        }}
      >
        <Paperclip className="h-4 w-4" />
      </button>
    </>
  );
}
