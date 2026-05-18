import Link from "next/link";
import { ArrowRight, BookOpenCheck, ClipboardList, Database, Leaf, ShieldCheck } from "lucide-react";
import { buildJsonLdGraph } from "@/lib/seo/site";

const paths = [
  {
    description:
      "Untuk siswa, mahasiswa, guru, staf lapangan, NGO/CSR junior, peneliti junior, dan komunitas alam yang perlu menyusun laporan berbasis bahan.",
    href: "/learn-report",
    label: "NaLI Learn & Report",
    status: "MVP aktif",
  },
  {
    description:
      "Untuk observasi, konservasi, review queue, Darwin Core export, threat layer, patrol planner, dan Living Species Vault. Dibangun bertahap.",
    href: "/field-intelligence",
    label: "NaLI Field Intelligence",
    status: "Info produk",
  },
];

const guarantees = [
  "Evidence table di setiap output",
  "Uncertainty note dan batasan sumber",
  "Disclaimer integritas akademik",
  "Human review tetap keputusan akhir",
];

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />

      <header className="border-stone-200 bg-stone-50/95 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="bg-forest-900 flex h-10 w-10 items-center justify-center rounded-sm text-stone-50">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-[0]">NaLI</span>
              <span className="text-forest-700 hidden text-xs sm:block">by NatIve</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-semibold md:flex">
            <Link className="text-forest-700 hover:text-forest-950" href="/learn-report">
              Learn & Report
            </Link>
            <Link className="text-forest-700 hover:text-forest-950" href="/field-intelligence">
              Field Intelligence
            </Link>
            <Link className="text-forest-700 hover:text-forest-950" href="/pricing">
              Pricing
            </Link>
          </nav>
          <Link
            className="bg-forest-900 hover:bg-forest-800 inline-flex min-h-10 items-center gap-2 rounded-sm px-4 text-sm font-semibold text-stone-50 transition"
            href="/create-report"
          >
            Mulai Susun Laporan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        <section className="border-stone-200 border-b bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8 lg:py-20">
            <div>
              <p className="text-olive-700 text-xs font-semibold tracking-[0.08em] uppercase">
                Field note to report
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl leading-tight font-semibold tracking-[0] sm:text-5xl">
                Ubah catatan dan sumber menjadi laporan berbasis bukti.
              </h1>
              <p className="text-forest-800 mt-5 max-w-3xl text-base leading-8 sm:text-lg">
                NaLI membantu menyusun, bukan menggantikan tanggung jawab akademik. Setiap output diberi evidence
                table, uncertainty note, dan disclaimer agar pengguna bisa memeriksa ulang sebelum memakai dokumen.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="bg-forest-900 hover:bg-forest-800 inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-5 text-sm font-semibold text-stone-50 transition"
                  href="/create-report"
                >
                  Mulai Susun Laporan
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  className="border-forest-300 text-forest-900 inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border bg-stone-50 px-5 text-sm font-semibold transition hover:bg-stone-100"
                  href="/field-intelligence"
                >
                  Lihat Field Intelligence
                  <Database className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <aside className="border-stone-200 bg-stone-50 p-5">
              <p className="text-forest-700 text-xs font-semibold tracking-[0.08em] uppercase">Guardrail MVP</p>
              <ul className="mt-4 space-y-3 text-sm leading-6">
                {guarantees.map((item) => (
                  <li className="flex gap-2" key={item}>
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="border-warning-amber/60 bg-warning-amber/15 mt-5 border p-3 text-sm leading-6">
                Current MVP focuses on Learn & Report. Professional Field Intelligence is being built progressively.
              </p>
            </aside>
          </div>
        </section>

        <section className="border-stone-200 border-b bg-stone-100 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-2">
              {paths.map((path) => (
                <Link
                  className="border-stone-200 bg-white p-5 shadow-sm transition hover:border-olive-300"
                  href={path.href}
                  key={path.label}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-olive-700 text-xs font-semibold tracking-[0.08em] uppercase">{path.status}</p>
                      <h2 className="mt-3 text-2xl font-semibold">{path.label}</h2>
                    </div>
                    <ArrowRight className="h-5 w-5 text-olive-700" aria-hidden="true" />
                  </div>
                  <p className="text-forest-700 mt-4 text-sm leading-7">{path.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-olive-700 text-xs font-semibold tracking-[0.08em] uppercase">
                Learn & Report MVP
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[0]">Yang sudah difokuskan sekarang</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Pilih template laporan",
                "Masukkan catatan, URL, lokasi, atau keterangan file",
                "Setujui integritas akademik",
                "Terima draft terstruktur dengan evidence table",
              ].map((item) => (
                <div className="border-stone-200 bg-stone-50 p-4" key={item}>
                  <BookOpenCheck className="h-5 w-5 text-olive-700" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
