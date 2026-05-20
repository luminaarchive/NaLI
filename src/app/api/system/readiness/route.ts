import { NextResponse } from "next/server";
import { getRuntimeSystemReadiness } from "@/lib/system/readiness";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = await getRuntimeSystemReadiness();
  const supabase = getOptionalSupabaseAdminClient();
  let dbStatus: any = { status: "not_attempted" };
  if (supabase) {
    try {
      const { data: reportsData, error: reportsError } = await supabase.from("reports").select("id").limit(1);
      const { data: feedbackData, error: feedbackError } = await supabase.from("report_feedback").select("id").limit(1);
      
      dbStatus = {
        status: "attempted",
        reports: {
          success: !reportsError,
          error: reportsError ? { code: reportsError.code, message: reportsError.message, details: reportsError.details } : null
        },
        feedback: {
          success: !feedbackError,
          error: feedbackError ? { code: feedbackError.code, message: feedbackError.message, details: feedbackError.details } : null
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
    dbStatus,
  });
}
