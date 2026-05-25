import { NextRequest, NextResponse } from "next/server";
import { getEnergyBalance } from "@/lib/energy/ledger";
import { recordEnergyLedgerEntry, UUID_NAMESPACE } from "@/lib/reports/persistence";
import { getGuestSessionIdHash, isUsableGuestSessionId } from "@/lib/reports/access";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { v5 as uuidv5 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json().catch(() => null)) as { guestSessionId?: unknown } | null;
    const guestSessionId = input?.guestSessionId;

    if (!isUsableGuestSessionId(guestSessionId)) {
      return NextResponse.json(
        { ready: false, balance: 0, trialAvailable: false, reason: "missing_guest_session" },
        { status: 400 },
      );
    }

    const guestSessionIdHash = getGuestSessionIdHash(guestSessionId);
    const balanceRes = await getEnergyBalance(guestSessionId);

    // If Supabase is unconfigured, return ready: false
    if (!balanceRes.ready) {
      return NextResponse.json({
        ready: false,
        balance: 0,
        trialAvailable: false,
        reason: balanceRes.reason,
        source: "unconfigured",
      });
    }

    const supabase = getOptionalSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({
        ready: false,
        balance: 0,
        trialAvailable: false,
        reason: "supabase_unconfigured",
        source: "unconfigured",
      });
    }

    // Check if user has any entries at all (to seed trial credits)
    const { data: entries, error: countError } = await supabase
      .from("energy_ledger")
      .select("id")
      .eq("guest_session_id_hash", guestSessionIdHash)
      .limit(1);

    if (countError) {
      console.warn("NaLI check entries failed", countError);
      return NextResponse.json({
        ready: true,
        balance: balanceRes.balance,
        trialAvailable: false,
        source: "ledger",
      });
    }

    // Seeding trial credits if they have no entries
    if (entries && entries.length === 0) {
      // Deterministic UUID for the trial grant
      const trialGrantId = uuidv5(`trial_grant:${guestSessionIdHash}`, UUID_NAMESPACE);

      const seedRes = await recordEnergyLedgerEntry({
        id: trialGrantId,
        amount: 30,
        guestSessionIdHash,
        reason: `trial_grant:${guestSessionIdHash}`,
        type: "credit",
      });

      if (seedRes.recorded) {
        // Fetch balance again after seeding
        const updatedBalanceRes = await getEnergyBalance(guestSessionId);
        return NextResponse.json({
          ready: true,
          balance: updatedBalanceRes.ready ? updatedBalanceRes.balance : 30,
          trialAvailable: false,
          source: "ledger",
        });
      }
    }

    return NextResponse.json({
      ready: true,
      balance: balanceRes.balance,
      trialAvailable: false,
      source: "ledger",
    });
  } catch (error) {
    console.error("NaLI energy balance route error", error);
    return NextResponse.json({ error: "Terjadi kesalahan server internal." }, { status: 500 });
  }
}
