// src/components/report/MarkdownRenderer.tsx
// Lightweight markdown-to-JSX renderer for chat messages.
// No external dependency. Handles headings, bold, italic, lists, code, paragraphs.
// Styled for dark theme (#f5f0e8 text on dark bg).

"use client";

import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

type RenderedBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "blockquote"; text: string }
  | { type: "hr" }
  | { type: "paragraph"; text: string };

function parseBlocks(markdown: string): RenderedBlock[] {
  const lines = markdown.split("\n");
  const blocks: RenderedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // Code blocks
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      i++; // skip closing ```
      continue;
    }

    // Blockquotes
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join(" ") });
      continue;
    }

    // Unordered lists
    if (/^[-*]\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // Ordered lists
    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    // Paragraph (collect consecutive non-empty lines)
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].match(/^#{1,4}\s/) && !lines[i].startsWith("```") && !lines[i].startsWith(">") && !/^[-*]\s/.test(lines[i].trim()) && !/^\d+\.\s/.test(lines[i].trim()) && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
    }
  }

  return blocks;
}

/** Render inline markdown: bold, italic, code, links */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split on markdown patterns and reconstruct
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // Bold
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={i} className="font-semibold text-[#f5f0e8]">
          {part.slice(2, -2)}
        </strong>,
      );
      continue;
    }

    // Italic
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      nodes.push(
        <em key={i} className="italic text-[#a1b3a8]">
          {part.slice(1, -1)}
        </em>,
      );
      continue;
    }

    // Inline code
    if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(
        <code
          key={i}
          className="rounded bg-[#14261c] px-1.5 py-0.5 font-mono text-xs text-[#00FFB3]"
        >
          {part.slice(1, -1)}
        </code>,
      );
      continue;
    }

    // Links
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      nodes.push(
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00FFB3] underline underline-offset-2 hover:text-[#00e6a0]"
        >
          {linkMatch[1]}
        </a>,
      );
      continue;
    }

    // Plain text
    nodes.push(part);
  }

  return nodes;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div className={`markdown-rendered space-y-3 ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading": {
            const Tag = `h${Math.min(block.level, 4)}` as "h1" | "h2" | "h3" | "h4";
            const sizes: Record<string, string> = {
              h1: "text-lg font-bold",
              h2: "text-base font-semibold",
              h3: "text-sm font-semibold",
              h4: "text-sm font-medium",
            };
            return (
              <Tag
                key={idx}
                className={`${sizes[Tag]} text-[#f5f0e8] mt-4 mb-1 first:mt-0`}
              >
                {renderInline(block.text)}
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={idx} className="text-sm leading-relaxed text-[#f5f0e8]/90">
                {renderInline(block.text)}
              </p>
            );
          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={idx}
                className={`text-sm leading-relaxed text-[#f5f0e8]/90 space-y-1 pl-5 ${
                  block.ordered ? "list-decimal" : "list-disc"
                }`}
              >
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ListTag>
            );
          }
          case "code":
            return (
              <pre
                key={idx}
                className="overflow-x-auto rounded-lg bg-[#0b1a12] border border-[#14261c] p-3 text-xs font-mono text-[#a1b3a8] leading-relaxed"
              >
                <code>{block.code}</code>
              </pre>
            );
          case "blockquote":
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-[#1e3525] pl-3 text-xs leading-relaxed text-[#a1b3a8]/80 italic"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case "hr":
            return (
              <hr key={idx} className="border-t border-[#14261c] my-3" />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
