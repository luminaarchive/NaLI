import { useEffect, useState } from "react";
import { validateReportInput, validateComposerInput, type ValidationIssue } from "./inputValidation";

/**
 * Hook to validate the CreateReportForm input state on a debounced delay.
 */
export function useDebouncedReportValidation(
  input: {
    mainText?: string;
    mode?: "draft_from_materials" | "start_from_zero";
    reportTemplate?: string;
    location?: string;
    sourceUrls?: string;
    fileDescription?: string;
    integrityConsent?: boolean;
  },
  delay = 500
): ValidationIssue {
  const [issue, setIssue] = useState<ValidationIssue>({
    canSubmit: true,
    severity: "none",
    code: "OK",
    title: "",
    message: "",
    suggestions: [],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = validateReportInput(input);
      setIssue(result);
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    input.mainText,
    input.mode,
    input.reportTemplate,
    input.location,
    input.sourceUrls,
    input.fileDescription,
    input.integrityConsent,
    delay,
  ]);

  return issue;
}

/**
 * Hook to validate composer query messages on a debounced delay.
 */
export function useDebouncedComposerValidation(query: string, delay = 500): ValidationIssue {
  const [issue, setIssue] = useState<ValidationIssue>({
    canSubmit: true,
    severity: "none",
    code: "OK",
    title: "",
    message: "",
    suggestions: [],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = validateComposerInput(query);
      setIssue(result);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return issue;
}
