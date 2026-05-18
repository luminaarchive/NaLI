import { NextRequest, NextResponse } from "next/server";
import {
  createMidtransOrderId,
  getExportAmountIdr,
  getMidtransAuthorizationHeader,
  getMidtransPaymentExpiry,
  getMidtransSnapEndpoint,
  isMidtransConfigured,
  normalizeExportType,
} from "@/lib/payments/midtrans";
import { createPaymentRecord, getSuccessfulPaymentForReport } from "@/lib/payments/store";
import { getPersistedReport } from "@/lib/reports/persistence";

function getInputObject(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan pembayaran tidak valid." }, { status: 400 });
  }

  const input = getInputObject(body);
  const reportId = typeof input.report_id === "string" ? input.report_id : "";
  const reportAccessKey =
    typeof input.report_access_key === "string"
      ? input.report_access_key
      : typeof input.report_access_token === "string"
        ? input.report_access_token
        : "";
  const exportType = normalizeExportType(input.export_type);

  if (!reportId || !reportAccessKey) {
    return NextResponse.json({ error: "Laporan dan access key diperlukan sebelum membuat pembayaran." }, { status: 400 });
  }

  if (!isMidtransConfigured()) {
    return NextResponse.json(
      {
        error: "Export premium belum aktif di MVP ini.",
        status: "not_configured",
      },
      { status: 503 },
    );
  }

  const persisted = await getPersistedReport({ reportAccessToken: reportAccessKey, reportId });

  if (!persisted.found) {
    const status = persisted.reason === "supabase_unconfigured" ? 503 : 404;

    return NextResponse.json(
      {
        error:
          status === 503
            ? "Persistence Supabase belum aktif, jadi export premium belum bisa dibuat."
            : "Laporan tidak ditemukan atau access key tidak valid.",
      },
      { status },
    );
  }

  const existingPayment = await getSuccessfulPaymentForReport(reportId);

  if (existingPayment.found) {
    return NextResponse.json(
      {
        error: "Export untuk laporan ini sudah terbuka.",
        status: "already_paid",
      },
      { status: 409 },
    );
  }

  const amount = getExportAmountIdr(exportType);
  const midtransOrderId = createMidtransOrderId(reportId);
  const paymentExpiresAt = getMidtransPaymentExpiry();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://naliai.vercel.app";

  const midtransResponse = await fetch(getMidtransSnapEndpoint(), {
    body: JSON.stringify({
      callbacks: {
        finish: `${appUrl}/report/${reportId}`,
      },
      credit_card: {
        secure: true,
      },
      expiry: {
        duration: 24,
        unit: "hour",
      },
      item_details: [
        {
          id: `nali-export-${exportType}`,
          name: `NaLI Export Premium (${exportType})`,
          price: amount,
          quantity: 1,
        },
      ],
      transaction_details: {
        gross_amount: amount,
        order_id: midtransOrderId,
      },
    }),
    headers: {
      Accept: "application/json",
      Authorization: getMidtransAuthorizationHeader(),
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const snapPayload = (await midtransResponse.json().catch(() => ({}))) as {
    redirect_url?: string;
    token?: string;
  };

  if (!midtransResponse.ok || !snapPayload.token) {
    console.warn("Midtrans Snap create failed", {
      status: midtransResponse.status,
    });
    return NextResponse.json(
      {
        error: "Payment gateway belum bisa membuat transaksi. Coba lagi nanti.",
        status: "midtrans_failed",
      },
      { status: 502 },
    );
  }

  const payment = await createPaymentRecord({
    amount,
    exportType,
    midtransOrderId,
    paymentExpiresAt,
    reportId,
  });

  if (!payment.created) {
    return NextResponse.json(
      {
        error: "Pembayaran dibuat oleh gateway, tetapi belum bisa dicatat di database. Hubungi admin sebelum membayar.",
        status: payment.reason,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    amount,
    export_type: exportType,
    payment_id: payment.payment.id,
    snap_token: snapPayload.token,
    snap_url: snapPayload.redirect_url,
    status: "pending",
  });
}
