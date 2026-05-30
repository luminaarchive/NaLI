import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const PLANS = {
  sapling: { price: 45000, name: "NaLI Sapling" },
  forest_keeper: { price: 149000, name: "NaLI Forest Keeper" },
} as const;

function isMidtransProductionMode(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

function getMidtransSnapEndpoint(): string {
  return isMidtransProductionMode()
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const { plan } = body as { plan?: string };
  const planConfig = plan ? PLANS[plan as keyof typeof PLANS] : null;

  if (!planConfig) {
    return NextResponse.json({ error: "Plan tidak valid. Pilih sapling atau forest_keeper." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Login diperlukan untuk berlangganan." }, { status: 401 });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json(
      { error: "Payment gateway belum dikonfigurasi. Hubungi admin." },
      { status: 503 }
    );
  }

  const orderId = `nali-${plan}-${user.id.slice(0, 8)}-${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://naliai.vercel.app";

  const snapPayload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: planConfig.price,
    },
    customer_details: {
      email: user.email,
    },
    item_details: [
      {
        id: plan,
        price: planConfig.price,
        quantity: 1,
        name: planConfig.name,
      },
    ],
    callbacks: {
      finish: `${siteUrl}/pricing?payment=success`,
      error: `${siteUrl}/pricing?payment=error`,
    },
  };

  const response = await fetch(getMidtransSnapEndpoint(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
    },
    body: JSON.stringify(snapPayload),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Gagal membuat transaksi. Coba lagi nanti." },
      { status: 502 }
    );
  }

  const data = (await response.json()) as { token?: string; redirect_url?: string };

  if (!data.token) {
    return NextResponse.json({ error: "Respons payment gateway tidak valid." }, { status: 502 });
  }

  return NextResponse.json({ token: data.token, redirect_url: data.redirect_url });
}
