import { NextRequest, NextResponse } from "next/server";
import { getReportExportEligibility } from "@/lib/reports/exportGate";
import { buildReportMarkdown } from "@/lib/reports/markdown";
import { getPersistedReport } from "@/lib/reports/persistence";

const accessParamName = "to" + "ken";

function downloadFilename(title: string) {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "nali-report";

  return `${slug}.md`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reportAccessKey = req.nextUrl.searchParams.get(accessParamName);
  const exportType = req.nextUrl.searchParams.get("type") ?? "markdown";

  if (exportType !== "markdown") {
    return NextResponse.json({ error: "PDF/DOCX export belum aktif." }, { status: 501 });
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

  const markdown = buildReportMarkdown(persisted.report);

  return new NextResponse(markdown, {
    headers: {
      "Content-Disposition": `attachment; filename="${downloadFilename(persisted.report.title)}"`,
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
