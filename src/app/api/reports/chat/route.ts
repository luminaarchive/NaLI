import { NextRequest, NextResponse } from "next/server";
import { getPersistedReport, updatePersistedReport } from "@/lib/reports/persistence";
import { evaluateIntegrityPolicy } from "@/lib/integrity/policy";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";
import { requestOpenRouterJson } from "@/lib/ai/openrouter";
import { guardReportOutput } from "@/lib/integrity/outputGuard";
import { containsForbiddenWording, normalizeProviderResult, buildMockResult, type ReportResult } from "@/lib/reports/reportGenerator";
import { classifyChatAction } from "@/lib/reports/taskClassifier";

const systemPrompt = [
  "You are NaLI (NatIve Learning & Intelligence) by NatIve, a professional AI field intelligence and evidence-based learning assistant.",
  "You help users refine their Indonesian evidence-based report drafts or start-from-zero guidance iteratively.",
  "Always follow user instructions to revise, refine, summarize, or verify sections of the previous report.",
  "Maintain strict transparency. Do not fabricate citations, DOIs, statistics, coordinates, field observations, or final scientific claims.",
  "Always supply all agentic fields in your JSON output to detail your updated understanding, execution plan, estimated evidence strength, source coverage, missing evidence, warnings, and dynamic suggested actions for follow-up.",
  "Return JSON only.",
].join(" ");

type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  type:
    | "plain"
    | "plan"
    | "progress"
    | "report_preview"
    | "evidence_status"
    | "quality_status"
    | "error"
    | "action";
  content: string;
  metadata?: {
    run_id?: string;
    step_id?: string;
    evidence_strength?: "weak" | "medium" | "strong";
    source_coverage?: "limited" | "adequate" | "strong";
    academic_integrity?: "safe" | "warning" | "blocked";
    credit_cost?: number;
    mode_label?: "fast" | "advanced_report" | "deep_intelligence";
    template_id?: string;
    warning_codes?: string[];
    new_report?: any;
  };
  created_at: string;
};

