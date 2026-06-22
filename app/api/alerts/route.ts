import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/http";
import { ALERT_TRIGGERS } from "@/lib/watch-alerts/types";
import {
  createAlert,
  getActiveAlerts,
  getUnseenAlertEvents,
  watchAlertsEnabled,
} from "@/lib/watch-alerts/queries";

export const dynamic = "force-dynamic";

/** GET /api/alerts -> active alerts + unseen events (for the panel). */
export async function GET() {
  const [alerts, events] = await Promise.all([getActiveAlerts(), getUnseenAlertEvents(20)]);
  return NextResponse.json({ enabled: watchAlertsEnabled, alerts, events });
}

/** POST /api/alerts -> create a watch alert. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Asal permintaan tidak sah" }, { status: 403 });
  }
  if (!watchAlertsEnabled) {
    return NextResponse.json({ error: "Layanan belum dikonfigurasi" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }

  const trigger = String(body.trigger ?? "");
  if (!ALERT_TRIGGERS.includes(trigger as (typeof ALERT_TRIGGERS)[number])) {
    return NextResponse.json({ error: "Jenis pemicu tidak valid" }, { status: 400 });
  }
  const topicSlug = body.topicSlug ? String(body.topicSlug).trim() : undefined;
  const seriesId = body.seriesId ? String(body.seriesId).trim() : undefined;
  const articleSlug = body.articleSlug ? String(body.articleSlug).trim() : undefined;
  if (!topicSlug && !seriesId && !articleSlug) {
    return NextResponse.json(
      { error: "Sebutkan topik, seri, atau artikel yang dipantau" },
      { status: 400 },
    );
  }

  try {
    const alert = await createAlert({
      trigger: trigger as (typeof ALERT_TRIGGERS)[number],
      topicSlug,
      seriesId,
      articleSlug,
    });
    return NextResponse.json({ ok: true, alert });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
