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
import type { LucideIcon } from "lucide-react";
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
    text: "Digital integrity marker untuk menandai integritas berkas, bukan bukti hukum atau validasi akademik.",
  },
  {
    icon: ClipboardCheck,
    title: "Review Queue",
    text: "Alur pemeriksaan manusia sebelum catatan menjadi record profesional yang layak dipakai tim.",
  },
  {
    icon: FileCheck2,
    title: "Darwin Core Export",
    text: "Rencana export data biodiversitas dengan pengamanan koordinat sensitif dan status review jelas.",
  },
  {
    icon: Layers3,
    title: "Threat Layer",
    text: "Lapisan ancaman yang baru masuk akal setelah integrasi data dan tata kelola sumber tersedia.",
  },
  {
    icon: Route,
    title: "Patrol Planner",
    text: "Perencanaan rute observasi berbasis prioritas, bukti, dan batas keselamatan lapangan.",
  },
  {
    icon: Archive,
    title: "Living Species Vault",
    text: "Ruang pengetahuan spesies dengan evidence trail, review, dan pembaruan terkontrol.",
  },
];

const workflow = ["Field input", "Digital integrity marker", "Review queue", "Reviewed record", "Vault/export"];

export default function FieldIntelligencePage() {
  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#111814]">
      <SiteNav />
      <main>
        <section className="border-b border-[#DDD5C7] bg-[#F7F3EA] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <Badge tone="paper">Professional Mode</Badge>
            <h1 className="mt-5 max-w-[760px] text-4xl font-semibold tracking-[0] sm:text-5xl">
              NaLI Field Intelligence
            </h1>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-[#5F6B62]">
              Sistem intelijen lapangan untuk observasi, konservasi, strukturisasi data, dan decision support berbasis
              bukti.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-[#D8B98B] bg-[#FFF7E8] px-4 py-2 text-sm font-semibold text-[#8A4F2D]">
              Dibangun bertahap. MVP publik saat ini fokus pada Learn & Report.
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/learn-report">Lihat Learn & Report</ButtonLink>
              <ButtonLink href="/create-report" variant="secondary">
                Mulai Susun Laporan
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6F8057]">
                Preview alur profesional
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Serius, tetapi belum diklaim aktif penuh.</h2>
              <p className="mt-4 text-sm leading-7 text-[#5F6B62]">
                Halaman ini menjelaskan arah Professional Layer. NaLI tidak menampilkan peta, alert, atau record
                terverifikasi seolah sistem operasional sudah berjalan.
              </p>
            </div>
            <div className="grid gap-3">
              {workflow.map((step, index) => (
                <div className="flex gap-4 rounded-lg border border-[#DDD5C7] bg-white p-4" key={step}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8EFE4] text-sm font-semibold text-[#173D2B]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step}</p>
                    <p className="mt-1 text-sm leading-6 text-[#5F6B62]">
                      Konsep alur. Belum menjadi fitur operasional penuh di MVP publik.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#DDD5C7] bg-[#FCFAF4] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6F8057]">
                  Future capabilities
                </p>
                <h2 className="mt-3 max-w-[720px] text-3xl font-semibold">Dibangun setelah sinyal produk cukup.</h2>
              </div>
              <Badge tone="paper">Belum aktif penuh</Badge>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item) => (
                <CapabilityCard icon={item.icon} key={item.title} text={item.text} title={item.title} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-4 md:grid-cols-3">
            <BoundaryCard
              icon={Map}
              title="Tidak ada peta palsu"
              text="NaLI tidak menampilkan map atau alert seolah berjalan langsung tanpa integrasi backend yang benar."
            />
            <BoundaryCard
              icon={Siren}
              title="Bukan sistem darurat"
              text="NaLI tidak menggantikan BMKG, BNPB, KLHK, ranger, reviewer, atau pakar lapangan."
            />
            <BoundaryCard
              icon={ShieldCheck}
              title="Human review boundary"
              text="Record profesional hanya bernilai setelah bahan, sumber, dan status review diperiksa manusia."
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CapabilityCard({ icon: Icon, text, title }: { icon: LucideIcon; text: string; title: string }) {
  return (
    <Card className="p-5">
      <Icon className="h-5 w-5 text-[#6F8057]" aria-hidden="true" />
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#5F6B62]">{text}</p>
    </Card>
  );
}

function BoundaryCard({ icon: Icon, text, title }: { icon: LucideIcon; text: string; title: string }) {
  return (
    <Card className="p-5" tone="muted">
      <Icon className="h-5 w-5 text-[#6F8057]" aria-hidden="true" />
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#5F6B62]">{text}</p>
    </Card>
  );
}
