/** Pure formatting helpers, safe to import from client components. */

const WORDS_PER_MINUTE = 200;

/**
 * Single source of truth for reading time (BUG-003). 200 words per minute,
 * rounded up, minimum 1 minute. Markdown/MDX noise (frontmatter already stripped
 * by the caller) is lightly cleaned so headings and links don't skew the count.
 * Used identically by MDX articles and DB-backed posts so the figure is
 * consistent everywhere it appears.
 */
export function calculateReadingTime(content: string): number {
  const text = content
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/[#>*_`~|-]/g, " "); // markdown punctuation
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
