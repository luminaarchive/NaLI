import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AlertTrigger } from "./types";

/**
 * Emit an alert event for a watched interest (Doctrine v2.1, Phase 4).
 *
 * Call this when evidence around a watched entity changes, for example after an
 * article's lastChecked date moves, a claim status is upgraded/downgraded, a new
 * OA source is harvested for a topic, or a new article joins a series.
 *
 * Writing to alert_events requires the service role (RLS allows no anon write),
 * so this runs server-side in trusted contexts (route handlers / jobs). It fails
 * soft: a logging failure must never break the publish path.
 */
export async function emitAlertEvent(
  alertId: string,
  trigger: AlertTrigger,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    const sb = createSupabaseServerClient();
    const { error } = await sb.from("alert_events").insert({
      alert_id: alertId,
      trigger_type: trigger,
      payload,
      seen: false,
    });
    if (error) {
      console.warn(`[watch-alerts] failed to emit ${trigger} for ${alertId}: ${error.message}`);
    }
  } catch (e) {
    console.warn(`[watch-alerts] emit threw: ${(e as Error).message}`);
  }
}
