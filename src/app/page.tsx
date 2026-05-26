import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileText, FlaskConical, Leaf, ShieldCheck } from "lucide-react";
import { HomeQueryBox } from "@/components/report/HomeQueryBox";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { REPORT_PACKAGES } from "@/lib/billing/reportPackages";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: siteMetadata.routes.home.title,
  description: siteMetadata.routes.home.description,
  alternates: {
    canonical: siteMetadata.canonicalBase,
  },
};

const reportExamples = [
  {
    copy: "Catatan lokasi, kondisi, dan temuan lapangan.",
    icon: Leaf,
    title: "Observasi lingkungan",
  },
  {
    copy: "Tujuan, hasil pengamatan, dan batas interpretasi.",
    icon: FlaskConical,
    title: "Praktikum biologi",
  },
  {
    copy: "Kegiatan, capaian, dan bukti yang perlu dilengkapi.",
    icon: FileText,
    title: "Laporan KKN",
  },
] as const;

const steps = [
  "Isi konteks atau catatan yang benar-benar kamu punya.",
  "NaLI menyusun draft dengan struktur yang mudah diedit.",
  "Cek batas bukti sebelum memakai dokumen akhir.",
] as const;

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <PublicAppShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />
      <main>
        <section className="px-4 pt-12 pb-10 sm:px-6 sm:pt-16">
          <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
            <p className="rounded-full border border-[#d4decd] bg-[#eef2e8] px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-[#315f45] uppercase">
              NaLI Learn &amp; Report
            </p>
            <h1 className="mt-6 text-[40px] leading-[1.12] font-semibold text-[#10231b] sm:text-[56px]">
              Mau bikin laporan apa?
            </h1>
            <p className="mt-4 max-w-[610px] text-[16px] leading-7 text-[#536259] sm:text-[18px]">
              NaLI membantu menyusun draft laporan observasi, praktikum, dan KKN dengan batas bukti yang jelas.
            </p>
            <p className="mt-2 max-w-[570px] text-sm leading-6 text-[#6a756e]">
              Bukti yang belum tersedia tetap ditandai, bukan dibuat-buat.
            </p>

            <HomeQueryBox />

            <div className="mt-7 flex w-full flex-wrap justify-center gap-2 text-xs text-[#536259]" id="status">
              {[
                "CP1: pembayaran belum aktif",
                "Upload belum aktif",
                "Source verification belum aktif",
                "Batas bukti ditampilkan",
              ].map((status) => (
                <span className="rounded-md border border-[#e2dccf] bg-white/65 px-3 py-2" key={status}>
                  {status}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#e7e1d5] bg-white/45 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-[980px]">
            <h2 className="text-center text-2xl font-semibold text-[#10231b]">Apa yang bisa dibuat?</h2>
            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {reportExamples.map(({ copy, icon: Icon, title }) => (
                <article className="rounded-md border border-[#e7e1d5] bg-[#fffdf8] p-5" key={title}>
                  <Icon aria-hidden="true" className="h-5 w-5 text-[#315f45]" />
                  <h3 className="mt-4 font-semibold text-[#10231b]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#536259]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-11 sm:px-6">
          <div className="mx-auto grid max-w-[980px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-[#10231b]">Cara kerja singkat</h2>
              <ol className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <li className="flex gap-3 text-sm leading-6 text-[#536259]" key={step}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#315f45] text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-7 flex items-start gap-3 rounded-md border border-[#d4decd] bg-[#eef2e8] p-4 text-sm leading-6 text-[#315f45]">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                <p>NaLI tidak membuat data atau sitasi palsu. AI inference bukan bukti lapangan.</p>
              </div>
            </div>

            <div className="rounded-md border border-[#e7e1d5] bg-white/60 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-[#536259] uppercase">
                    Harga persiapan CP1
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-[#10231b]">Paket Laporan</h2>
                </div>
                <ClipboardCheck aria-hidden="true" className="h-6 w-6 text-[#315f45]" />
              </div>
              <div className="mt-5 divide-y divide-[#e7e1d5]">
                {REPORT_PACKAGES.map((reportPackage) => (
                  <div className="flex items-center justify-between gap-4 py-3" key={reportPackage.id}>
                    <div>
                      <p className="text-sm font-semibold text-[#10231b]">{reportPackage.label}</p>
                      <p className="text-xs text-[#536259]">{reportPackage.publicCopy}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#315f45]">
                      Rp{new Intl.NumberFormat("id-ID").format(reportPackage.priceIdr)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-[#6a756e]">
                Pembayaran dan checkout belum aktif di CP1. Tidak ada saldo laporan berbayar yang diberikan sekarang.
              </p>
              <Link
                className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[#d4decd] px-4 text-sm font-semibold text-[#315f45] transition-colors hover:bg-[#eef2e8]"
                href="/pricing"
              >
                Lihat Harga
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
