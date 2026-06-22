/**
 * Watch Alerts foundation (Doctrine v2.1, Phase 4; Axiom 08, build systems).
 *
 * Data layer only. Lets the system record interest in a topic / series / article
 * and emit events when evidence around it changes (a new OA source, a claim
 * status change, an article update, a new series entry). No UI is changed here.
 */

export type AlertTrigger =
  | "new-source-on-topic"
  | "claim-status-changed"
  | "article-updated"
  | "series-new-article";

export interface WatchAlert {
  id: string;
  userId?: string; // optional, NaLI is currently solo
  topicSlug?: string;
  seriesId?: string;
  articleSlug?: string;
  trigger: AlertTrigger;
  isActive: boolean;
  createdAt: string;
}

export interface AlertEvent {
  id: string;
  alertId: string;
  trigger: AlertTrigger;
  payload: Record<string, unknown>;
  createdAt: string;
  seen: boolean;
}

export const ALERT_TRIGGERS: AlertTrigger[] = [
  "new-source-on-topic",
  "claim-status-changed",
  "article-updated",
  "series-new-article",
];
