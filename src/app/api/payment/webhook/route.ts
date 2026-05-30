import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json({ error: "Server key not configured." }, { status: 503 });
  }

  // Verify Midtrans signature
  const expectedSignature = createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  const isSuccess =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");

  if (!isSuccess) {
    return NextResponse.json({ ok: true, status: "ignored" });
  }

  // Parse plan and user prefix from order_id: nali-{plan}-{userId8chars}-{timestamp}
  const parts = order_id.split("-");
  if (parts.length < 4 || parts[0] !== "nali") {
    return NextResponse.json({ ok: true, status: "unrecognized_order" });
  }

  const plan = parts[1];
  const userIdPrefix = parts[2];

  if (!["sapling", "forest_keeper"].includes(plan)) {
    return NextResponse.json({ ok: true, status: "unrecognized_plan" });
  }

  const adminClient = getOptionalSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ ok: true, status: "db_unconfigured" });
  }

  // Find the user by id prefix (first 8 chars of UUID)
  const { data: users } = await adminClient
    .from("profiles")
    .select("id")
    .ilike("id", `${userIdPrefix}%`)
    .limit(1);

  const userId = users?.[0]?.id;
  if (!userId) {
    return NextResponse.json({ ok: true, status: "user_not_found" });
  }

  await adminClient.from("user_subscriptions").upsert({
    user_id: userId,
    plan,
    order_id,
    status: "active",
    activated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
