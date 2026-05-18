import { NextRequest, NextResponse } from "next/server";
import { getPersistedReport } from "@/lib/reports/persistence";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");
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

  return NextResponse.json({
    report: persisted.report,
    status: persisted.status,
  });
}
