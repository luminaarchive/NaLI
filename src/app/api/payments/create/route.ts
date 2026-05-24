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
import { getPlanById, getTopUpPackById } from "@/lib/pricing/plans";

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
    return NextResponse.json(
      {
        error: RATE_LIMITED_MESSAGE,
        code: "RATE_LIMIT",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      { headers: rateLimitHeaders(rateLimit), status: 429 }
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

  const planId = typeof input.plan_id === "string" ? input.plan_id : "";
  const packId = typeof input.pack_id === "string" ? input.pack_id : "";

  if (planId && packId) {
    return NextResponse.json({ error: "Pilih salah satu: plan atau top-up." }, { status: 400 });
  }

  let plan = null;
  if (planId) {
    plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan tidak valid." }, { status: 400 });
    }
  }

  let pack = null;
  if (packId) {
    pack = getTopUpPackById(packId);
    if (!pack) {
      return NextResponse.json({ error: "Paket top-up tidak valid." }, { status: 400 });
    }
  }

  // Only check for existing export payment if we are buying a plain export
  if (!plan && !pack) {
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
  }

  let amount: number;
  let itemName: string;
  let itemId: string;
  let midtransOrderId: string;

  if (plan) {
    amount = plan.priceAmount;
    itemName = `NaLI Plan: ${plan.name}`;
    itemId = `nali-plan-${plan.id}`;
    midtransOrderId = `nali-plan-${plan.id}-${reportId.slice(0, 8)}-${Date.now()}`;
  } else if (pack) {
    amount = pack.priceAmount;
    itemName = `NaLI Top-up: ${pack.name}`;
    itemId = `nali-topup-${pack.id}`;
    midtransOrderId = `nali-topup-${pack.id}-${reportId.slice(0, 8)}-${Date.now()}`;
  } else {
    amount = getExportAmountIdr(exportType);
    itemName = `NaLI Export Premium (${exportType})`;
    itemId = `nali-export-${exportType}`;
    midtransOrderId = createMidtransOrderId(reportId);
  }

  // Server-side trusted metadata
  const trustedMetadata = {
    metadata: {
      order_id: midtransOrderId,
      guest_session_id_hash: persisted.guest_session_id_hash,
      product_type: plan ? "plan" : pack ? "topup" : "export",
      product_id: plan ? plan.id : pack ? pack.id : exportType,
      credits_to_grant: plan ? plan.credits : pack ? pack.credits : 0,
      gross_amount: amount,
      status: "pending",
      created_at: new Date().toISOString(),
    }
  };

  const paymentExpiresAt = getMidtransPaymentExpiry();

  if (!isMidtransConfigured()) {
    const fallbackOrderId = plan 
      ? `manual-plan-${plan.id}-${reportId.slice(0, 8)}-${Date.now()}`
      : pack
        ? `manual-topup-${pack.id}-${reportId.slice(0, 8)}-${Date.now()}`
        : createManualPaymentOrderId(reportId);

    const manualMetadata = {
      metadata: {
        ...trustedMetadata.metadata,
        order_id: fallbackOrderId,
      }
    };

    const payment = await createPaymentRecord({
      amount,
      exportType: plan || pack ? "markdown" : exportType,
      midtransOrderId: fallbackOrderId,
      paymentExpiresAt,
      reportId,
      rawNotification: manualMetadata,
    });

    void logUsageEvent({
      actionType: "premium_export_attempt",
      metadata: { export_type: exportType, payment_gateway: "manual_pending", plan_id: planId, pack_id: packId },
      reportId,
      status: payment.created ? "manual_payment_pending" : payment.reason,
    });
    void logReportEvent({
      eventType: "PAYMENT_CREATED",
      metadata: { export_type: exportType, payment_mode: "manual", payment_status: "pending", plan_id: planId, pack_id: packId },
      reportId,
      status: payment.created ? "success" : "failed",
    });

    if (!payment.created) {
      return NextResponse.json(
        {
          error: "Pembayaran belum bisa dicatat di database. Silakan coba lagi nanti.",
          status: payment.reason,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      amount,
      export_type: plan || pack ? "markdown" : exportType,
      message:
        "Payment gateway belum aktif. Transaksi Anda dicatat sebagai pending; export akan terbuka secara otomatis setelah sistem memverifikasi pembayaran.",
      payment_id: payment.payment.id,
      payment_mode: "manual",
      payment_reference: payment.payment.midtrans_order_id,
      status: "manual_payment_pending",
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://naliai.vercel.app";
  const midtransSnapPayload = {
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
        id: itemId,
        name: itemName,
        price: amount,
        quantity: 1,
      },
    ],
    transaction_details: {
      gross_amount: amount,
      order_id: midtransOrderId,
    },
  };

  const midtransResponse = await fetch(getMidtransSnapEndpoint(), {
    body: JSON.stringify(midtransSnapPayload),
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
      metadata: { export_type: exportType, payment_mode: "midtrans", payment_status: "gateway_failed", plan_id: planId, pack_id: packId },
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
    exportType: plan || pack ? "markdown" : exportType,
    midtransOrderId,
    paymentExpiresAt,
    reportId,
    rawNotification: trustedMetadata,
  });

  if (!payment.created) {
    void logReportEvent({
      eventType: "PAYMENT_CREATED",
      metadata: { export_type: exportType, payment_mode: "midtrans", payment_status: payment.reason, plan_id: planId, pack_id: packId },
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
    metadata: { export_type: exportType, payment_mode: "midtrans", payment_status: "pending", plan_id: planId, pack_id: packId },
    reportId,
    status: "success",
  });

  return NextResponse.json({
    amount,
    checkout_url: checkoutUrl,
    export_type: plan || pack ? "markdown" : exportType,
    payment_id: payment.payment.id,
    snap_token: snapPayload.token,
    snap_url: checkoutUrl,
    status: "pending",
  });
}
