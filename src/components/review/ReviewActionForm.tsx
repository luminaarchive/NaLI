"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function ReviewActionForm({ observationId }: { observationId: string }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");

  async function submit(action: "verify" | "request_clarification" | "reject") {
    setStatus(t("reviewQueue.saving"));
    const response = await fetch("/api/review/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observationId, action, reason }),
    });
    const body = await response.json();
    setStatus(response.ok ? t("reviewQueue.saved") : body.error || t("reviewQueue.failed"));
  }

  return (
    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <label
        className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30"
        htmlFor={`reason-${observationId}`}
      >
        {t("reviewQueue.reasonLabel")}
      </label>
      <textarea
        className="field-input mt-2 min-h-20 w-full resize-none"
        id={`reason-${observationId}`}
        onChange={(event) => setReason(event.target.value)}
        value={reason}
      />
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <button
          className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#09090b]"
          onClick={() => submit("verify")}
          type="button"
        >
          {t("reviewQueue.verify")}
        </button>
        <button
          className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08]"
          onClick={() => submit("request_clarification")}
          type="button"
        >
          {t("reviewQueue.clarify")}
        </button>
        <button
          className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300"
          onClick={() => submit("reject")}
          type="button"
        >
          {t("reviewQueue.reject")}
        </button>
      </div>
      {status ? <p className="mt-3 text-sm text-white/50">{status}</p> : null}
    </div>
  );
}
