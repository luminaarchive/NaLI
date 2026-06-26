"use client";

import { useState, useCallback } from "react";

/* -------------------------------------------------------------------------- */
/*  ShareButton - native share sheet + fallback social buttons.               */
/*                                                                            */
/*  Primary: navigator.share() (mobile native sheet).                         */
/*  Fallback: X, WhatsApp, Instagram/TikTok Previews, clipboard copy.         */
/* -------------------------------------------------------------------------- */

interface ShareButtonProps {
  /** Page URL path (e.g. "/articles/krakatau-1883") */
  path: string;
  /** Title for share text */
  title: string;
  /** Short description for share text */
  description?: string;
  /** Content category */
  category?: string;
  /** Cover image URL */
  image?: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  alam: "#2f9e6e",
  sejarah: "#3b6fb0",
  investigasi: "#c9772f",
  sumber: "#8a8f98",
  seri: "#7a5bb0",
  topik: "#b08a3b",
};

const CATEGORY_LABEL: Record<string, string> = {
  alam: "Alam",
  sejarah: "Sejarah",
  investigasi: "Investigasi",
  sumber: "Arsip Sumber",
  seri: "Seri",
  topik: "Topik",
};

export function ShareButton({
  path,
  title,
  description,
  category = "artikel",
  image,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [activeModal, setActiveModal] = useState<"instagram" | "tiktok" | null>(null);
  const [modalCopied, setModalCopied] = useState(false);

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

  const copyForModalShare = async (targetUrl: string) => {
    const url = getFullUrl();
    const shareText = `${title}\n\n${description ?? ""}\n\nBaca riset lengkapnya di NaLI:\n${url}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 2000);
    } catch {
      // Fallback
    }
    setTimeout(() => {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }, 500);
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

  const accentColor = CATEGORY_COLOR[category] ?? "#8a8f98";
  const categoryLabel = CATEGORY_LABEL[category] ?? category.toUpperCase();

  return (
    <div className="relative inline-flex items-center gap-1">
      {/* Main share trigger */}
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 border border-dashed border-ink/50 bg-paper px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
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
            className="inline-flex h-8 w-8 items-center justify-center border border-dashed border-ink/40 bg-paper text-gray transition-colors hover:border-ink hover:bg-ink-wash hover:text-ink"
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
            className="inline-flex h-8 w-8 items-center justify-center border border-dashed border-ink/40 bg-paper text-gray transition-colors hover:border-ink hover:bg-ink-wash hover:text-ink"
            aria-label="Bagikan ke WhatsApp"
            title="Bagikan ke WhatsApp"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("instagram");
              setModalCopied(false);
            }}
            className="inline-flex h-8 w-8 items-center justify-center border border-dashed border-ink/40 bg-paper text-gray transition-colors hover:border-ink hover:bg-ink-wash hover:text-ink"
            aria-label="Bagikan ke Instagram"
            title="Bagikan ke Instagram"
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
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </button>

          {/* TikTok */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("tiktok");
              setModalCopied(false);
            }}
            className="inline-flex h-8 w-8 items-center justify-center border border-dashed border-ink/40 bg-paper text-gray transition-colors hover:border-ink hover:bg-ink-wash hover:text-ink"
            aria-label="Bagikan ke TikTok"
            title="Bagikan ke TikTok"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="currentColor"
            >
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.03 1.63 4.2 1.13 1.25 2.72 1.94 4.41 2.05v3.91c-1.82-.12-3.58-.87-4.88-2.18-.08-.07-.15-.15-.22-.22v6.52c-.08 2.01-.73 4.01-1.99 5.56-1.54 1.83-3.87 2.87-6.27 2.87-2.61-.08-5.07-1.39-6.49-3.6-1.57-2.45-1.74-5.69-.47-8.29C3.65 8.16 6.45 6.44 9.4 6.55v4.01c-1.38-.1-2.73.57-3.48 1.74-.82 1.22-.88 2.86-.18 4.14.77 1.34 2.37 2.08 3.91 1.81 1.48-.22 2.67-1.42 2.92-2.91.07-.37.07-.75.07-1.12V.02z" />
            </svg>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-8 w-8 items-center justify-center border border-dashed border-ink/40 bg-paper text-gray transition-colors hover:border-ink hover:bg-ink-wash hover:text-ink"
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

      {/* Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md border border-dashed border-ink bg-paper p-6 shadow-xl animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 font-mono text-xs uppercase tracking-wider text-gray hover:text-ink cursor-pointer border border-dashed border-ink/30 px-1.5 py-0.5"
            >
              Tutup
            </button>

            {/* Modal Title */}
            <h3 className="font-display text-base font-bold uppercase tracking-wider text-ink mb-4 pr-16">
              Bagikan ke {activeModal === "instagram" ? "Instagram" : "TikTok"}
            </h3>

            {/* Simulated Story Card */}
            <div
              className="border border-dashed border-white/20 p-4 mb-4 text-[#F5F0EB] flex flex-col relative overflow-hidden"
              style={{ backgroundColor: "#0E3A5C", minHeight: "240px" }}
            >
              {/* Top Accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: accentColor }}
              />

              {/* Category + source info */}
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-[0.62rem] uppercase tracking-[0.12em] border border-dashed px-2 py-0.5"
                  style={{ color: accentColor, borderColor: accentColor }}
                >
                  {categoryLabel}
                </span>
                <span className="font-mono text-[0.62rem] text-[#8a9fad]">
                  NaLI - Jurnal Riset
                </span>
              </div>

              {/* Main Info */}
              <div className="mt-4 flex gap-4 items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm font-bold leading-snug line-clamp-3">
                    {title}
                  </h4>
                  {description && (
                    <p className="mt-2 font-mono text-[0.68rem] leading-relaxed text-[#8a9fad] line-clamp-4">
                      {description}
                    </p>
                  )}
                </div>
                {image && (
                  <div className="w-16 h-16 border border-dashed border-white/30 overflow-hidden flex-shrink-0">
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Bottom branding and link */}
              <div className="mt-auto border-t border-dashed border-white/20 pt-2 flex items-center justify-between font-mono text-[0.62rem] text-[#5a7a8d]">
                <span>nalijournal.vercel.app</span>
                <span className="underline truncate max-w-[150px]" title={getFullUrl()}>
                  {path}
                </span>
              </div>
            </div>

            {/* Hint Box */}
            <div className="bg-ink-wash/40 border border-dashed border-ink/20 p-3 mb-4">
              <p className="font-mono text-[0.66rem] leading-relaxed text-ink-charcoal">
                <span className="font-bold text-ink-deep">Informasi:</span> Judul, sinopsis, dan link artikel disalin otomatis. Anda dapat menempelkannya langsung ke Stories/Feeds Anda.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  copyForModalShare(
                    activeModal === "instagram"
                      ? "https://www.instagram.com/"
                      : "https://www.tiktok.com/"
                  )
                }
                className="flex-1 bg-ink text-paper border border-ink py-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] hover:bg-ink-deep transition-colors text-center"
              >
                {modalCopied ? "Tersalin!" : `Salin & Buka ${activeModal === "instagram" ? "Instagram" : "TikTok"}`}
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="border border-dashed border-ink/50 px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink hover:bg-ink-wash transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
