// src/lib/sessions/sessionGeneration.ts
// Wraps the existing report generation pipeline for the chat session system.
// Reuses: integrity policy, OpenRouter AI, report prompts, mock fallback.
// Does NOT rewrite any generation logic.

import { requestOpenRouterJson } from "@/lib/ai/openrouter";
import { evaluateIntegrityPolicy } from "@/lib/integrity/policy";
import { guardReportOutput } from "@/lib/integrity/outputGuard";
import {
  buildMockResult,
  buildReportPrompt,
  normalizeProviderResult,
  validateReportRequest,
  type ReportRequestInput,
  type ReportResult,
} from "@/lib/reports/reportGenerator";
import { getCostProtectionStatus } from "@/lib/usage/costProtection";

const SYSTEM_PROMPT = [
  "You are NaLI (NatIve Learning & Intelligence) by NatIve, a professional AI field intelligence and evidence-based learning assistant.",
  "Your task is to analyze the user's input and generate highly structured Indonesian evidence-based report drafts (for draft_from_materials mode) or starting guidance (for start-from-zero mode).",
  "Operate deterministically and transparently. You must first output your 'understanding' of the task and a clear 'plan' of how you are structuring the result.",
  "Strictly use ONLY user-provided materials for facts, figures, locations, and claims in draft mode.",
  "Never invent or fabricate data, citations, DOIs, specific field observations, coordinates, statistics, or publication details. If the user provided URLs, explicitly label them as user-provided and unverified.",
  "Source verification remains inactive in this MVP. Explicitly note that. Every generated draft MUST feature an explicit uncertainty note, list of additional evidence needed, and the required academic integrity disclaimer.",
  "For start-from-zero mode, do NOT generate any report draft or findings. Only provide initial guidance, observation questions, outline suggestions, and the guidance disclaimer.",
  "Assess the evidence strength ('weak' | 'medium' | 'strong') and source coverage ('limited' | 'adequate' | 'strong') objectively based on input detail.",
  "Ensure all sections match the classified task type's expected headings. Avoid repeating generic AI preamble or fluffy conversational filler.",
  "You must output valid JSON only.",
].join(" ");

const CHAT_SYSTEM_PROMPT = [
  "You are NaLI (NatIve Learning & Intelligence) by NatIve, a professional AI field intelligence and evidence-based learning assistant.",
  "You help users refine their Indonesian evidence-based report drafts or start-from-zero guidance iteratively.",
  "Always follow user instructions to revise, refine, summarize, or verify sections of the previous report.",
  "Maintain strict transparency. Do not fabricate citations, DOIs, statistics, coordinates, field observations, or final scientific claims.",
  "Return JSON only.",
].join(" ");

export type SessionGenerationResult =
  | {
      ok: true;
      content: string;
      reportJson: ReportResult;
      modelSlug: string;
      isMock: boolean;
    }
  | {
      ok: false;
      error: string;
      errorCode: string;
    };

/**
 * Infer report mode from a freeform query (same logic as HomeQueryBox).
 * Conservative default: start_from_zero unless clear draft signals detected.
 */
function inferMode(text: string): "draft_from_materials" | "start_from_zero" {
  const lower = text.toLowerCase();
  const draftTriggers = [
    "saya mengamati",
    "saya melihat",
    "hasil observasi",
    "ditemukan",
    "terlihat",
    "catatan",
    "tebing",
    "sungai",
    "air",
    "erosi",
    "lokasi",
  ];

  if (draftTriggers.some((trigger) => lower.includes(trigger))) {
    return "draft_from_materials";
  }

  return "start_from_zero";
}

/**
 * Format a ReportResult into readable markdown text for chat display.
 */
