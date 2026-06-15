import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { getAllArticles } from "@/lib/content";
import { CONFIDENCE_LABEL, type Confidence } from "@/lib/types";

export const metadata: Metadata = {
  title: "Bukti Dicari",
  description:
    "Transparansi terbalik: daftar tulisan yang jangkar buktinya masih belum kuat, lengkap dengan batasan yang kami akui sendiri. Bantu kami menutupnya.",
  alternates: { canonical: "/bukti-dicari" },
  openGraph: {
    title: "Bukti Dicari | NaLI by NatIve",
    description:
      "Tulisan NaLI yang buktinya masih perlu diperkuat, beserta batasannya yang kami akui terbuka.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

// Weakest first: needs-verification, low, medium. "high" is excluded.
const ORDER: Confidence[] = ["needs-verification", "low", "medium"];

export default async function BuktiDicariPage() {
  const articles = await getAllArticles();
  const wanted = articles
    .filter((a) => a.confidence !== "high")
    .sort((a, b) => ORDER.indexOf(a.confidence) - ORDER.indexOf(b.confidence));

  return (
    <div className="theme-investigasi relative">
      <PageHeader
        eyebrow="Modul 6"
        title="Bukti Dicari"
        description="Kami tidak menyembunyikan yang masih lemah. Ini tulisan yang labelnya belum terverifikasi kuat, dengan batasan yang kami catat sendiri secara jujur."
      />

      <div className="container-editorial py-12 sm:py-16">
        <p className="mb-8 max-w-2xl font-mono text-[0.82rem] leading-relaxed text-gray">
          Punya arsip, foto, peta lama, atau dokumen yang bisa memperkuat atau justru
          membantah salah satu poin di bawah? Kirim lewat{" "}
          <Link href="/koreksi" className="text-ink underline-offset-2 hover:underline">
            halaman koreksi
          </Link>
          . Setiap masukan ditinjau sebelum dipakai.
        </p>

        {wanted.length === 0 ? (
          <p className="font-mono text-sm text-gray">
            Semua tulisan saat ini sudah terverifikasi kuat.
          </p>
        ) : (
          <ul className="space-y-6">
            {wanted.map((a) => (
              <li key={a.slug} className="border border-dashed border-ink/40 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <ConfidenceBadge confidence={a.confidence} />
                  <span className="label text-ink/60">{CONFIDENCE_LABEL[a.confidence]}</span>
                </div>
                <Link
                  href={`/articles/${a.slug}`}
                  className="mt-3 block font-display text-xl leading-tight text-ink-black transition-colors hover:text-ink-deep"
                >
                  {a.title}
                </Link>
                {Array.isArray(a.limitations) && a.limitations.length > 0 && (
                  <div className="mt-4">
                    <p className="label text-ink/70">Yang masih kurang</p>
                    <ul className="mt-2 space-y-2">
                      {a.limitations.map((lim, i) => (
                        <li
                          key={i}
                          className="font-mono text-[0.8rem] leading-relaxed text-gray"
                        >
                          <span className="text-ink" aria-hidden>
                            ?{" "}
                          </span>
                          {lim}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
