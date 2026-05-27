"use client";

import { ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";

const items = ["observations", "coordinates", "media", "exports"];

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <PublicAppShell>
      <main className="flex-1 bg-[#060b08] text-[#f5f0e8]">
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex justify-end">
            <LanguageSwitcher compact />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#00FFB3]">{t("privacyPage.eyebrow")}</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-[#f5f0e8]">{t("privacyPage.title")}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#a1b3a8]">{t("privacyPage.context")}</p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <article className="rounded-2xl border border-[#14261c] bg-[#08100c] p-5" key={item}>
                <ShieldCheck className="mb-4 h-5 w-5 text-[#00FFB3]/70" />
                <p className="text-sm leading-6 text-[#a1b3a8]">{t(`privacyPage.items.${item}`)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
