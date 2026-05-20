import { CheckCircle2, Clock3, FileText, LockKeyhole, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteNav";
import { PricingShell } from "@/components/ui/PricingShell";

const plans = [
  {
    icon: FileText,
    name: "Preview Gratis",
    status: "Aktif sebagai preview",
    text: "Buat draf/panduan awal, evidence table, uncertainty note, dan checklist review.",
  },
  {
    icon: CheckCircle2,
    name: "One-Time Report",
    status: "Segera setelah payment aktif",
    text: "Untuk laporan sekali pakai seperti observasi, praktikum, field trip, atau kegiatan lingkungan.",
  },
  {
    icon: LockKeyhole,
    name: "Export Premium",
    status: "Terkunci sampai payment aktif",
    text: "Export Markdown/PDF nanti dengan evidence table, disclaimer, dan checklist review ikut terbawa.",
  },
  {
    icon: Zap,
    name: "NaLI Energy Pack",
    status: "Disiapkan",
    text: "Untuk pemakaian lebih banyak nanti, setelah pola penggunaan Sprint 0 terbukti.",
  },
  {
    icon: Clock3,
    name: "Student/Scholar Later",
    status: "Setelah one-time/export terbukti",
    text: "Bukan fokus utama Sprint 0. Paket belajar lanjutan akan diputuskan setelah sinyal produk jelas.",
  },
];

export default function PricingPage() {
  return (
    <PricingShell>
      <main className="relative z-10">
        <section className="border-b border-[#DDD5C7] px-4 pt-28 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[980px]">
            <Badge tone="green">Harga Sprint 0</Badge>
            <h1 className="mt-4 max-w-[760px] text-4xl font-semibold tracking-normal text-[#111814] sm:text-5xl">
              Harga Sprint 0
            </h1>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-[#5F6B62]">
              Mulai dari preview gratis. Export dan laporan berbayar akan dibuka bertahap setelah payment aktif.
            </p>
            <div className="mt-6">
              <Badge tone="amber" className="px-4 py-2 text-sm">
                Payment gateway belum aktif di MVP ini.
              </Badge>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1180px] gap-4 md:grid-cols-2 lg:grid-cols-5">
            {plans.map((plan) => {
              const Icon = plan.icon;

              return (
                <article className="flex flex-col rounded-lg border border-[#DDD5C7] bg-white p-5" key={plan.name}>
                  <Icon className="h-5 w-5 text-[#6F8057]" aria-hidden="true" />
                  <h2 className="mt-4 text-xl font-semibold text-[#111814]">{plan.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#5F6B62]">{plan.text}</p>
                  <div className="mt-auto pt-5">
                    <Badge tone={plan.name === "Preview Gratis" ? "green" : "glass"}>{plan.status}</Badge>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-[#DDD5C7] bg-[#FCFAF4] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1040px] gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-3xl font-semibold text-[#111814]">Nilai utama: preview jelas, export rapi nanti.</h2>
              <p className="mt-4 text-sm leading-7 text-[#5F6B62]">
                Preview gratis membantu pengguna memeriksa struktur dan batas bukti. Export premium disiapkan untuk dokumen yang lebih rapi saat payment aktif.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Evidence table ikut terbawa", "Disclaimer tetap ada", "Checklist review ikut terbawa", "Siap diedit sebelum dikumpulkan"].map((item) => (
                <p className="flex gap-2 rounded-lg border border-[#DDD5C7] bg-white p-4 text-sm leading-6 text-[#5F6B62]" key={item}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#315F45]" aria-hidden="true" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1040px] gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-[#111814]">Coba preview dulu.</h2>
              <p className="mt-3 max-w-[680px] text-sm leading-7 text-[#5F6B62]">
                Sprint 0 memvalidasi apakah NaLI membantu dari satu catatan atau dari nol tanpa mengarang data.
              </p>
            </div>
            <ButtonLink href="/create-report">Mulai Laporan</ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PricingShell>
  );
}