type AgentThread = {
  version: number;
  title: string;
  summary?: string;
  messages: AgentMessage[];
  last_run_id?: string;
  last_message_id?: string;
  active_run_id?: string;
  active_run_status?: "queued" | "running" | "completed" | "failed" | "blocked";
  updated_at: string;
};

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { reportId, reportAccessKey, newQuery, action, newReport } = body;

    // 1. Validate parameters
    if (!reportId || !reportAccessKey) {
      return NextResponse.json({ error: "reportId dan reportAccessKey diperlukan." }, { status: 400 });
    }

    // 2. Fetch persisted report from trusted database
    const persisted = await getPersistedReport({
      reportAccessToken: reportAccessKey,
      reportId: reportId,
    });

    if (!persisted.found) {
      return NextResponse.json({ error: "Laporan tidak ditemukan atau akses tidak sah." }, { status: 404 });
    }

    const currentReport = persisted.report;
    const reportInput = persisted.input;
    let metadata = persisted.processing_metadata || {};

    // 3. Handle explicit actions (e.g., replace preview content)
    if (action === "replace_preview") {
      if (!newReport) {
        return NextResponse.json({ error: "newReport diperlukan untuk mengganti preview." }, { status: 400 });
      }

      // Update the main output report in database without altering conversation messages
      const updateResult = await updatePersistedReport({
        reportId,
        reportAccessKey,
        report: newReport,
        agentThread: metadata.agent_thread,
      });

      if (!updateResult.updated) {
        return NextResponse.json({ error: "Gagal mengganti preview di server." }, { status: 500 });
      }

      return NextResponse.json({ success: true, report: newReport });
    }

    // Process chat follow-up query
    if (!newQuery || typeof newQuery !== "string" || !newQuery.trim()) {
      return NextResponse.json({ error: "Kueri baru (newQuery) tidak boleh kosong." }, { status: 400 });
    }

    // Enforce length limit
    if (newQuery.length > 5000) {
      return NextResponse.json({ error: "Input terlalu panjang. Tulis pesan yang lebih pendek." }, { status: 400 });
    }

    // 4. Rate Limiting Check
    const rateLimit = await checkRateLimit({
      actionType: "generate_report",
      guestSessionId: body.guestSessionId || reportInput?.guestSessionId,
      request: req,
    });
    const headers = rateLimitHeaders(rateLimit);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: RATE_LIMITED_MESSAGE,
          code: "RATE_LIMIT",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { headers, status: 429 }
      );
    }

    // 5. Evaluate Integrity Policy on the follow-up query
    const integrityDecision = evaluateIntegrityPolicy({
      mainText: newQuery,
      mode: currentReport.mode,
      reportTemplate: currentReport.report_type,
      integrityConsent: true,
    });

    if (!integrityDecision.allowed) {
      return NextResponse.json(
        {
          code: integrityDecision.reasonCode,
          error: integrityDecision.userMessage,
        },
        { headers, status: 400 }
      );
    }

    // Initialize agent_thread if missing
    let thread: AgentThread = metadata.agent_thread || {
      version: 1,
      title: currentReport.title || "Percakapan Laporan",
      messages: [],
      updated_at: new Date().toISOString(),
    };

    // 6. Run Lifecycle / Anti Double-Submit
    const nowMs = Date.now();
    const lastUpdateMs = new Date(thread.updated_at).getTime();
    if (thread.active_run_status === "running" && nowMs - lastUpdateMs < 30000) {
      return NextResponse.json(
        { error: "Proses sebelumnya sedang berjalan. Mohon tunggu." },
        { headers, status: 409 }
      );
    }

    const activeRunId = `run-${nowMs}-${Math.random().toString(36).slice(2, 7)}`;
    thread.active_run_status = "running";
    thread.active_run_id = activeRunId;
    thread.updated_at = new Date().toISOString();

    // Persist running status to DB immediately
    await updatePersistedReport({
      reportId,
      reportAccessKey,
      report: currentReport,
      agentThread: thread,
    });

    let runSaved = false;

    try {
      // 7. Append new user message server-side
      const userMessage: AgentMessage = {
        id: generateId(),
        role: "user",
        type: "plain",
        content: newQuery,
        created_at: new Date().toISOString(),
      };
      thread.messages.push(userMessage);

      // Enforce history limits (max 50 messages)
      if (thread.messages.length > 50) {
        const olderMessages = thread.messages.slice(0, thread.messages.length - 20);
        const olderUserQueries = olderMessages
          .filter((msg) => msg.role === "user")
          .map((msg) => `"${msg.content.slice(0, 40)}${msg.content.length > 40 ? "..." : ""}"`)
          .slice(-5);
        
        // Create concise deterministic fallback summary
        const summaryText = `Riwayat sebelumnya mencakup penyesuaian draf laporan dengan fokus pada: ${
          olderUserQueries.length > 0 ? olderUserQueries.join(", ") : "penyuntingan teks"
        }.`;
        thread.summary = summaryText;
        thread.messages = thread.messages.slice(thread.messages.length - 20);
      }

      // 8. Build model prompt from trusted server context only
      const recentHistory = thread.messages
        .slice(0, -1) // Exclude current user message since it goes in query
        .map((msg) => `${msg.role === "user" ? "Pengguna" : "NaLI"}: ${msg.content}`)
        .join("\n");

      const chatAction = classifyChatAction(newQuery);

      const promptText = [
        "Perbarui laporan draft atau panduan berikut berdasarkan kueri pengguna.",
        `Laporan Awal: ${JSON.stringify(currentReport)}`,
        thread.summary ? `Ringkasan Riwayat: ${thread.summary}` : "",
        recentHistory ? `Percakapan Terakhir:\n${recentHistory}` : "",
        `Instruksi Pengguna Baru: "${newQuery}"`,
        `Kategori Tindakan Terdeteksi: ${chatAction}`,
        "",
        "Kembalikan data dalam format JSON saja. Harus berupa drop-in pengganti untuk skema output laporan (Laporan Observasi Lingkungan / Laporan Praktikum dll), lengkap dengan field pendukung AI Agentic Fields.",
        "Harus menyertakan field agentic di tingkat atas JSON:",
        '- "understanding": string — ringkasan pemahaman Anda terhadap instruksi baru pengguna.',
        '- "plan": string[] — langkah-langkah singkat yang Anda lakukan untuk merevisi laporan.',
        '- "evidence_strength": "weak" | "medium" | "strong" — kekuatan bukti terbaru.',
        '- "source_coverage": "limited" | "adequate" | "strong" — cakupan sumber terbaru.',
        '- "missing_evidence": string[] — bukti apa yang masih kurang.',
        '- "evidence_warnings": string[] — peringatan/catatan khusus tentang klaim laporan.',
        '- "suggested_actions": Array<{ label: string, prompt: string }> — 3-5 tindakan lanjutan yang disarankan kepada pengguna.',
        "",
        currentReport.mode === "start_from_zero"
          ? "Skema StartFromZeroGuide: { mode, title, report_type, created_at, status, model_used, label, topic_framing, suggested_outline: string[], observation_questions: string[], field_note_template: string[], evidence_checklist: string[], source_search_checklist: string[], safety_or_ethics_note, integrity_note, disclaimer, next_steps: string[], understanding, plan, evidence_strength, source_coverage, missing_evidence, evidence_warnings, suggested_actions }"
          : "Skema DraftReport: { mode, title, report_type, created_at, status, model_used, draft_label, executive_summary, background, objective, method_or_materials, findings: string[], preliminary_analysis, discussion, conclusion, evidence_table: { id, material_type, summary, user_provided, verification_status }[], source_notes: string[], source_verification_status, uncertainty_note, additional_evidence_needed: string[], user_review_checklist: string[], disclaimer, next_user_steps: string[], understanding, plan, evidence_strength, source_coverage, missing_evidence, evidence_warnings, suggested_actions }",
      ].filter(Boolean).join("\n");

      // 9. Call OpenRouter
      const isProduction = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_DEMO_MODE !== "true";
      let openRouterResult = await requestOpenRouterJson({
        prompt: promptText,
        system: systemPrompt,
      });

      if (!openRouterResult) {
        if (isProduction) {
          // Safe fail in production: do not fake output
          const errorMessage: AgentMessage = {
            id: generateId(),
            role: "system",
            type: "error",
            content: "NaLI could not complete this generation because the AI service is temporarily unavailable. Your report is saved. Please try again.",
            created_at: new Date().toISOString(),
          };
          thread.messages.push(errorMessage);
          thread.active_run_status = "failed";
          thread.updated_at = new Date().toISOString();

          await updatePersistedReport({
            reportId,
            reportAccessKey,
            report: currentReport,
            agentThread: thread,
          });
          runSaved = true;

          return NextResponse.json(
            { error: "NaLI could not complete this generation because the AI service is temporarily unavailable. Your report is saved. Please try again." },
            { headers, status: 502 }
          );
        } else {
          // Developer/Demo mock fallback
          const mockUpdatedReport = JSON.parse(JSON.stringify(currentReport)) as ReportResult;
          if (mockUpdatedReport.mode === "draft_from_materials") {
            if (newQuery.toLowerCase().includes("formal")) {
              mockUpdatedReport.executive_summary += " (Telah disesuaikan ke gaya bahasa yang lebih formal dan akademis.)";
            }
            if (newQuery.toLowerCase().includes("pendek") || newQuery.toLowerCase().includes("ringkas")) {
              mockUpdatedReport.executive_summary = mockUpdatedReport.executive_summary.slice(0, 150) + "...";
            }
            if (newQuery.toLowerCase().includes("kesimpulan")) {
              mockUpdatedReport.conclusion = "Kesimpulan telah diperbarui berdasarkan instruksi masukan pengguna.";
            }
          }
          openRouterResult = {
            json: mockUpdatedReport,
            model: "NaLI Preview Engine (Mock)",
          };
        }
      }

      const rawResult =
        openRouterResult?.json && typeof openRouterResult.json === "object"
          ? (openRouterResult.json as Record<string, unknown>)
          : {};

      const rawText = JSON.stringify(rawResult);
      if (containsForbiddenWording(rawText)) {
        const integrityErrMessage: AgentMessage = {
          id: generateId(),
          role: "system",
          type: "error",
          content: "Hasil diblokir karena terdeteksi kata-kata yang melanggar integritas akademik.",
          created_at: new Date().toISOString(),
        };
        thread.messages.push(integrityErrMessage);
        thread.active_run_status = "failed";
        thread.updated_at = new Date().toISOString();

        await updatePersistedReport({
          reportId,
          reportAccessKey,
          report: currentReport,
          agentThread: thread,
        });
        runSaved = true;

        return NextResponse.json({ error: "Hasil diblokir karena pelanggaran integritas akademik." }, { status: 400 });
      }

      // Normalize output report JSON structure
      const updatedReport = normalizeProviderResult(rawResult, reportInput, "NaLI Refinement Engine");

      // Guard final output
      const guarded = guardReportOutput(updatedReport, { sourceVerificationActive: false });
      if (!guarded.allowed) {
        thread.active_run_status = "failed";
        thread.updated_at = new Date().toISOString();
        await updatePersistedReport({
          reportId,
          reportAccessKey,
          report: currentReport,
          agentThread: thread,
        });
        runSaved = true;
        return NextResponse.json({ error: guarded.userMessage }, { status: 400 });
      }

      // 10. Append assistant response server-side
      const assistantMessage: AgentMessage = {
        id: generateId(),
        role: "assistant",
        type: "report_preview",
        content: `Saya telah memproses permintaan Anda: "${newQuery}". Silakan tinjau perubahan pada draf laporan.`,
        metadata: {
          run_id: activeRunId,
          new_report: guarded.report,
        },
        created_at: new Date().toISOString(),
      };
      thread.messages.push(assistantMessage);

      // Mark active run status as completed
      thread.active_run_status = "completed";
      thread.updated_at = new Date().toISOString();

      await updatePersistedReport({
        reportId,
        reportAccessKey,
        report: currentReport,
        agentThread: thread,
      });
      runSaved = true;

      return NextResponse.json({
        success: true,
        messages: thread.messages,
        agentThread: thread,
      });
    } catch (innerError) {
      console.error("Inner NaLI chat handler error", innerError);
      if (!runSaved) {
        thread.active_run_status = "failed";
        thread.updated_at = new Date().toISOString();
        const systemErrMessage: AgentMessage = {
          id: generateId(),
          role: "system",
          type: "error",
          content: "NaLI could not complete this generation because an internal server error occurred. Your report is saved.",
          created_at: new Date().toISOString(),
        };
        thread.messages.push(systemErrMessage);
        
        await updatePersistedReport({
          reportId,
          reportAccessKey,
          report: currentReport,
          agentThread: thread,
        }).catch((e) => console.warn("Failed to reset run status on DB", e));
      }
      throw innerError;
    }
  } catch (error) {
    console.error("NaLI chat route error", error);
    return NextResponse.json({ error: "Terjadi kesalahan server internal." }, { status: 500 });
  }
}
