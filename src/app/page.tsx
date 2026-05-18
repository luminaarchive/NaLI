import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { HomeCommandBox } from "@/components/report/HomeCommandBox";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter, SiteNav } from "@/components/ui/SiteNav";
import { buildJsonLdGraph } from "@/lib/seo/site";

const workItems = [
  ["Susun bahan", "Catatan mentah dirapikan menjadi struktur laporan yang mudah diperiksa."],
  ["Buat struktur", "NaLI membuat draft atau panduan awal sesuai bahan yang tersedia."],
  ["Tandai batas bukti", "Evidence table, uncertainty note, dan review manusia tetap terlihat."],
];

const integrityItems = ["No fake citation", "No fake data", "No final homework", "Human review"];

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#111814]">
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />
      <SiteNav />

      <main>
        <section className="px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="max-w-[720px]">
              <Badge tone="green">NaLI Learn & Report</Badge>
              <h1 className="mt-6 text-[2.7rem] leading-[1.04] font-semibold tracking-[0] sm:text-6xl">
                Ubah catatan menjadi laporan berbasis bukti.
              </h1>
              <p className="mt-5 text-lg leading-8 text-[#5F6B62]">
                NaLI membantu menyusun draft atau panduan awal tanpa mengarang data, sitasi, atau klaim.
              </p>
              <p className="mt-5 text-sm font-semibold text-[#173D2B]">
                Draft berbasis bahan. Validasi akhir tetap manusia.
              </p>
            </div>

            <HomeCommandBox />
          </div>
        </section>

        <Section title="Apa yang NaLI lakukan">
          <div className="grid gap-6 md:grid-cols-3">
            {workItems.map(([title, text]) => (
              <article className="border-t border-[#DDD5C7] pt-5" key={title}>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#5F6B62]">{text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Dua cara mulai">
          <div className="grid gap-4 md:grid-cols-2">
            <PathCard
              cta="Buat Draf"
              href="/create-report"
              text="Untuk catatan, URL, lokasi, hasil praktikum, atau ringkasan file yang sudah kamu punya."
              title="Punya bahan"
            />
            <PathCard
              cta="Buat Panduan"
              href="/create-report?mode=start_from_zero"
              text="Untuk membuat outline, pertanyaan observasi, field note template, dan checklist bukti."
              title="Belum punya bahan"
            />
          </div>
        </Section>

        <Section title="Integritas tetap di depan">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {integrityItems.map((item) => (
              <div className="flex items-center gap-3 border-t border-[#DDD5C7] py-4" key={item}>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#173D2B]" aria-hidden="true" />
                <p className="text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </Section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-5 border-t border-[#DDD5C7] pt-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Beta pricing disiapkan bertahap.</h2>
              <p className="mt-2 text-sm leading-7 text-[#5F6B62]">
                Payment gateway belum aktif. Sprint 0 menyiapkan one-time report dan export gate secara jujur.
              </p>
            </div>
            <ButtonLink href="/pricing" variant="secondary">
              Lihat pricing
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1160px]">
        <h2 className="mb-8 text-3xl font-semibold tracking-[0]">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function PathCard({ cta, href, text, title }: { cta: string; href: string; text: string; title: string }) {
  return (
    <article className="rounded-lg border border-[#DDD5C7] bg-[#FCFAF4] p-5">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#5F6B62]">{text}</p>
      <ButtonLink className="mt-6" href={href}>
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </ButtonLink>
    </article>
  );
}
