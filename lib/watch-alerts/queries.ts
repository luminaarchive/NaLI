import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AlertEvent, AlertTrigger, WatchAlert } from "./types";

/**
 * Query layer for Watch Alerts (Doctrine v2.1, Part 2).
 *
 * watch_alerts and alert_events are RLS service-role-only (internal signals, no
 * anon access), so these run with the service-role key, server-side only. When
 * the key is not configured the reads degrade to empty arrays and the writes
 * throw a clear error, so the public page never crashes. The founder sets
 * SUPABASE_SERVICE_ROLE_KEY in the server environment to activate it.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const watchAlertsEnabled = Boolean(url && serviceKey);

let client: SupabaseClient | null = null;
function db(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!client) client = createClient(url, serviceKey, { auth: { persistSession: false } });
  return client;
}

/* ---- row <-> domain mappers ---- */
function toAlert(r: Record<string, unknown>): WatchAlert {
  return {
    id: r.id as string,
    topicSlug: (r.topic_slug as string) ?? undefined,
    seriesId: (r.series_id as string) ?? undefined,
    articleSlug: (r.article_slug as string) ?? undefined,
    trigger: r.trigger_type as AlertTrigger,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at as string,
  };
}
function toEvent(r: Record<string, unknown>): AlertEvent {
  return {
    id: r.id as string,
    alertId: r.alert_id as string,
    trigger: r.trigger_type as AlertTrigger,
    payload: (r.payload as Record<string, unknown>) ?? {},
    createdAt: r.created_at as string,
    seen: Boolean(r.seen),
  };
}

export async function getActiveAlerts(): Promise<WatchAlert[]> {
  const c = db();
  if (!c) return [];
  const { data, error } = await c
    .from("watch_alerts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(toAlert);
}

export async function getUnseenAlertEvents(limit = 20): Promise<AlertEvent[]> {
  const c = db();
  if (!c) return [];
  const { data, error } = await c
    .from("alert_events")
    .select("*")
    .eq("seen", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(toEvent);
}

export async function getAlertHistory(alertId: string, limit = 50): Promise<AlertEvent[]> {
  const c = db();
  if (!c) return [];
  const { data, error } = await c
    .from("alert_events")
    .select("*")
    .eq("alert_id", alertId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(toEvent);
}

export async function createAlert(
  input: Omit<WatchAlert, "id" | "createdAt" | "isActive"> & { isActive?: boolean },
): Promise<WatchAlert> {
  const c = db();
  if (!c) throw new Error("watch-alerts service role not configured");
  const { data, error } = await c
    .from("watch_alerts")
    .insert({
      topic_slug: input.topicSlug ?? null,
      series_id: input.seriesId ?? null,
      article_slug: input.articleSlug ?? null,
      trigger_type: input.trigger,
      is_active: input.isActive ?? true,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "insert failed");
  return toAlert(data);
}

export async function markAlertEventSeen(eventId: string): Promise<void> {
  const c = db();
  if (!c) throw new Error("watch-alerts service role not configured");
  const { error } = await c.from("alert_events").update({ seen: true }).eq("id", eventId);
  if (error) throw new Error(error.message);
}

export async function markAllAlertEventsSeen(): Promise<void> {
  const c = db();
  if (!c) throw new Error("watch-alerts service role not configured");
  const { error } = await c.from("alert_events").update({ seen: true }).eq("seen", false);
  if (error) throw new Error(error.message);
}

export async function deleteAlert(alertId: string): Promise<void> {
  const c = db();
  if (!c) throw new Error("watch-alerts service role not configured");
  const { error } = await c.from("watch_alerts").delete().eq("id", alertId);
  if (error) throw new Error(error.message);
}
