import { NextRequest, NextResponse } from "next/server";
import {
  createMidtransOrderId,
  getExportAmountIdr,
  getMidtransAuthorizationHeader,
  getMidtransPaymentExpiry,
  getMidtransSnapEndpoint,
  isMidtransConfigured,
  isSafeMidtransCheckoutUrl,
  normalizeExportType,
} from "@/lib/payments/midtrans";
import { logReportEvent } from "@/lib/operations/logging";
import { createPaymentRecord, getSuccessfulPaymentForReport } from "@/lib/payments/store";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";
import { getPersistedReport } from "@/lib/reports/persistence";
import { logUsageEvent } from "@/lib/usage/logging";

function getInputObject(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

function createManualPaymentOrderId(reportId: string) {
  return `manual-${reportId.slice(0, 8)}-${Date.now()}`;
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

  const rateLimit = await checkRateLimit({
    actionType: "payment_create",
    guestSessionId: input.guestSessionId,
    request: req,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { headers: rateLimitHeaders(rateLimit), status: 429 });
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
    void logUsageEvent({
      actionType: "premium_export_attempt",
      metadata: { export_type: exportType, payment_status: "already_paid" },
      reportId,
      status: "already_paid",
    });
    return NextResponse.json(
      {
        error: "Export untuk laporan ini sudah terbuka.",
        status: "already_paid",
      },
      { status: 409 },
    );
  }

  const amount = getExportAmountIdr(exportType);
  const paymentExpiresAt = getMidtransPaymentExpiry();

  if (!isMidtransConfigured()) {
    const payment = await createPaymentRecord({
      amount,
      exportType,
      midtransOrderId: createManualPaymentOrderId(reportId),
      paymentExpiresAt,
      reportId,
    });

    void logUsageEvent({
      actionType: "premium_export_attempt",
      metadata: { export_type: exportType, payment_gateway: "manual_pending" },
      reportId,
      status: payment.created ? "manual_payment_pending" : payment.reason,
    });
    void logReportEvent({
      eventType: "PAYMENT_CREATED",
      metadata: { export_type: exportType, payment_mode: "manual", payment_status: "pending" },
      reportId,
      status: payment.created ? "success" : "failed",
    });

    if (!payment.created) {
      return NextResponse.json(
        {
          error: "Pembayaran manual belum bisa dicatat di database. Hubungi admin sebelum membayar.",
          status: payment.reason,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      amount,
      export_type: exportType,
      message:
        "Payment gateway belum dikonfigurasi. Pembayaran manual dicatat sebagai pending; export tetap terkunci sampai pembayaran dikonfirmasi admin.",
      payment_id: payment.payment.id,
      payment_mode: "manual",
      payment_reference: payment.payment.midtrans_order_id,
      status: "manual_payment_pending",
    });
  }

  const midtransOrderId = createMidtransOrderId(reportId);
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
  const checkoutUrl = isSafeMidtransCheckoutUrl(snapPayload.redirect_url) ? snapPayload.redirect_url : null;

  if (!midtransResponse.ok || !snapPayload.token || !checkoutUrl) {
    console.warn("Midtrans Snap create failed", {
      status: midtransResponse.status,
    });
    void logReportEvent({
      eventType: "PAYMENT_CREATED",
      metadata: { export_type: exportType, payment_mode: "midtrans", payment_status: "gateway_failed" },
      reportId,
      status: "failed",
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
    void logReportEvent({
      eventType: "PAYMENT_CREATED",
      metadata: { export_type: exportType, payment_mode: "midtrans", payment_status: payment.reason },
      reportId,
      status: "failed",
    });
    return NextResponse.json(
      {
        error: "Pembayaran dibuat oleh gateway, tetapi belum bisa dicatat di database. Hubungi admin sebelum membayar.",
        status: payment.reason,
      },
      { status: 503 },
    );
  }

  void logReportEvent({
    eventType: "PAYMENT_CREATED",
    metadata: { export_type: exportType, payment_mode: "midtrans", payment_status: "pending" },
    reportId,
    status: "success",
  });

  return NextResponse.json({
    amount,
    checkout_url: checkoutUrl,
    export_type: exportType,
    payment_id: payment.payment.id,
    snap_token: snapPayload.token,
    snap_url: checkoutUrl,
    status: "pending",
  });
}
