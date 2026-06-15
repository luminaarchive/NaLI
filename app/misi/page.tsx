import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getMissions } from "@/lib/missions";

export const metadata: Metadata = {
  title: "Misi Riset",
  description:
    "Misi riset terbuka NaLI: celah pembuktian nyata yang sedang kami kerjakan, dan bukti apa yang masih dibutuhkan. Tanpa akun, kontribusi ditinjau manual.",
  alternates: { canonical: "/misi" },
  openGraph: {
    title: "Misi Riset | NaLI by NatIve",
    description: "Celah riset terbuka NaLI dan bukti yang masih dibutuhkan.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const NF = new Intl.NumberFormat("id-ID");

export default function MisiPage() {
  const missions = getMissions();

  return (
    <div className="theme-investigasi relative">
      <PageHeader
        eyebrow="Modul 5"
        title="Misi Riset"
        description="Riset terbuka berarti mengundang orang lain ikut menutup celah bukti. Ini misi yang sedang berjalan, dan kami jujur soal sejauh mana progresnya."
      />

      <div className="container-editorial py-12 sm:py-16">
        <p className="mb-8 max-w-2xl font-mono text-[0.82rem] leading-relaxed text-gray">
          Tanpa perlu membuat akun. Punya bukti yang relevan? Kirim tautan atau
          dokumennya lewat{" "}
          <Link href="/koreksi" className="text-ink underline-offset-2 hover:underline">
            halaman koreksi
          </Link>{" "}
          atau{" "}
          <Link href="/kontak" className="text-ink underline-offset-2 hover:underline">
            kontak
          </Link>
          . Tiap kiriman ditinjau manual sebelum dipakai.
        </p>

        {missions.length === 0 ? (
          <p className="font-mono text-sm text-gray">Belum ada misi aktif.</p>
        ) : (
          <ul className="space-y-8">
            {missions.map((m) => {
              const totalKontributor =
                m.kontributor.peneliti + m.kontributor.pembaca + m.kontributor.penerjemah;
              return (
                <li key={m.id} className="border border-dashed border-ink/40 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="label text-ink/60">
                      {m.status === "aktif" ? "Aktif" : "Selesai"}
                    </span>
                    <span className="font-mono text-[0.72rem] text-gray">
                      {NF.format(totalKontributor)} kontributor
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl leading-tight text-ink-black">
                    {m.judul}
                  </h2>
                  <p className="mt-2 max-w-2xl font-mono text-[0.82rem] leading-relaxed text-gray">
                    {m.deskripsi}
                  </p>

                  {/* progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between font-mono text-[0.7rem] text-ink/70">
                      <span>Progres (estimasi jujur)</span>
                      <span className="tabular-nums">{m.progressPercentage}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full border border-ink/40 bg-paper">
                      <div
                        className="h-full bg-ink/70"
                        style={{ width: `${Math.min(100, Math.max(0, m.progressPercentage))}%` }}
                      />
                    </div>
                  </div>

                  {/* evidence needed */}
                  <div className="mt-5">
                    <p className="label text-ink/70">Bukti yang dibutuhkan</p>
                    <ul className="mt-2 space-y-2">
                      {m.kebutuhanBukti.map((b, i) => (
                        <li key={i} className="font-mono text-[0.8rem] leading-relaxed text-ink-charcoal">
                          <span className="text-ink" aria-hidden>
                            {"□ "}
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
