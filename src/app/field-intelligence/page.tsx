import {
  Archive,
  ClipboardCheck,
  Database,
  FileCheck2,
  Fingerprint,
  Layers3,
  Map,
  Route,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { AuroraMesh } from "@/components/ui/AuroraMesh";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SiteFooter, SiteNav } from "@/components/ui/SiteNav";

const capabilities = [
  {
    icon: Database,
    title: "Observation Memory",
    text: "Riwayat observasi, bahan, status review, dan perubahan catatan untuk kerja lapangan yang dapat diaudit.",
  },
  {
    icon: Fingerprint,
    title: "Evidence Hash",
    text: "Digital integrity marker untuk membantu menandai integritas berkas, bukan bukti hukum atau validasi akademik otomatis.",
  },
  {
    icon: ClipboardCheck,
    title: "Review Queue",
    text: "Alur pemeriksaan manusia sebelum catatan berubah menjadi record profesional yang bisa dipakai tim.",
  },
  {
    icon: FileCheck2,
    title: "Darwin Core Export",
    text: "Rencana export data biodiversitas dengan pengamanan koordinat sensitif dan status review yang jelas.",
  },
  {
    icon: Layers3,
    title: "Threat Layer",
    text: "Lapisan ancaman untuk membaca konteks risiko setelah integrasi data dan tata kelola sumber tersedia.",
  },
  {
    icon: Route,
    title: "Patrol Planner",
    text: "Perencanaan rute observasi berbasis prioritas, bukti, dan batas keselamatan lapangan.",
  },
  {
    icon: Archive,
    title: "Living Species Vault",
    text: "Ruang kerja pengetahuan spesies yang mengutamakan evidence trail, review, dan pembaruan terkontrol.",
  },
];

const workflow = ["Field input", "Evidence hash", "Review queue", "Verified record", "Vault/export"];

export default function FieldIntelligencePage() {
  return (
    <div className="min-h-screen bg-[#050806] text-stone-50">
      <SiteNav dark />
      <main>
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <AuroraMesh />
          <div className="relative mx-auto max-w-[1160px]">
            <Badge tone="dark">Professional Mode</Badge>
            <h1 className="mt-5 max-w-[720px] text-4xl font-semibold tracking-[0] sm:text-5xl">
              NaLI Field Intelligence
            </h1>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-stone-300">
              Sistem intelijen lapangan untuk observasi, konservasi, strukturisasi data, dan decision support berbasis
              bukti.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-warning-amber/40 bg-warning-amber/10 px-4 py-2 text-sm font-semibold text-warning-amber">
              Dibangun bertahap. Belum semua fitur aktif di MVP publik.
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/learn-report" variant="dark">
                Lihat Learn & Report
              </ButtonLink>
              <ButtonLink href="/create-report" variant="ghost">
                Mulai Susun Laporan
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#08110D] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-data-cyan">Future capabilities</p>
                <h2 className="mt-3 max-w-[720px] text-3xl font-semibold">Ruang profesional yang dibangun perlahan.</h2>
              </div>
              <Badge tone="dark">Preview alur, belum aktif penuh</Badge>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item) => {
                const Icon = item.icon;

                return (
                  <Card className="border-white/10 bg-white/5 p-5" key={item.title} tone="dark">
                    <Icon className="h-5 w-5 text-data-cyan" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-stone-300">{item.text}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-data-cyan">Konsep alur profesional</p>
              <h2 className="mt-3 text-3xl font-semibold">Dari input lapangan ke record yang ditinjau manusia.</h2>
              <p className="mt-4 text-sm leading-7 text-stone-300">
                NaLI bukan otoritas final. Semua keputusan konservasi, keselamatan, dan publikasi tetap membutuhkan
                review manusia dan rujukan lembaga berwenang.
              </p>
            </div>
            <div className="grid gap-3">
              {workflow.map((step, index) => (
                <div
                  className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
                  key={step}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-data-cyan/10 text-sm font-semibold text-data-cyan">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step}</p>
                    <p className="mt-1 text-sm text-stone-400">Belum diklaim sebagai fitur operasional penuh di MVP publik.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#08110D] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-4 md:grid-cols-3">
            <Card className="border-white/10 bg-white/5" tone="dark">
              <Map className="h-5 w-5 text-data-cyan" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">Tidak ada peta palsu</h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                NaLI tidak menampilkan map atau alert seolah berjalan langsung tanpa integrasi backend yang benar.
              </p>
            </Card>
            <Card className="border-white/10 bg-white/5" tone="dark">
              <Siren className="h-5 w-5 text-data-cyan" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">Bukan sistem darurat</h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                NaLI tidak menggantikan BMKG, BNPB, KLHK, ranger, reviewer, atau pakar lapangan.
              </p>
            </Card>
            <Card className="border-white/10 bg-white/5" tone="dark">
              <ShieldCheck className="h-5 w-5 text-data-cyan" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">Human review boundary</h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Record profesional hanya bernilai setelah bahan, sumber, dan status review diperiksa manusia.
              </p>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
