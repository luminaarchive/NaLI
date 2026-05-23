import { NextRequest, NextResponse } from "next/server";
import {
  getMidtransNotificationOrderId,
  isMidtransConfigured,
  isSuccessfulPaymentStatus,
  mapMidtransTransactionStatus,
  type MidtransNotification,
  verifyMidtransSignature,
} from "@/lib/payments/midtrans";
import { logReportEvent } from "@/lib/operations/logging";
import { updatePaymentFromNotification } from "@/lib/payments/store";
import { PLAN_CATALOG, TOP_UP_PACKS } from "@/lib/pricing/plans";
import { recordEnergyLedgerEntry, UUID_NAMESPACE } from "@/lib/reports/persistence";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { v5 as uuidv5 } from "uuid";

export async function POST(req: NextRequest) {
  if (!isMidtransConfigured()) {
    return NextResponse.json({ error: "Payment gateway belum dikonfigurasi." }, { status: 503 });
  }

  let notification: MidtransNotification;

  try {
    notification = (await req.json()) as MidtransNotification;
  } catch {
    return NextResponse.json({ error: "Format webhook tidak valid." }, { status: 400 });
  }

  if (!verifyMidtransSignature(notification)) {
    return NextResponse.json({ error: "Signature webhook tidak valid." }, { status: 401 });
  }

  const midtransOrderId = getMidtransNotificationOrderId(notification);

  if (!midtransOrderId) {
    return NextResponse.json({ error: "Order ID tidak ditemukan di webhook." }, { status: 400 });
  }

  const status = mapMidtransTransactionStatus(notification);
  const updated = await updatePaymentFromNotification({
    midtransOrderId,
    notification,
    status,
  });

  if (!updated.updated) {
    const responseStatus = updated.reason === "supabase_unconfigured" ? 503 : 404;

    return NextResponse.json(
      {
        error:
          responseStatus === 503
            ? "Persistence Supabase belum aktif, webhook belum bisa dicatat."
            : "Payment order tidak ditemukan.",
        status: updated.reason,
      },
      { status: responseStatus },
    );
  }

  // Grant credits if payment is successful
  if (isSuccessfulPaymentStatus(status)) {
    const rawNotification = (updated.payment as any).raw_notification || {};
    const metadata = rawNotification.metadata || {};

    if (
      metadata.product_type &&
      (metadata.product_type === "plan" || metadata.product_type === "topup") &&
      metadata.product_id &&
      metadata.guest_session_id_hash &&
      Number(metadata.credits_to_grant) > 0 &&
      Number(metadata.gross_amount) === Number(updated.payment.amount)
    ) {
      const creditsToGrant = Number(metadata.credits_to_grant);
      const grantDescription = `${metadata.product_type === "plan" ? "Plan" : "Top-up"} purchase: ${metadata.product_id}`;
      const grantId = uuidv5(`payment_grant:${midtransOrderId}`, UUID_NAMESPACE);

      await recordEnergyLedgerEntry({
        id: grantId,
        amount: creditsToGrant,
        guestSessionIdHash: metadata.guest_session_id_hash,
        reason: grantDescription,
        reportId: updated.payment.report_id,
        type: "credit",
      });
    } else {
      console.warn("NaLI webhook: Invalid trusted metadata or gross amount mismatch. Credit grant skipped.", {
        metadata,
        paymentAmount: updated.payment.amount,
      });
    }
  }

  void logReportEvent({
    eventType: "PAYMENT_CONFIRMED",
    metadata: { payment_status: status },
    reportId: updated.payment.report_id,
    status: isSuccessfulPaymentStatus(status) ? "success" : "skipped",
  });

  return NextResponse.json({
    payment_id: updated.payment.id,
    report_id: updated.payment.report_id,
    status,
  });
}
