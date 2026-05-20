import { NextResponse } from "next/server";
import { getRuntimeSystemReadiness } from "@/lib/system/readiness";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function parseJwtRef(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    return payload.ref || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const readiness = await getRuntimeSystemReadiness();
  
  // Environment variable validation checks (without printing raw secrets)
  const envSupabaseUrl = process.env.SUPABASE_URL;
  const envNextPublicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const envVerification = {
    supabaseUrlExists: !!envSupabaseUrl,
    supabaseUrlHostMatches: envSupabaseUrl ? envSupabaseUrl.includes("wvpplfjrbndzxlgpuicn.supabase.co") : false,
    supabaseUrlNoRestV1: envSupabaseUrl ? !envSupabaseUrl.includes("/rest/v1") : true,
    supabaseUrlNotPostgres: envSupabaseUrl ? !(envSupabaseUrl.startsWith("postgres://") || envSupabaseUrl.startsWith("postgresql://")) : true,
    
    supabaseServiceRoleKeyExists: !!envServiceRoleKey,
    
    nextPublicSupabaseUrlExists: !!envNextPublicSupabaseUrl,
    nextPublicSupabaseUrlHostMatches: envNextPublicSupabaseUrl ? envNextPublicSupabaseUrl.includes("wvpplfjrbndzxlgpuicn.supabase.co") : false,
    nextPublicSupabaseUrlNoRestV1: envNextPublicSupabaseUrl ? !envNextPublicSupabaseUrl.includes("/rest/v1") : true,
    
    anonKeyProjectRef: parseJwtRef(envAnonKey),
    serviceKeyProjectRef: parseJwtRef(envServiceRoleKey),
    projectRefsMatch: parseJwtRef(envAnonKey) === parseJwtRef(envServiceRoleKey) && parseJwtRef(envServiceRoleKey) !== null
  };

  const supabase = getOptionalSupabaseAdminClient();
  let dbStatus: any = { status: "not_attempted" };
  if (supabase) {
    try {
      const { error: reportsError, count: reportsCount } = await supabase
        .from("reports")
        .select("id", { count: "exact", head: true });
        
      const { error: feedbackError, count: feedbackCount } = await supabase
        .from("report_feedback")
        .select("id", { count: "exact", head: true });
        
      const { error: usageError, count: usageCount } = await supabase
        .from("usage_events")
        .select("id", { count: "exact", head: true });

      const { error: paymentsError, count: paymentsCount } = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true });
      
      dbStatus = {
        status: "attempted",
        reports: {
          success: !reportsError,
          count: reportsCount ?? null,
          error: reportsError ? { code: reportsError.code, message: reportsError.message, details: reportsError.details } : null
        },
        feedback: {
          success: !feedbackError,
          count: feedbackCount ?? null,
          error: feedbackError ? { code: feedbackError.code, message: feedbackError.message, details: feedbackError.details } : null
        },
        usageEvents: {
          success: !usageError,
          count: usageCount ?? null,
          error: usageError ? { code: usageError.code, message: usageError.message, details: usageError.details } : null
        },
        payments: {
          success: !paymentsError,
          count: paymentsCount ?? null,
          error: paymentsError ? { code: paymentsError.code, message: paymentsError.message, details: paymentsError.details } : null
        }
      };
    } catch (err: any) {
      dbStatus = { status: "error", message: err.message };
    }
  } else {
    dbStatus = { status: "supabase_unconfigured" };
  }

  return NextResponse.json({
    ...readiness,
    envVerification,
    dbStatus,
  });
}
