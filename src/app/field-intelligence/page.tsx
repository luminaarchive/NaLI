import { Archive, ClipboardCheck, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteNav";
import { FieldIntelligenceShell } from "@/components/ui/FieldIntelligenceShell";

const groups = [
  {
    icon: Archive,
    title: "Catatan lapangan",
    items: ["Struktur data observasi", "Evidence hash nanti", "Riwayat catatan"],
  },
  {
    icon: ClipboardCheck,
    title: "Review manusia",
    items: ["Review queue nanti", "Validasi ahli/tim", "Batas keputusan manusia"],
  },
  {
    icon: FileCheck2,
    title: "Export evidence",
    items: ["Format data nanti", "Export konservasi nanti", "Audit trail nanti"],
  },
];

export default function FieldIntelligencePage() {
  return (
    <FieldIntelligenceShell>
      <main className="relative z-10">
        <section className="px-4 pt-28 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[860px] text-center">
            <Badge tone="glass">Professional Mode</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[#111814] sm:text-5xl">
              NaLI Field Intelligence
            </h1>
            <p className="mx-auto mt-5 max-w-[640px] text-base leading-7 text-[#5F6B62] sm:text-lg">
              Untuk tim lapangan yang butuh catatan observasi lebih rapi, bisa diaudit, dan siap direview.
            </p>
            <div className="mt-6">
              <Badge tone="amber" className="px-4 py-2 text-sm">
                Dibangun bertahap — belum aktif penuh di MVP publik.
              </Badge>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <ButtonLink href="/learn-report">Mulai dari Learn & Report</ButtonLink>
              <ButtonLink href="/pricing" variant="glass">
                Lihat Harga Sprint 0
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="border-y border-[#DDD5C7] bg-[#FCFAF4] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px]">
            <div className="grid gap-4 md:grid-cols-3">
              {groups.map((group) => {
                const Icon = group.icon;

                return (
                  <article className="rounded-lg border border-[#DDD5C7] bg-white p-5" key={group.title}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#DDD5C7] bg-[#FCFAF4]">
                      <Icon className="h-5 w-5 text-[#6F8057]" aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-[#111814]">{group.title}</h2>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5F6B62]">
                      {group.items.map((item) => (
                        <li className="flex gap-2" key={item}>
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6F8057]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[840px] rounded-lg border border-[#DDD5C7] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#111814]">Batas Sprint 0</h2>
            <p className="mt-3 text-sm leading-7 text-[#5F6B62]">
              Halaman ini menjelaskan arah Professional Layer. MVP publik tetap fokus pada Learn & Report, preview gratis, dan export premium yang disiapkan bertahap.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </FieldIntelligenceShell>
  );
}
