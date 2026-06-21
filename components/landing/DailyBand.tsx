import Link from "next/link";
import { CalendarDays, Sparkles, CircleHelp, History } from "lucide-react";
import type { DailyDigest } from "@/lib/daily";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { confidenceLabel } from "@/lib/labels";

function today(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * "Hari Ini di NaLI": a daily reason to come back, built only from real content.
 * The "on this day" cell appears only when today truly matches a dated event; the
 * rest rotate deterministically per day. Everything links to its sourced article.
 */
export function DailyBand({ daily }: { daily: DailyDigest }) {
  const { anniversary, sorotan, fakta, pertanyaan } = daily;
  return (
    <section className="relative z-20 w-full border-y border-dashed border-ink/30 bg-ink-wash/40 py-16 md:py-20">
      <div className="mx-auto max-w-[1240px] px-5">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-deep">
              Hari Ini di NaLI
            </p>
            <h2 className="mt-3 font-display text-[2rem] font-medium leading-[1.1] tracking-tight text-ink-black md:text-[2.75rem]">
              Selalu ada yang baru hari ini.
            </h2>
          </div>
          <p className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-gray">
            <CalendarDays size={14} strokeWidth={1.7} aria-hidden />
            {today()}
          </p>
        </header>

        {anniversary ? (
          <Link
            href={`/articles/${anniversary.slug}`}
            className="group mb-5 block border border-dashed border-ink/60 bg-paper p-5 transition-colors hover:bg-ink-wash md:p-6"
          >
            <p className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink-deep">
              <History size={13} strokeWidth={1.8} aria-hidden />
              Hari ini dalam sejarah · {anniversary.year}
            </p>
            <p className="mt-2 font-display text-lg font-medium leading-snug text-ink-black md:text-xl">
              {anniversary.peristiwa}
            </p>
            <span className="mt-2 inline-block font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink group-hover:underline group-hover:underline-offset-4">
              Baca selengkapnya
            </span>
          </Link>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          {sorotan ? (
            <DailyCell
              icon={<Sparkles size={13} strokeWidth={1.8} aria-hidden />}
              eyebrow="Sorotan hari ini"
              href={`/articles/${sorotan.slug}`}
              title={sorotan.title}
              body={sorotan.subtitle || sorotan.summary}
              confidence={confidenceLabel(sorotan.confidence)}
              confidenceNode={<ConfidenceBadge confidence={sorotan.confidence} size="sm" />}
            />
          ) : null}

          {fakta ? (
            <DailyCell
              icon={<Sparkles size={13} strokeWidth={1.8} aria-hidden />}
              eyebrow="Fakta terverifikasi"
              href={`/articles/${fakta.slug}`}
              title={fakta.fakta}
              body={fakta.article ? fakta.article.title : "Buka sumbernya"}
              confidence={confidenceLabel(fakta.confidence)}
              confidenceNode={<ConfidenceBadge confidence={fakta.confidence} size="sm" />}
            />
          ) : null}

          {pertanyaan ? (
            <DailyCell
              icon={<CircleHelp size={13} strokeWidth={1.8} aria-hidden />}
              eyebrow="Pertanyaan terbuka"
              href={`/articles/${pertanyaan.slug}`}
              title={pertanyaan.title}
              body={pertanyaan.subtitle || pertanyaan.summary}
              confidence={confidenceLabel(pertanyaan.confidence)}
              confidenceNode={<ConfidenceBadge confidence={pertanyaan.confidence} size="sm" />}
            />
          ) : null}
        </div>

        <p className="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-gray-light">
          Berubah setiap hari. Tiap butir membawa sumber dan label keyakinannya sendiri.
        </p>
      </div>
    </section>
  );
}

function DailyCell({
  icon,
  eyebrow,
  href,
  title,
  body,
  confidenceNode,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  href: string;
  title: string;
  body: string;
  confidence: string;
  confidenceNode: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col border border-dashed border-ink/50 bg-paper p-5 transition-colors hover:bg-ink-wash"
    >
      <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-deep">
        {icon}
        {eyebrow}
      </p>
      <p className="mt-3 line-clamp-4 font-display text-base font-semibold leading-snug text-ink-black group-hover:underline group-hover:underline-offset-4">
        {title}
      </p>
      <p className="mt-2 line-clamp-2 flex-1 font-mono text-[0.74rem] leading-relaxed text-gray">
        {body}
      </p>
      <div className="mt-4 border-t border-dashed border-ink/30 pt-3">{confidenceNode}</div>
    </Link>
  );
}
