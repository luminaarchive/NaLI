import type { ReportRequest, ReportResult } from "./reportGenerator";

export interface AnswerVerificationResult {
  answered: boolean;
  answerConfidence: "low" | "medium" | "high";
  missingAnswerParts: string[];
  detectedOutputType: "guidance" | "report_draft" | "journal_candidate" | "insufficient_input";
  userQuestionSummary: string;
  verificationNotes: string[];
}

export function verifyAnswer(
  input: ReportRequest,
  report: ReportResult
): AnswerVerificationResult {
  const mainText = input.mainText || "";
  const topic = input.topic || "";
  const title = input.title || "";
  const combinedInput = `${title} ${topic} ${mainText}`.toLowerCase();
  
  const userQuestionSummary = input.mainText 
    ? (input.mainText.length > 80 ? input.mainText.slice(0, 77) + "..." : input.mainText) 
    : (input.topic ? (input.topic.length > 80 ? input.topic.slice(0, 77) + "..." : input.topic) : input.title || "");

  const missingAnswerParts: string[] = [];
  const verificationNotes: string[] = [];

  let detectedOutputType: "guidance" | "report_draft" | "journal_candidate" | "insufficient_input" = "report_draft";
  const isStartFromZero = input.mode === "start_from_zero";
  const inputLength = mainText.trim().length;
  const isThinInput = inputLength < 25 && !input.location && input.sourceUrls.length === 0 && !input.fileDescription;

  if (isThinInput) {
    detectedOutputType = "insufficient_input";
  } else if (isStartFromZero) {
    detectedOutputType = "guidance";
  } else {
    const isLeafQuery = /daun|morfologi|biologi|tanaman|tumbuhan/i.test(combinedInput);
    const hasJournalTemplate = report.mode === "draft_from_materials" && report.executive_summary?.includes("Journal");
    
    if (hasJournalTemplate || (isLeafQuery && (input.selectedModel === "obsidian" || input.selectedModel === "zephyr"))) {
      detectedOutputType = "journal_candidate";
    } else {
      detectedOutputType = "report_draft";
    }
  }

  let answered = true;
  let confidence: "low" | "medium" | "high" = "high";

  if (isStartFromZero) {
    const guide = report as any;
    const hasOutline = Array.isArray(guide.suggested_outline) && guide.suggested_outline.length > 0;
    const hasQuestions = Array.isArray(guide.observation_questions) && guide.observation_questions.length > 0;
    const hasChecklist = Array.isArray(guide.evidence_checklist) && guide.evidence_checklist.length > 0;

    if (!hasOutline) {
      missingAnswerParts.push("suggested_outline");
    }
    if (!hasQuestions) {
      missingAnswerParts.push("observation_questions");
    }
    if (!hasChecklist) {
      missingAnswerParts.push("evidence_checklist");
    }

    if (missingAnswerParts.length > 0) {
      answered = false;
      confidence = "low";
      verificationNotes.push("Panduan awal kekurangan elemen kunci seperti outline atau checklist.");
    } else {
      confidence = isThinInput ? "low" : "high";
      verificationNotes.push("Panduan awal disusun dengan outline dan pertanyaan observasi yang lengkap.");
    }

    const textOutput = JSON.stringify(report).toLowerCase();
    if (textOutput.includes("findings") && !textOutput.includes("belum menjadi draft laporan")) {
      verificationNotes.push("Peringatan: Mode start_from_zero mendeteksi adanya temuan data yang tidak diizinkan.");
      confidence = "low";
    }
  } else {
    const draft = report as any;
    const hasFindings = Array.isArray(draft.findings) && draft.findings.length > 0;
    const hasEvidenceTable = Array.isArray(draft.evidence_table) && draft.evidence_table.length > 0;
    const hasExecutiveSummary = typeof draft.executive_summary === "string" && draft.executive_summary.trim().length > 0;

    if (!hasFindings || (draft.findings.length === 1 && draft.findings[0].includes("Belum ada temuan"))) {
      if (inputLength > 10) {
        missingAnswerParts.push("findings");
      }
    }
    if (!hasEvidenceTable) {
      missingAnswerParts.push("evidence_table");
    }
    if (!hasExecutiveSummary) {
      missingAnswerParts.push("executive_summary");
    }

    const wantsJournal = /jurnal|journal|paper/i.test(combinedInput);
    if (wantsJournal && isThinInput) {
      verificationNotes.push("Pengguna meminta format jurnal tetapi bahan yang diberikan sangat minim.");
      confidence = "low";
    }

    if (missingAnswerParts.length > 0) {
      answered = false;
      confidence = "low";
      verificationNotes.push(`Draf laporan kekurangan elemen kunci: ${missingAnswerParts.join(", ")}.`);
    } else {
      if (isThinInput) {
        confidence = "low";
        verificationNotes.push("Draf disusun tetapi memiliki kualitas bukti sangat lemah akibat input minim.");
      } else if (inputLength < 100) {
        confidence = "medium";
        verificationNotes.push("Draf disusun berdasarkan bahan terbatas.");
      } else {
        confidence = "high";
        verificationNotes.push("Draf laporan lengkap berhasil disusun berdasarkan bahan yang diberikan.");
      }
    }
  }

  const outputString = JSON.stringify(report).toLowerCase();
  
  if (combinedInput.includes("sungai") && !outputString.includes("sungai") && !outputString.includes("air")) {
    confidence = "low";
    verificationNotes.push("Kesesuaian konten rendah: Topik sungai terdeteksi tetapi tidak dibahas dalam output.");
  }
  if (combinedInput.includes("daun") && !outputString.includes("daun") && !outputString.includes("tanaman") && !outputString.includes("tumbuhan")) {
    confidence = "low";
    verificationNotes.push("Kesesuaian konten rendah: Topik daun terdeteksi tetapi tidak dibahas dalam output.");
  }

  return {
    answered: answered && confidence !== "low",
    answerConfidence: confidence,
    missingAnswerParts,
    detectedOutputType,
    userQuestionSummary,
    verificationNotes,
  };
}
