import Link from "next/link";
import Image from "next/image";
import { Network, Clock, Archive, Layers, ArrowUpRight } from "lucide-react";
import type { ArticleMeta } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

function cover(a: ArticleMeta): string | undefined {
  return a.coverImage ?? a.images?.[0]?.src;
}

const DESTINATIONS = [
  { href: "/peta-eksplorasi", icon: Network, title: "Peta eksplorasi", body: "Lihat bagaimana tiap tulisan, sumber, dan topik saling terhubung." },
  { href: "/linimasa", icon: Clock, title: "Linimasa", body: "Susun peristiwa menurut tahun, dari letusan purba sampai kebijakan terbaru." },
  { href: "/arsip-sumber", icon: Archive, title: "Arsip sumber", body: "Telusuri jurnal, arsip, dan laporan yang jadi dasar tiap klaim." },
  { href: "/seri", icon: Layers, title: "Seri", body: "Ikuti satu benang merah dari awal sampai tuntas." },
];

/**
 * The "do not stop here" block at the foot of every article: one surprising
 * jump-off plus the structural ways into the rest of NaLI, so the reader always
 * has a next door to open instead of a dead end.
 */
export function RabbitHole({ surprise }: { surprise?: ArticleMeta }) {
  const img = surprise ? cover(surprise) : undefined;
  return (
    <section className="border-t border-dashed border-ink/40 bg-ink-wash/30">
      <div className="container-editorial py-14">
        <h2 className="font-display text-2xl font-bold uppercase text-ink">
          Lanjutkan eksplorasi
        </h2>
        <p className="mt-2 max-w-xl font-mono text-[0.8rem] leading-relaxed text-gray">
          Satu tulisan jarang berdiri sendiri. Ini beberapa pintu berikutnya.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {surprise ? (
            <Link
              href={`/articles/${surprise.slug}`}
              className="group relative flex flex-col overflow-hidden border border-dashed border-ink/60 bg-paper transition-colors hover:bg-ink-wash"
            >
              {img ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-dashed border-ink/40">
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-deep">
                  Coba sudut lain
                </p>
                <h3 className="mt-2 font-display text-xl font-bold uppercase leading-snug text-ink group-hover:underline group-hover:underline-offset-4">
                  {surprise.title}
                </h3>
                {surprise.subtitle ? (
                  <p className="mt-2 line-clamp-2 font-mono text-[0.8rem] leading-relaxed text-ink-charcoal">
                    {surprise.subtitle}
                  </p>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-2 pt-4 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-gray">
                  <span>
                    {CATEGORY_LABEL[surprise.category]} · {surprise.readingMinutes} mnt
                  </span>
                  <ConfidenceBadge confidence={surprise.confidence} size="sm" />
                </div>
              </div>
            </Link>
          ) : null}

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {DESTINATIONS.map(({ href, icon: Icon, title, body }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-start gap-3 border border-dashed border-ink/50 bg-paper p-4 transition-colors hover:bg-ink-wash"
                >
                  <Icon size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-deep" aria-hidden />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-bold uppercase tracking-tight text-ink">
                        {title}
                      </span>
                      <ArrowUpRight size={14} strokeWidth={1.6} className="text-gray transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                    </span>
                    <span className="mt-1 block font-mono text-[0.74rem] leading-relaxed text-gray">
                      {body}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
