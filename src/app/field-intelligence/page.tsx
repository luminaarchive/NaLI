import Link from "next/link";
import { ArrowLeft, Database, FileCheck2, Map, RadioTower, ShieldCheck } from "lucide-react";

const futureFeatures = [
  "observation memory",
  "evidence hash sebagai digital integrity marker",
  "review queue",
  "Darwin Core export",
  "threat layer",
  "patrol planner",
  "Living Species Vault",
];

export default function FieldIntelligencePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <header className="border-stone-200 bg-white border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link className="text-forest-700 hover:text-forest-950 inline-flex items-center gap-2 text-sm font-semibold" href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </Link>
          <Link
            className="border-forest-300 text-forest-900 inline-flex min-h-10 items-center rounded-sm border bg-stone-50 px-4 text-sm font-semibold transition hover:bg-stone-100"
            href="/learn-report"
          >
            Lihat Learn & Report
          </Link>
        </div>
      </header>

      <main>
        <section className="border-stone-200 border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-olive-700 text-xs font-semibold tracking-[0.08em] uppercase">Professional Mode</p>
            <h1 className="mt-4 max-w-4xl text-4xl leading-tight font-semibold tracking-[0] sm:text-5xl">
              NaLI Field Intelligence
            </h1>
            <p className="text-forest-800 mt-5 max-w-3xl text-lg leading-8">
              Professional Field Intelligence is being built progressively. Current MVP focuses on Learn & Report.
              Halaman ini hanya menjelaskan arah produk profesional, bukan klaim bahwa semua fitur operasional sudah
              aktif.
            </p>
          </div>
        </section>

        <section className="border-stone-200 border-b bg-stone-100 py-12">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
            {futureFeatures.map((feature) => (
              <article className="border-stone-200 bg-white p-5 shadow-sm" key={feature}>
                <Database className="h-5 w-5 text-olive-700" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-semibold">{feature}</h2>
                <p className="text-forest-700 mt-2 text-sm leading-6">
                  Planned professional capability. Activation requires backend persistence, review rules, and product QA.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            {[
              {
                icon: FileCheck2,
                title: "Evidence-first",
                text: "Catatan profesional harus dapat ditelusuri ke bahan, status review, dan batasan data.",
              },
              {
                icon: Map,
                title: "Sensitive by default",
                text: "Koordinat spesies sensitif tidak boleh ditampilkan sembarangan di permukaan publik.",
              },
              {
                icon: RadioTower,
                title: "No fake operations",
                text: "NaLI tidak mengklaim alert, threat layer, atau realtime flow tanpa integrasi backend yang terverifikasi.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article className="border-stone-200 bg-stone-50 p-5" key={item.title}>
                  <Icon className="h-5 w-5 text-olive-700" aria-hidden="true" />
                  <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
                  <p className="text-forest-700 mt-2 text-sm leading-7">{item.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="border-warning-amber/60 bg-warning-amber/15 flex gap-3 border p-4 text-sm leading-6">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" aria-hidden="true" />
              <p>
                Evidence hash, jika digunakan nanti, hanya boleh dijelaskan sebagai digital integrity marker. Itu bukan
                bukti hukum otomatis atau validasi akademik final.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
