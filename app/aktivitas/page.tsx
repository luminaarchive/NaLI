import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { getActivityFeed, getPipelineCheckpoints } from "@/lib/activity";

export const metadata: Metadata = {
  title: "Aktivitas",
  description:
    "Apa yang bergerak di basis bukti NaLI tiap hari: jurnal dan arsip yang diverifikasi, tulisan yang diperbarui. Diambil dari data nyata, bukan klaim.",
  alternates: { canonical: "/aktivitas" },
  openGraph: {
    title: "Aktivitas | NaLI",
    description: "Feed aktivitas basis bukti NaLI, dari data nyata.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const KIND_LABEL = {
  jurnal: "jurnal diverifikasi",
  arsip: "arsip sumber diverifikasi",
  artikel: "tulisan diperbarui",
} as const;

const NF = new Intl.NumberFormat("id-ID");

export default async function AktivitasPage() {
  const days = await getActivityFeed();
  const checkpoints = getPipelineCheckpoints();

  return (
    <div className="theme-jurnal relative">
      <PageHeader
        eyebrow="Modul 7"
        title="Aktivitas"
        description="Situs ini sedang bekerja di latar belakang. Ini catatan jujur apa yang berubah, hari demi hari, langsung dari arsip yang ada."
      />

      <div className="container-editorial py-12 sm:py-16">
        {days.length === 0 ? (
          <p className="font-mono text-sm text-gray">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="space-y-8">
            {days.map((day) => (
              <section key={day.tanggal} className="border-l border-dashed border-ink/40 pl-5">
                <p className="label text-ink">{day.tanggal}</p>
                <ul className="mt-3 space-y-2">
                  {day.lines.map((line) => (
                    <li key={line.kind} className="font-mono text-[0.82rem] leading-relaxed text-ink-charcoal">
                      <span className="text-ink-deep">{NF.format(line.count)}</span>{" "}
                      {KIND_LABEL[line.kind]}
                      {line.examples.length > 0 && (
                        <span className="text-gray">
                          {" "}
                          (mis. {line.examples.map((e) => e.slice(0, 60)).join("; ")}
                          {line.count > line.examples.length ? ", dll" : ""})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {checkpoints.length > 0 && (
          <div className="mt-12 border-t border-dashed border-ink/40 pt-6">
            <p className="label text-ink">Checkpoint pipeline pengetahuan</p>
            <ul className="mt-3 space-y-1 font-mono text-[0.78rem] text-gray">
              {checkpoints.map((c) => (
                <li key={c.batch}>
                  Batch {c.batch}: +{NF.format(c.addedJurnal)} jurnal, +
                  {NF.format(c.addedSources)} arsip sumber ({c.at.slice(0, 10)}).
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
