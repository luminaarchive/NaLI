import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, Compass, ShieldCheck, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteNav";
import { LearnReportShell } from "@/components/ui/LearnReportShell";

const users = ["Siswa", "Mahasiswa", "Guru", "Komunitas alam", "Staf lapangan", "NGO/CSR junior"];

const helps = [
  "Laporan observasi",
  "Laporan praktikum",
  "Field trip",
  "KKN lingkungan",
  "Survei flora/fauna dasar",
  "Panduan mulai",
];

export default function LearnReportPage() {
  return (
    <LearnReportShell>
      <main className="relative z-10">
        <section className="px-4 pt-28 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[860px] text-center">
            <Badge tone="green">NaLI Learn & Report</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[#111814] sm:text-5xl">
              NaLI Learn & Report
            </h1>
            <p className="mx-auto mt-5 max-w-[640px] text-base leading-7 text-[#5F6B62] sm:text-lg">
              Untuk menyusun laporan sains, lingkungan, praktikum, field trip, dan observasi dari bahan yang kamu punya.
            </p>
            <p className="mx-auto mt-2 max-w-[640px] text-sm leading-6 text-[#5F6B62]">
              Kalau belum punya bahan, NaLI membantu membuat panduan mulai.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/create-report">
                Mulai Laporan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/create-report?mode=start_from_zero" variant="glass">
                Buat Panduan
              </ButtonLink>
            </div>
          </div>
        </section>

        <ShortSection title="Untuk siapa">
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <Badge className="min-h-9 px-4 text-sm" key={user} tone="glass">
                {user}
              </Badge>
            ))}
          </div>
        </ShortSection>

        <ShortSection title="Bisa membantu apa">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {helps.map((item) => (
              <p className="flex gap-2 rounded-lg border border-[#DDD5C7] bg-white p-4 text-sm font-semibold leading-6 text-[#5F6B62]" key={item}>
                <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-[#6F8057]" aria-hidden="true" />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </ShortSection>

        <ShortSection title="Dua cara mulai">
          <div className="grid gap-4 md:grid-cols-2">
            <PathCard
              cta="Buat Draf"
              href="/create-report?mode=draft_from_materials"
              icon={ClipboardList}
              text="Tempel catatan, hasil praktikum, lokasi, URL, atau ringkasan file."
              title="Saya sudah punya bahan"
            />
            <PathCard
              cta="Buat Panduan"
              href="/create-report?mode=start_from_zero"
              icon={Compass}
              text="NaLI bantu membuat outline, pertanyaan observasi, dan checklist bukti."
              title="Saya belum punya bahan"
            />
          </div>
        </ShortSection>

        <section className="bg-[#07100B] px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[900px]">
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <ShieldCheck className="h-6 w-6 text-[#B9CBAA]" aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-semibold">Batasan integritas</h2>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  NaLI tidak membuat data palsu, tidak membuat sitasi palsu, dan tidak menggantikan tanggung jawab akademik.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Bukan karya final", "Tidak membuat sitasi palsu", "Tidak membuat data palsu", "Review manusia wajib"].map((item) => (
                  <p className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/80" key={item}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B9CBAA]" aria-hidden="true" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[720px] text-center">
            <h2 className="text-3xl font-semibold text-[#111814]">Mulai dari bahan yang kamu punya.</h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/create-report">Mulai Laporan</ButtonLink>
              <ButtonLink href="/create-report?mode=start_from_zero" variant="glass">
                Buat Panduan
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </LearnReportShell>
  );
}

function ShortSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="border-t border-[#DDD5C7] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[900px]">
        <h2 className="mb-6 text-2xl font-semibold text-[#111814]">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function PathCard({
  cta,
  href,
  icon: Icon,
  text,
  title,
}: {
  cta: string;
  href: string;
  icon: LucideIcon;
  text: string;
  title: string;
}) {
  return (
    <article className="rounded-lg border border-[#DDD5C7] bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#DDD5C7] bg-[#FCFAF4]">
        <Icon className="h-5 w-5 text-[#6F8057]" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-[#111814]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#5F6B62]">{text}</p>
      <ButtonLink className="mt-5" href={href}>
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </ButtonLink>
    </article>
  );
}
