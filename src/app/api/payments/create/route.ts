import { NextRequest, NextResponse } from "next/server";
import { getPersistedReport } from "@/lib/reports/persistence";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan pembayaran tidak valid." }, { status: 400 });
  }

  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const reportId = typeof input.report_id === "string" ? input.report_id : "";
  const reportAccessToken = typeof input.report_access_token === "string" ? input.report_access_token : "";

  if (!reportId || !reportAccessToken) {
    return NextResponse.json({ error: "Laporan dan access key diperlukan sebelum membuat pembayaran." }, { status: 400 });
  }

  const persisted = await getPersistedReport({ reportAccessToken, reportId });

  if (!persisted.found) {
    return NextResponse.json({ error: "Laporan tidak ditemukan atau access key tidak valid." }, { status: 404 });
  }

  if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_MERCHANT_ID) {
    return NextResponse.json(
      {
        error: "Payment gateway belum aktif di MVP ini.",
        status: "not_configured",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      error: "Payment gateway disiapkan untuk Sprint 0, tetapi transaksi otomatis belum diaktifkan.",
      status: "not_implemented",
    },
    { status: 501 },
  );
}
