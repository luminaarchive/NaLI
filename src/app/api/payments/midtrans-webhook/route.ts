import { NextRequest, NextResponse } from "next/server";
import {
  getMidtransNotificationOrderId,
  isMidtransConfigured,
  mapMidtransTransactionStatus,
  type MidtransNotification,
  verifyMidtransSignature,
} from "@/lib/payments/midtrans";
import { updatePaymentFromNotification } from "@/lib/payments/store";

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

  return NextResponse.json({
    payment_id: updated.payment.id,
    report_id: updated.payment.report_id,
    status,
  });
}
