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
