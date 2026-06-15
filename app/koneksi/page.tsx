import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getMasterRelasi } from "@/lib/relations";

export const metadata: Metadata = {
  title: "Koneksi",
  description:
    "Everything connects. Entitas yang paling banyak menautkan artikel, sumber, seri, dan topik di NaLI, dihitung dari graf pengetahuan yang sama.",
  alternates: { canonical: "/koneksi" },
  openGraph: {
    title: "Koneksi | NaLI by NatIve",
    description: "Entitas paling terhubung di basis pengetahuan NaLI.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const TYPE_LABEL = {
  artikel: "Artikel",
  sumber: "Sumber",
  seri: "Seri",
  topik: "Topik",
} as const;

export default async function KoneksiPage() {
  const relasi = await getMasterRelasi();

  return (
    <div className="theme-arsip relative">
      <PageHeader
        eyebrow="Modul 11"
        title="Koneksi"
        description="Everything connects. Inilah simpul yang paling banyak mengikat tulisan, sumber, seri, dan topik menjadi satu jaringan, bukan tumpukan halaman terpisah."
      />

      <div className="container-editorial py-12 sm:py-16">
        <ol className="space-y-3">
          {relasi.map((r, i) => {
            const Inner = (
              <div className="flex items-start justify-between gap-4 border border-dashed border-ink/40 p-4 transition-colors hover:bg-ink-wash">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[0.72rem] tabular-nums text-gray">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="label text-ink/60">{TYPE_LABEL[r.type]}</span>
                  </div>
                  <p className="mt-1 truncate font-display text-lg text-ink-black">
                    {r.entitasUtama}
                  </p>
                  <p className="mt-1 font-mono text-[0.72rem] text-gray">
                    {[
                      r.terhubungDengan.artikel && `${r.terhubungDengan.artikel} artikel`,
                      r.terhubungDengan.sumber && `${r.terhubungDengan.sumber} sumber`,
                      r.terhubungDengan.seri && `${r.terhubungDengan.seri} seri`,
                      r.terhubungDengan.topik && `${r.terhubungDengan.topik} topik`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-2xl font-bold tabular-nums text-ink">
                  {r.total}
                </span>
              </div>
            );
            return (
              <li key={r.id}>
                {r.href ? <Link href={r.href}>{Inner}</Link> : Inner}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