function reportToText(report: ReportResult): string {
  const sections: string[] = [];

  sections.push(`## ${report.title}\n`);

  if (report.mode === "draft_from_materials") {
    if (report.executive_summary) {
      sections.push(`### Ringkasan\n${report.executive_summary}\n`);
    }
    if (report.background) {
      sections.push(`### Latar Belakang\n${report.background}\n`);
    }
    if (report.objective) {
      sections.push(`### Tujuan\n${report.objective}\n`);
    }
    if (report.method_or_materials) {
      sections.push(`### Metode/Bahan\n${report.method_or_materials}\n`);
    }
    if (report.findings && report.findings.length > 0) {
      sections.push(`### Temuan\n${report.findings.map((f) => `- ${f}`).join("\n")}\n`);
    }
    if (report.preliminary_analysis) {
      sections.push(`### Analisis Awal\n${report.preliminary_analysis}\n`);
    }
    if (report.discussion) {
      sections.push(`### Pembahasan\n${report.discussion}\n`);
    }
    if (report.conclusion) {
      sections.push(`### Kesimpulan\n${report.conclusion}\n`);
    }
    if (report.evidence_table && report.evidence_table.length > 0) {
      sections.push(`### Tabel Bukti`);
      for (const row of report.evidence_table) {
        sections.push(`- **${row.id}** (${row.material_type}): ${row.summary}`);
      }
      sections.push("");
    }
    if (report.uncertainty_note) {
      sections.push(`### Catatan Ketidakpastian\n${report.uncertainty_note}\n`);
    }
    if (report.additional_evidence_needed && report.additional_evidence_needed.length > 0) {
      sections.push(`### Bukti Tambahan Diperlukan\n${report.additional_evidence_needed.map((e) => `- ${e}`).join("\n")}\n`);
    }
    if (report.next_user_steps && report.next_user_steps.length > 0) {
      sections.push(`### Langkah Selanjutnya\n${report.next_user_steps.map((s) => `- ${s}`).join("\n")}\n`);
    }
    sections.push(`---\n*${report.draft_label}*\n\n> ${report.disclaimer}`);
  } else {
    // start_from_zero
    if (report.topic_framing) {
      sections.push(`### Kerangka Topik\n${report.topic_framing}\n`);
    }
    if (report.suggested_outline && report.suggested_outline.length > 0) {
      sections.push(`### Outline Disarankan\n${report.suggested_outline.map((s) => `- ${s}`).join("\n")}\n`);
    }
    if (report.observation_questions && report.observation_questions.length > 0) {
      sections.push(`### Pertanyaan Observasi\n${report.observation_questions.map((q) => `- ${q}`).join("\n")}\n`);
    }
    if (report.evidence_checklist && report.evidence_checklist.length > 0) {
      sections.push(`### Checklist Bukti\n${report.evidence_checklist.map((c) => `- ${c}`).join("\n")}\n`);
    }
    if (report.next_steps && report.next_steps.length > 0) {
      sections.push(`### Langkah Selanjutnya\n${report.next_steps.map((s) => `- ${s}`).join("\n")}\n`);
    }
    sections.push(`---\n*${report.label}*\n\n> ${report.disclaimer}`);
  }

  return sections.join("\n");
}

/**
 * Generate first response for a new session.
 * Wraps the existing report generation pipeline.
 */
export async function generateSessionResponse(
  query: string,
): Promise<SessionGenerationResult> {
  // 1. Infer mode from freeform query
  const inferredMode = inferMode(query);

  // 2. Build the input object the existing pipeline expects
  const reportInput: ReportRequestInput = {
    mainText: inferredMode === "draft_from_materials" ? query : "",
    mode: inferredMode,
    reportTemplate: "Laporan Observasi Lingkungan",
    topic: inferredMode === "start_from_zero" ? query : "",
    integrityConsent: true,
  };

  // 3. Integrity check
  const integrity = evaluateIntegrityPolicy(reportInput);
  if (!integrity.allowed) {
    return {
      ok: false,
      error: integrity.userMessage,
      errorCode: integrity.reasonCode,
    };
  }

  // 4. Validate report request
  const validated = validateReportRequest(reportInput);
  if (!validated.success) {
    return {
      ok: false,
      error: validated.error,
      errorCode: "VALIDATION_ERROR",
    };
  }

  // 5. Cost protection
  const costProtection = await getCostProtectionStatus();
  if (costProtection.active) {
    return {
      ok: false,
      error: "Sistem sedang membatasi pemrosesan berat hari ini untuk menjaga stabilitas layanan.",
      errorCode: "COST_PROTECTION",
    };
  }

  // 6. Call OpenRouter
  const startMs = Date.now();
  const openRouterResult = await requestOpenRouterJson({
    prompt: buildReportPrompt(validated.data),
    system: SYSTEM_PROMPT,
  });

  if (openRouterResult) {
    const rawReport =
      openRouterResult.json && typeof openRouterResult.json === "object"
        ? (openRouterResult.json as Record<string, unknown>)
        : {};
    const normalized = normalizeProviderResult(rawReport, validated.data, "NaLI Starter Report");
    const guarded = guardReportOutput(normalized, { sourceVerificationActive: false });

    if (!guarded.allowed) {
      return {
        ok: false,
        error: guarded.userMessage,
        errorCode: guarded.reasonCode,
      };
    }

    return {
      ok: true,
      content: reportToText(guarded.report),
      reportJson: guarded.report,
      modelSlug: openRouterResult.model,
      isMock: false,
    };
  }

  // 7. Fallback: mock result
  const mockReport = buildMockResult(validated.data, "NaLI Starter Report");
  const guarded = guardReportOutput(mockReport, { sourceVerificationActive: false });

  if (!guarded.allowed) {
    return {
      ok: false,
      error: guarded.userMessage,
      errorCode: guarded.reasonCode,
    };
  }

  return {
    ok: true,
    content: reportToText(guarded.report),
    reportJson: guarded.report,
    modelSlug: "mock",
    isMock: true,
  };
}

