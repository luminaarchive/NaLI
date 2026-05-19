import { NextResponse } from "next/server";
import { getRuntimeSystemReadiness } from "@/lib/system/readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getRuntimeSystemReadiness());
}
