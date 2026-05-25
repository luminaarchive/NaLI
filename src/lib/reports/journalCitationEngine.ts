export interface ReferenceItem {
  key: string;
  citationKey: string; // e.g. "[Ref: Botany Guide, 2024]"
  rawText: string;
}

export interface CitationEngineResult {
  processedText: string;
  bibliography: string[];
}

/**
 * Custom citation processor that:
 * 1. Matches user-supplied citation keys in prose text.
 * 2. Formats them as numbered citations [1], [2], etc.
 * 3. Builds the formatted bibliography section based on the references in the order they are defined.
 * 4. Gracefully falls back to stating no references were supplied if the reference list is empty.
 */
export function processCitations(text: string, references: ReferenceItem[]): CitationEngineResult {
  if (!references || references.length === 0) {
    return {
      processedText: text,
      bibliography: ["No references were supplied. NaLI did not generate artificial references."]
    };
  }

  let processedText = text;
  const bibliography: string[] = [];

  // Replace each reference citation key in the text with its corresponding number [i]
  references.forEach((ref, index) => {
    const numMarker = `[${index + 1}]`;
    // Escape special characters in citationKey for regex matching
    const escapedKey = ref.citationKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(escapedKey, "g");
    processedText = processedText.replace(regex, numMarker);
    
    // Add formatted entry to bibliography
    bibliography.push(`${numMarker} ${ref.rawText}`);
  });

  return {
    processedText,
    bibliography
  };
}
