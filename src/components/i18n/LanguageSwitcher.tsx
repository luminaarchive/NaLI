"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useTranslation();
  const nextLanguage = language === "en" ? "id" : "en";
  const label = language === "en" ? "EN" : "ID";

  return (
    <button
      aria-label={`${t("common.language")}: ${language === "en" ? t("common.english") : t("common.indonesian")}`}
      className={`inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-semibold tracking-[0.08em] uppercase text-white/60 transition hover:bg-white/[0.08] hover:text-white ${
        compact ? "px-2" : ""
      }`}
      onClick={() => setLanguage(nextLanguage)}
      type="button"
    >
      <Languages className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
