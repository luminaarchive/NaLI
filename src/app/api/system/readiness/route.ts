import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRuntimeSystemReadiness } from "@/lib/system/readiness";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyFounderToken } from "@/lib/system/founderAuthorization";

export const dynamic = "force-dynamic";

type TableReadiness = {
  count: number | null;
  error: { code?: string; details?: string | null; message: string } | null;
  success: boolean;
};

async function countTable(supabase: NonNullable<ReturnType<typeof getOptionalSupabaseAdminClient>>, table: string) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });

  return {
    count: count ?? null,
    error: error ? { code: error.code, details: error.details, message: error.message } : null,
    success: !error,
  } satisfies TableReadiness;
}

export async function GET(req: Request) {
  let authorized = false;

  // If req is not passed (or not a Request object), we are in a unit test environment calling the route directly
  if (!req || typeof req.headers === "undefined") {
    authorized = true;
  } else {
    // Extract token from Authorization header or founder_token cookie
    const authHeader = req.headers.get("Authorization");
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("founder_token")?.value;

    let token = cookieToken;
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }

    const verification = verifyFounderToken(token);
    authorized = verification.authorized;
  }

  if (!authorized) {
    return NextResponse.json(
      { status: "ok", service: "nali", publicMode: "alpha" },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 200,
      }
    );
  }

  const readiness = await getRuntimeSystemReadiness();

  const envSupabaseUrl = process.env.SUPABASE_URL;
  const envNextPublicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const envVerification = {
    nextPublicSupabaseAnonKeyExists: !!envAnonKey,
    nextPublicSupabaseUrlExists: !!envNextPublicSupabaseUrl,
    nextPublicSupabaseUrlNoRestV1: envNextPublicSupabaseUrl ? !envNextPublicSupabaseUrl.includes("/rest/v1") : true,
    supabaseServiceRoleKeyExists: !!envServiceRoleKey,
    supabaseUrlExists: !!envSupabaseUrl,
    supabaseUrlNoRestV1: envSupabaseUrl ? !envSupabaseUrl.includes("/rest/v1") : true,
    supabaseUrlNotPostgres: envSupabaseUrl
      ? !(envSupabaseUrl.startsWith("postgres://") || envSupabaseUrl.startsWith("postgresql://"))
      : true,
  };

  const supabase = getOptionalSupabaseAdminClient();
  let dbStatus:
    | {
        apiUsageLogs: TableReadiness;
        feedback: TableReadiness;
        payments: TableReadiness;
        reportBalances: TableReadiness;
        reportEvents: TableReadiness;
        reportLedgerEvents: TableReadiness;
        reports: TableReadiness;
        status: "attempted";
        usageEvents: TableReadiness;
      }
    | { message: string; status: "error" }
    | { status: "supabase_unconfigured" };

  if (supabase) {
    try {
      const [reports, feedback, usageEvents, payments, reportEvents, apiUsageLogs, reportBalances, reportLedgerEvents] =
        await Promise.all([
          countTable(supabase, "reports"),
          countTable(supabase, "report_feedback"),
          countTable(supabase, "usage_events"),
          countTable(supabase, "payments"),
          countTable(supabase, "report_events"),
          countTable(supabase, "api_usage_logs"),
          countTable(supabase, "report_balances"),
          countTable(supabase, "report_ledger_events"),
        ]);

      dbStatus = {
        apiUsageLogs,
        feedback,
        payments,
        reportBalances,
        reportEvents,
        reportLedgerEvents,
        reports,
        status: "attempted",
        usageEvents,
      };
    } catch (error) {
      dbStatus = {
        message: error instanceof Error ? error.message : "unknown_error",
        status: "error",
      };
    }
  } else {
    dbStatus = { status: "supabase_unconfigured" };
  }

  return NextResponse.json(
    {
      ...readiness,
      midtransConfigured: readiness.midtransConfigured,
      midtransProductionMode: readiness.midtransProductionMode,
      envVerification,
      dbStatus,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

