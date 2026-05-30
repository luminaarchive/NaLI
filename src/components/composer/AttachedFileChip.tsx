"use client";

import { X, FileText, ImageIcon, File } from "lucide-react";
import type { ExtractedFile } from "@/lib/extract-file-content";

export function AttachedFileChip({
  file,
  onRemove,
  isLoading,
}: {
  file: ExtractedFile;
  onRemove: () => void;
  isLoading: boolean;
}) {
  const Icon =
    file.type === "pdf" ? FileText : file.type === "image" ? ImageIcon : File;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(0, 255, 179, 0.08)",
        border: "1px solid rgba(0, 255, 179, 0.25)",
        borderRadius: "8px",
        padding: "4px 10px",
        fontSize: "12px",
        color: "rgba(255,255,255,0.8)",
        marginBottom: "8px",
      }}
    >
      <Icon size={13} color="#00FFB3" />
      <span
        style={{
          maxWidth: "200px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {file.name}
      </span>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
        {file.sizeKB}KB
      </span>
      {!isLoading && (
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0 2px",
            color: "rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
