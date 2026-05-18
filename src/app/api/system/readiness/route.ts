import { NextResponse } from "next/server";
import { getSystemReadiness } from "@/lib/system/readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSystemReadiness());
}
