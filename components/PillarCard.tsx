import Link from "next/link";
import { PILLARS } from "@/lib/site";

export function PillarCard({ pillar }: { pillar: (typeof PILLARS)[number] }) {
  return (
    <Link
      href={pillar.href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-rule bg-white p-7 transition-all hover:-translate-y-1 hover:border-teal hover:shadow-[0_18px_40px_-24px_rgba(27,168,130,0.5)]"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-bg opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative">
        <span className="font-mono text-sm text-teal-dark">{pillar.index}</span>
        <h3 className="mt-3 font-display text-3xl text-ink-black">{pillar.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-gray">{pillar.blurb}</p>
      </div>
      <span className="label relative mt-8 inline-flex items-center gap-2 text-ink-black transition-transform group-hover:translate-x-1">
        Jelajahi <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
