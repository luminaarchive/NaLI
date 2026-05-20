import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { HomeCommandBox } from "@/components/report/HomeCommandBox";
import { HomepageShell } from "@/components/ui/HomepageShell";
import { NaLIIconTile } from "@/components/ui/NaLIIconTile";

const whatNaLIDoes = [
  {
    title: "Susun bahan",
    text: "Ubah catatan, lokasi, URL, atau ringkasan file menjadi struktur laporan.",
  },
  {
    title: "Buat draf atau panduan",
    text: "Punya bahan jadi draf. Belum punya bahan jadi panduan mulai.",
  },
  {
    title: "Tandai batas bukti",
    text: "NaLI menampilkan evidence table, uncertainty note, dan checklist review.",
  },
];

const safetyPoints = [
  "Tidak membuat sitasi palsu",
  "Tidak membuat data palsu",
  "Tidak menerima empty prompt untuk draf",
  "Output bukan karya final",
];

const pricingItems = [
  ["Preview Gratis", "Aktif sebagai preview draf/panduan awal."],
  ["One-Time Report", "Disiapkan untuk laporan sekali pakai setelah payment aktif."],
  ["Export Premium", "Dokumen lebih rapi, terkunci sampai payment aktif."],
  ["NaLI Energy nanti", "Untuk pemakaian lebih banyak setelah pola penggunaan jelas."],
];

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <HomepageShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />

      <main className="relative z-10 overflow-x-hidden">
        <section className="px-4 pt-24 pb-12 sm:px-6 md:pt-28 lg:px-8">
          <div className="mx-auto flex max-w-[920px] flex-col items-center text-center">
            <NaLIIconTile />
            <span className="mt-5 inline-flex rounded-md border border-[#DDD5C7] bg-white/70 px-3 py-1 text-xs font-semibold text-[#5F6B62]">
              NaLI Learn & Report
            </span>
            <h1 className="mt-5 max-w-[820px] text-[40px] font-semibold leading-[1.08] tracking-normal text-[#111814] sm:text-[56px] lg:text-[68px]">
              Ubah catatan menjadi laporan berbasis bukti.
            </h1>
            <p className="mt-5 max-w-[680px] text-base leading-7 text-[#5F6B62] sm:text-lg">
              NaLI membantu menyusun draf atau panduan awal tanpa mengarang data, sitasi, atau klaim.
            </p>

            <div className="mt-7 w-full">
              <HomeCommandBox />
            </div>

            <p className="mt-4 text-sm font-medium text-[#5F6B62]">
              NaLI menyusun, bukan mengarang. Validasi akhir tetap manusia.
            </p>
            <a className="mt-3 text-sm font-semibold text-[#173D2B] hover:underline" href="#cara-kerja">
              Lihat cara kerja
            </a>
          </div>

          <HeroPreview />
        </section>

        <section id="cara-kerja" className="border-y border-[#DDD5C7] bg-[#FCFAF4] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px]">
            <SectionHeading title="Apa yang NaLI lakukan?" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {whatNaLIDoes.map((item) => (
                <article className="rounded-lg border border-[#DDD5C7] bg-white p-5" key={item.title}>
                  <h3 className="text-lg font-semibold text-[#111814]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5F6B62]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px]">
            <SectionHeading title="Dua cara mulai" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <StartCard
                cta="Buat Draf"
                href="/create-report?mode=draft_from_materials"
                text="Tempel catatan, hasil praktikum, lokasi, URL, atau ringkasan file."
                title="Saya sudah punya bahan"
              />
              <StartCard
                cta="Buat Panduan"
                href="/create-report?mode=start_from_zero"
                text="NaLI bantu membuat outline, pertanyaan observasi, dan checklist bukti."
                title="Saya belum punya bahan"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#07100B] px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px]">
            <SectionHeading inverse title="Kenapa NaLI aman?" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {safetyPoints.map((point) => (
                <p className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/80" key={point}>
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#B9CBAA]" aria-hidden="true" />
                  <span>{point}</span>
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1040px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <SectionHeading title="Export premium" />
              <p className="mt-4 text-sm leading-7 text-[#5F6B62]">
                Preview bisa dibaca gratis. Export premium disiapkan untuk hasil yang lebih rapi saat payment aktif.
              </p>
              <span className="mt-4 inline-flex rounded-md border border-[#D8A033]/30 bg-[#FFF7DF] px-3 py-1.5 text-xs font-semibold text-[#7A520F]">
                Payment belum aktif di MVP ini.
              </span>
              <Link
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#173D2B] px-5 text-sm font-semibold text-white transition hover:bg-[#102F20]"
                href="/create-report"
              >
                Coba buat preview
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Layout laporan lebih rapi",
                "Evidence table ikut terbawa",
                "Disclaimer ikut terbawa",
                "Checklist review ikut terbawa",
                "Siap diedit sebelum dikumpulkan",
              ].map((item) => (
                <p className="flex gap-2 rounded-lg border border-[#DDD5C7] bg-white p-4 text-sm leading-6 text-[#5F6B62]" key={item}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#315F45]" aria-hidden="true" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#DDD5C7] bg-[#FCFAF4] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px]">
            <SectionHeading title="Harga Sprint 0" />
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {pricingItems.map(([title, text]) => (
                <article className="rounded-lg border border-[#DDD5C7] bg-white p-5" key={title}>
                  <h3 className="text-base font-semibold text-[#111814]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5F6B62]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[760px] text-center">
            <h2 className="text-3xl font-semibold text-[#111814]">Mulai dari satu catatan — atau mulai dari nol.</h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className="inline-flex h-11 items-center justify-center rounded-md bg-[#173D2B] px-5 text-sm font-semibold text-white" href="/create-report">
                Mulai Laporan
              </Link>
              <Link className="inline-flex h-11 items-center justify-center rounded-md border border-[#DDD5C7] bg-white/70 px-5 text-sm font-semibold text-[#173D2B]" href="/create-report?mode=start_from_zero">
                Buat Panduan
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#DDD5C7] bg-[#F5F1E8] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-5 text-sm md:flex-row md:items-center md:justify-between">
            <p className="font-medium text-[#5F6B62]">NaLI by NatIve · Asisten laporan berbasis bukti</p>
            <div className="flex flex-wrap gap-5 font-medium text-[#5F6B62]">
              <Link className="hover:text-[#111814]" href="/learn-report">
                Learn & Report
              </Link>
              <Link className="hover:text-[#111814]" href="/field-intelligence">
                Field Intelligence
              </Link>
              <Link className="hover:text-[#111814]" href="/pricing">
                Harga
              </Link>
              <Link className="hover:text-[#111814]" href="/create-report">
                Mulai Laporan
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </HomepageShell>
  );
}

function HeroPreview() {
  const flow = ["Bahan", "Struktur", "Evidence table", "Review", "Export"];

  return (
    <div className="mx-auto mt-9 max-w-[860px] rounded-lg border border-[#DDD5C7] bg-white/80 p-4 shadow-[0_18px_48px_rgba(17,24,20,0.08)] sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="text-left">
          <p className="text-xs font-semibold uppercase text-[#6F8057]">Preview alur</p>
          <h2 className="mt-2 text-xl font-semibold text-[#111814]">Contoh struktur</h2>
          <div className="mt-4 grid gap-2 text-sm text-[#5F6B62] sm:grid-cols-2">
            {["Draf laporan", "Evidence table", "Checklist bukti", "Review manusia"].map((item) => (
              <p className="flex gap-2" key={item}>
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#6F8057]" aria-hidden="true" />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
        <div className="w-full rounded-lg border border-[#DDD5C7] bg-[#FCFAF4] p-3 md:max-w-[360px]">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5F6B62]">
            {flow.map((item, index) => (
              <span className="inline-flex items-center gap-2" key={item}>
                <span
                  className={
                    index === flow.length - 1
                      ? "rounded-md border border-[#D8A033]/30 bg-[#FFF7DF] px-2 py-1 text-[#7A520F]"
                      : "rounded-md border border-[#DDD5C7] bg-white px-2 py-1"
                  }
                >
                  {index === flow.length - 1 ? "Export premium terkunci" : item}
                </span>
                {index < flow.length - 1 ? <ArrowRight className="h-3 w-3 text-[#9D9482]" aria-hidden="true" /> : null}
              </span>
            ))}
          </div>
          <p className="mt-3 flex gap-2 text-xs leading-5 text-[#5F6B62]">
            <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7A520F]" aria-hidden="true" />
            <span>Source verification belum aktif di MVP ini. URL pengguna dicatat sebagai bahan, belum diverifikasi otomatis.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ inverse = false, title }: { inverse?: boolean; title: string }) {
  return (
    <div>
      <h2 className={inverse ? "text-2xl font-semibold text-white sm:text-3xl" : "text-2xl font-semibold text-[#111814] sm:text-3xl"}>
        {title}
      </h2>
    </div>
  );
}

function StartCard({ cta, href, text, title }: { cta: string; href: string; text: string; title: string }) {
  return (
    <article className="rounded-lg border border-[#DDD5C7] bg-white p-5">
      <h3 className="text-xl font-semibold text-[#111814]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#5F6B62]">{text}</p>
      <Link className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#173D2B] px-4 text-sm font-semibold text-white" href={href}>
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