/**
 * Generate a follow-up response with conversation history.
 */
export async function generateFollowUpResponse(
  query: string,
  history: Array<{ role: string; content: string }>,
): Promise<SessionGenerationResult> {
  // Integrity check on the follow-up query
  const integrity = evaluateIntegrityPolicy({
    mainText: query,
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    integrityConsent: true,
  });

  if (!integrity.allowed) {
    return {
      ok: false,
      error: integrity.userMessage,
      errorCode: integrity.reasonCode,
    };
  }

  // Cost protection
  const costProtection = await getCostProtectionStatus();
  if (costProtection.active) {
    return {
      ok: false,
      error: "Sistem sedang membatasi pemrosesan berat hari ini.",
      errorCode: "COST_PROTECTION",
    };
  }

  // Build context from history
  const conversationContext = history
    .map((m) => `${m.role === "user" ? "Pengguna" : "NaLI"}: ${m.content.slice(0, 500)}`)
    .join("\n");

  const prompt = [
    "Lanjutkan percakapan berdasarkan konteks sebelumnya.",
    conversationContext ? `Percakapan Terakhir:\n${conversationContext}` : "",
    `Instruksi Pengguna Baru: "${query}"`,
    "",
    "Berikan jawaban dalam Bahasa Indonesia yang jelas dan terstruktur. Jika pengguna meminta revisi laporan, berikan versi yang diperbaiki. Jika pengguna bertanya, jawab langsung. Jangan fabrikasi data, sitasi, atau statistik.",
  ]
    .filter(Boolean)
    .join("\n");

  const openRouterResult = await requestOpenRouterJson({
    prompt,
    system: CHAT_SYSTEM_PROMPT,
  });

  if (openRouterResult) {
    const raw = openRouterResult.json;
    let textContent: string;

    if (raw && typeof raw === "object" && "content" in (raw as Record<string, unknown>)) {
      textContent = String((raw as Record<string, unknown>).content);
    } else if (raw && typeof raw === "object") {
      // Try to extract any meaningful text from the JSON
      const obj = raw as Record<string, unknown>;
      const parts: string[] = [];
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === "string" && val.length > 20) {
          parts.push(val);
        } else if (Array.isArray(val)) {
          parts.push(val.filter((v) => typeof v === "string").join("\n- "));
        }
      }
      textContent = parts.join("\n\n") || JSON.stringify(raw, null, 2);
    } else {
      textContent = String(raw);
    }

    return {
      ok: true,
      content: textContent,
      reportJson: null as unknown as ReportResult,
      modelSlug: openRouterResult.model,
      isMock: false,
    };
  }

  // Fallback: helpful mock response
  return {
    ok: true,
    content: [
      `Saya memahami permintaan Anda: "${query.slice(0, 80)}${query.length > 80 ? "..." : ""}".`,
      "",
      "Saat ini NaLI preview engine sedang tidak tersedia. Beberapa hal yang bisa Anda lakukan:",
      "- Coba kirim ulang permintaan Anda",
      "- Pastikan permintaan berisi detail yang cukup",
      "- Periksa kembali bahan atau catatan observasi Anda",
      "",
      "*Catatan: Ini adalah respons fallback karena layanan AI tidak tersedia saat ini.*",
    ].join("\n"),
    reportJson: null as unknown as ReportResult,
    modelSlug: "mock",
    isMock: true,
  };
}
