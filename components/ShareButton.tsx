"use client";

import { useState, useCallback } from "react";

/* -------------------------------------------------------------------------- */
/*  ShareButton - native share sheet + fallback social buttons.               */
/*                                                                            */
/*  Primary: navigator.share() (mobile native sheet covers IG, TikTok, WA).   */
/*  Fallback: X intent URL, WhatsApp deep link, clipboard copy.               */
/* -------------------------------------------------------------------------- */

interface ShareButtonProps {
  /** Page URL path (e.g. "/articles/krakatau-1883") */
  path: string;
  /** Title for share text */
  title: string;
  /** Short description for share text */
  description?: string;
}

export function ShareButton({ path, title, description }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const getFullUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${path}`;
  }, [path]);

  const handleShare = async () => {
    const url = getFullUrl();
    const shareData = {
      title,
      text: description ?? title,
      url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed - show fallback
      }
    }

    setShowFallback((prev) => !prev);
  };

  const shareToX = () => {
    const url = getFullUrl();
    const text = `${title}${description ? ` - ${description}` : ""}`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareToWhatsApp = () => {
    const url = getFullUrl();
    const text = `${title}\n${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const copyLink = async () => {
    const url = getFullUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: prompt
      window.prompt("Salin tautan:", url);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      {/* Main share trigger */}
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 border border-dashed border-ink/50 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
        aria-label="Bagikan"
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
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Bagikan
      </button>

      {/* Fallback buttons (desktop / unsupported browsers) */}
      {showFallback && (
        <div className="flex items-center gap-1 animate-in fade-in duration-150">
          {/* X (Twitter) */}
          <button
            type="button"
            onClick={shareToX}
            className="inline-flex h-8 w-8 items-center justify-center border border-dashed border-ink/40 text-gray transition-colors hover:border-ink hover:bg-ink-wash hover:text-ink"
            aria-label="Bagikan ke X"
            title="Bagikan ke X"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={shareToWhatsApp}
            className="inline-flex h-8 w-8 items-center justify-center border border-dashed border-ink/40 text-gray transition-colors hover:border-ink hover:bg-ink-wash hover:text-ink"
            aria-label="Bagikan ke WhatsApp"
            title="Bagikan ke WhatsApp"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-8 w-8 items-center justify-center border border-dashed border-ink/40 text-gray transition-colors hover:border-ink hover:bg-ink-wash hover:text-ink"
            aria-label={copied ? "Tersalin" : "Salin tautan"}
            title={copied ? "Tersalin!" : "Salin tautan"}
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
        </div>
      )}
    </div>
  );
}
