import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileText,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SiteFooter, SiteNav } from "@/components/ui/SiteNav";

const users = ["siswa SMP/SMA", "mahasiswa", "guru/dosen muda", "pekerja lapangan", "NGO/CSR junior", "peneliti junior", "komunitas alam"];
const outputs = [
  "laporan praktikum",
  "laporan observasi lingkungan",
  "laporan field trip",
  "laporan kegiatan proyek",
  "panduan observasi awal",
  "evidence checklist",
  "draft berbasis bahan",
];

export default function LearnReportPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <SiteNav />
      <main>
        <section className="border-b border-stone-200 bg-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <Badge tone="green">Public Mode</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-[0] sm:text-5xl">NaLI Learn & Report</h1>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-forest-800">
              Untuk menyusun laporan sains, lingkungan, dan observasi dari bahan yang kamu punya — atau membantumu
              mulai ketika belum punya bahan.
            </p>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <PathCard
                cta="Buat Draf"
                href="/create-report"
                icon={ClipboardList}
                title="Saya sudah punya bahan"
                text="Masukkan catatan, URL, lokasi, hasil praktikum, atau field note. NaLI menyusun draft berbasis bahan."
              />
              <PathCard
                cta="Mulai dari Nol"
                href="/create-report?mode=start_from_zero"
                icon={Compass}
                title="Saya belum punya bahan"
                text="NaLI membuat panduan observasi, checklist bukti, source search checklist, dan outline awal."
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">Untuk siapa</p>
              <h2 className="mt-3 text-3xl font-semibold">Dibuat untuk pengguna yang perlu laporan rapi.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <Badge className="min-h-10 px-4 text-sm" key={user} tone="paper">
                  {user}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-stone-200 bg-stone-100 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">Output</p>
            <h2 className="mt-3 max-w-[720px] text-3xl font-semibold">Yang bisa dibuat NaLI tanpa melampaui bukti.</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {outputs.map((item) => (
                <Card className="p-4" key={item}>
                  <FileText className="h-5 w-5 text-olive-700" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold leading-6">{item}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px] rounded-lg border border-forest-900/10 bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <ShieldCheck className="h-6 w-6 text-olive-700" aria-hidden="true" />
                <h2 className="mt-4 text-3xl font-semibold">Integritas akademik tetap di depan.</h2>
                <p className="mt-3 text-sm leading-7 text-forest-700">
                  NaLI bukan alat untuk membuat karya final tanpa review. Semua hasil harus diperiksa manusia.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Bukan karya final", "Tidak membuat sitasi palsu", "Tidak membuat data palsu", "Human review wajib"].map((item) => (
                  <p className="flex gap-2 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm font-semibold leading-6" key={item}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" aria-hidden="true" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/create-report">Buat Draf</ButtonLink>
              <ButtonLink href="/create-report?mode=start_from_zero" variant="secondary">
                Mulai dari Nol
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
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
    <Card className="p-5">
      <Icon className="h-6 w-6 text-olive-700" aria-hidden="true" />
      <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-forest-700">{text}</p>
      <ButtonLink className="mt-5" href={href}>
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </ButtonLink>
    </Card>
  );
}
