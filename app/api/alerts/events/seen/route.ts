import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/http";
import {
  markAlertEventSeen,
  markAllAlertEventsSeen,
  watchAlertsEnabled,
} from "@/lib/watch-alerts/queries";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/alerts/events/seen
 * Body: { eventId?: string }. With eventId, marks one event seen; without it,
 * marks all unseen events seen.
 */
export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Asal permintaan tidak sah" }, { status: 403 });
  }
  if (!watchAlertsEnabled) {
    return NextResponse.json({ error: "Layanan belum dikonfigurasi" }, { status: 503 });
  }
  let eventId: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    eventId = body && body.eventId ? String(body.eventId) : undefined;
  } catch {
    eventId = undefined;
  }
  try {
    if (eventId) await markAlertEventSeen(eventId);
    else await markAllAlertEventsSeen();
    return NextResponse.json({ updated: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
