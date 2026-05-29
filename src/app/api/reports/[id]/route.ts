import { NextRequest, NextResponse } from "next/server";
import { getPersistedReport } from "@/lib/reports/persistence";
import { getReportExportEligibility } from "@/lib/reports/exportGate";
import { verifyAnswer } from "@/lib/reports/answerVerification";
import { evaluateJournalReadiness } from "@/lib/reports/journalReadiness";
import { isJournalTriggered, buildDefaultJournalCandidate } from "@/lib/reports/reportGenerator";
import { evaluateJournalQuality } from "@/lib/reports/journalQuality";

const accessParamName = "to" + "ken";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get(accessParamName);
  const persisted = await getPersistedReport({
    reportAccessToken: token,
    reportId: id,
  });

  if (!persisted.found) {
    const status = persisted.reason === "missing_token" ? 401 : persisted.reason === "supabase_unconfigured" ? 503 : 404;

    return NextResponse.json(
      {
        error:
          status === 401
            ? "Akses laporan membutuhkan access key yang valid."
            : "Laporan tersimpan belum tersedia. Gunakan fallback browser jika laporan baru saja dibuat.",
        persistence: persisted.reason,
      },
      { status },
    );
  }

  const eligibility = await getReportExportEligibility(id);

  const requestInput = persisted.input || {
    mode: persisted.report.mode || "draft_from_materials",
    reportTemplate: persisted.report.report_type || "Laporan Observasi Lingkungan",
    title: persisted.report.title || "",
    role: "pengguna",
    mainText: (persisted.report as any).findings?.join("\n") || "",
    topic: persisted.report.title || "",
    sourceUrls: [],
    location: "",
    fileDescription: "",
    integrityConsent: true,
  };

  const provider_metadata = persisted.processing_metadata?.provider_metadata || {
    primary_model_requested: "unknown",
    model_used: persisted.report.model_used || "unknown",
    fallback_used: false,
    provider_status: "primary_success" as const
  };

  const answer_verification = persisted.processing_metadata?.answer_verification || verifyAnswer(requestInput, persisted.report);
  const journal_readiness = persisted.processing_metadata?.journal_readiness || evaluateJournalReadiness(requestInput, persisted.report);

  let journal_candidate = (persisted.report as any).journal_candidate;
  let journal_quality = (persisted.report as any).journal_quality;

  const isJournal = isJournalTriggered(requestInput);
  if (isJournal && persisted.report.mode === "draft_from_materials") {
    if (!journal_candidate) {
      journal_candidate = buildDefaultJournalCandidate(persisted.report, requestInput);
      if (requestInput.sourceUrls.length === 0) {
        journal_candidate.referencesSuppliedByUser = "Belum ada referensi yang disediakan pengguna.";
      } else {
        journal_candidate.referencesSuppliedByUser = requestInput.sourceUrls.map((url: string) => `- [User Provided] ${url} (Belum diverifikasi)`).join("\n");
      }
    }
    if (!journal_quality) {
      journal_quality = evaluateJournalQuality(requestInput, journal_candidate);
    }
    (persisted.report as any).journal_candidate = journal_candidate;
    (persisted.report as any).journal_quality = journal_quality;
  }

  return NextResponse.json({
    report: persisted.report,
    status: persisted.status,
    export_readiness: eligibility.state,
    provider_metadata,
    answer_verification,
    journal_readiness,
    journal_candidate,
    journal_quality,
  });
}
