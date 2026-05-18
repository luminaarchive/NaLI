"use client";

import { FileText, MessageCircle } from "lucide-react";
import jsPDF from "jspdf";
import type { PatrolPriority } from "@/lib/patrol-planner";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { buildWhatsAppShareUrl } from "@/lib/share/whatsapp";

export function PatrolPlanExport({ priorities }: { priorities: PatrolPriority[] }) {
  const { t } = useTranslation();
  const text = priorities
    .map(
      (priority, index) =>
        `${index + 1}. ${priority.targetArea}\n${t("patrolPlan.reason")}: ${priority.reason}\n${t(
          "patrolPlan.window",
        )}: ${priority.bestTimeWindow}\n${t("patrolPlan.caution")}: ${priority.cautionNotes}`,
    )
    .join("\n\n");

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(t("patrolPlan.pdfTitle"), 14, 16);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(text, 180), 14, 28);
    doc.save("nali-patrol-plan.pdf");
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <a
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08]"
        href={buildWhatsAppShareUrl("patrol_plan", text)}
        rel="noreferrer"
        target="_blank"
      >
        <MessageCircle className="h-4 w-4" />
        {t("patrolPlan.whatsapp")}
      </a>
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#09090b]"
        onClick={exportPdf}
        type="button"
      >
        <FileText className="h-4 w-4" />
        {t("patrolPlan.exportPdf")}
      </button>
    </div>
  );
}
