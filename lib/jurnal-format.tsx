import React from "react";

/**
 * Strips all HTML tags (like <i>, </i>) from a string.
 * Used for page <title> tags, JSON-LD, OpenGraph, download.txt, etc.
 */
export function stripHtmlTags(str: string): string {
  if (!str) return "";
  return str.replace(/<\/?[^>]+(>|$)/g, "");
}

/**
 * Parses a string containing <i>...</i> tags and returns a formatted React.ReactNode.
 * Used for visible headings and list item titles.
 */
export function renderItalicTitle(title: string): React.ReactNode {
  if (!title) return "";
  const parts = title.split(/(<\/?i>)/i);
  let isItalic = false;
  return (
    <>
      {parts.map((part, idx) => {
        if (part.toLowerCase() === "<i>") {
          isItalic = true;
          return null;
        } else if (part.toLowerCase() === "</i>") {
          isItalic = false;
          return null;
        }
        if (isItalic) {
          return <i key={idx} className="italic">{part}</i>;
        }
        return <span key={idx}>{part}</span>;
      }).filter(Boolean)}
    </>
  );
}

/**
 * Formats raw API license codes to standardized, human-readable strings.
 */
export function formatLicense(license: string | undefined): string {
  if (!license) return "-";
  const lower = license.toLowerCase().trim();
  if (lower === "cc-by" || lower === "cc by") return "CC BY 4.0";
  if (lower === "cc-by-sa" || lower === "cc by-sa") return "CC BY-SA";
  if (lower === "cc-by-nc" || lower === "cc by-nc") return "CC BY-NC";
  if (lower === "cc-by-nd" || lower === "cc by-nd") return "CC BY-ND";
  if (lower === "cc-by-nc-sa" || lower === "cc by-nc-sa") return "CC BY-NC-SA";
  if (lower === "cc-by-nc-nd" || lower === "cc by-nc-nd") return "CC BY-NC-ND";
  if (lower === "cc0") return "CC0 1.0 Universal";
  if (lower === "other-oa" || lower === "open-access" || lower === "open access") return "Open Access";
  return license;
}
