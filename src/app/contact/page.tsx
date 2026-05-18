"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link className="flex items-center gap-2" href="/">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-xs font-bold text-white">
              N
            </span>
            <span className="text-sm font-semibold">NaLI</span>
          </Link>
          <LanguageSwitcher compact />
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">{t("contactPage.eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">{t("contactPage.title")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/50">{t("contactPage.context")}</p>
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-indigo-400/60" />
            <p className="text-sm leading-6 text-white/60">{t("contactPage.note")}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
