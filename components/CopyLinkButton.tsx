"use client";

import { useState } from "react";

/**
 * Small icon button that copies a link (origin + path) to the clipboard,
 * with a brief checkmark confirmation. Used in the archive / catalog tables.
 */
export function CopyLinkButton({
  path,
  label = "Salin tautan",
  className = "",
}: {
  path: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(`${window.location.origin}${path}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Tersalin" : label}
      title={copied ? "Tersalin" : label}
      className={`inline-flex h-6 w-6 items-center justify-center border border-dashed border-ink/40 text-gray transition-colors hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {copied ? (
          <path d="M5 12.5 10 17l9-10" />
        ) : (
          <>
            <path d="M9 14a5 5 0 0 1 0-4l2-2a5 5 0 0 1 7 7l-1 1" />
            <path d="M15 10a5 5 0 0 1 0 4l-2 2a5 5 0 0 1-7-7l1-1" />
          </>
        )}
      </svg>
    </button>
  );
}
