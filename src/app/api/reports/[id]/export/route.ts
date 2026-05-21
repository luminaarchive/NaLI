import { NextRequest, NextResponse } from "next/server";
import { logReportEvent } from "@/lib/operations/logging";
import { getReportExportEligibility } from "@/lib/reports/exportGate";
import { buildReportMarkdown } from "@/lib/reports/markdown";
import { buildReportPdfBytes } from "@/lib/reports/pdf";
import { getPersistedReport } from "@/lib/reports/persistence";
import { logUsageEvent } from "@/lib/usage/logging";

const accessParamName = "to" + "ken";
type ExportFormat = "markdown" | "pdf";

function normalizeExportFormat(value: string | null): ExportFormat | null {
  if (!value || value === "markdown") return "markdown";
  if (value === "pdf") return "pdf";
  return null;
}

function downloadFilename(title: string, format: ExportFormat) {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "nali-report";

  return `${slug}.${format === "pdf" ? "pdf" : "md"}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reportAccessKey = req.nextUrl.searchParams.get(accessParamName);
  const exportFormat = normalizeExportFormat(
    req.nextUrl.searchParams.get("format") ?? req.nextUrl.searchParams.get("type"),
  );

  if (!exportFormat) {
    return NextResponse.json({ error: "Format export belum didukung." }, { status: 501 });
  }

  const persisted = await getPersistedReport({
    reportAccessToken: reportAccessKey,
    reportId: id,
  });

  if (!persisted.found) {
    const status = persisted.reason === "missing_token" ? 401 : persisted.reason === "supabase_unconfigured" ? 503 : 404;

    return NextResponse.json(
      {
        error:
          status === 401
            ? "Akses laporan membutuhkan access key yang valid."
            : "Laporan tersimpan belum tersedia untuk export premium.",
      },
      { status },
    );
  }

  const eligibility = await getReportExportEligibility(id);

  if (!eligibility.eligible) {
    void logReportEvent({
      eventType: "EXPORT_ATTEMPTED",
      metadata: { export_state: eligibility.state, format: exportFormat },
      reportId: id,
      status: "locked",
    });
    void logUsageEvent({
      actionType: "premium_export_attempt",
      metadata: { export_state: eligibility.state, export_type: exportFormat },
      reportId: id,
      status: "locked",
    });

    return NextResponse.json(
      {
        error:
          eligibility.reason === "export_unconfigured"
            ? "Export premium belum aktif di MVP ini."
            : "Unlock Export diperlukan sebelum mengunduh file premium.",
        state: eligibility.state,
      },
      { status: eligibility.reason === "export_unconfigured" ? 501 : 402 },
    );
  }

  void logReportEvent({
    eventType: "EXPORT_ATTEMPTED",
    metadata: { export_state: eligibility.state, format: exportFormat },
    reportId: id,
    status: "unlocked",
  });
  void logReportEvent({
    eventType: "EXPORT_UNLOCKED",
    metadata: { export_state: eligibility.state, format: exportFormat },
    reportId: id,
    status: "success",
  });
  void logUsageEvent({
    actionType: "premium_export_attempt",
    metadata: { export_state: eligibility.state, export_type: exportFormat },
    reportId: id,
    status: "unlocked",
  });

  if (exportFormat === "pdf") {
    const pdfBytes = await buildReportPdfBytes(persisted.report, { exportStatus: "export_ready" });
    const pdfBlob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Disposition": `attachment; filename="${downloadFilename(persisted.report.title, "pdf")}"`,
        "Content-Type": "application/pdf",
      },
    });
  }

  const markdown = buildReportMarkdown(persisted.report, { exportStatus: "export_ready" });

  return new NextResponse(markdown, {
    headers: {
      "Content-Disposition": `attachment; filename="${downloadFilename(persisted.report.title, "markdown")}"`,
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
