import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, SearchCheck } from "lucide-react";

const users = ["siswa", "mahasiswa", "guru", "staf lapangan", "NGO/CSR junior", "peneliti junior", "komunitas alam"];

const useCases = [
  "laporan praktikum",
  "laporan observasi lingkungan",
  "laporan field trip",
  "laporan kegiatan proyek",
  "literature matrix",
  "source checker",
  "draft berbasis bahan",
];

export default function LearnReportPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <header className="border-stone-200 bg-white border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link className="text-lg font-semibold" href="/">
            NaLI
          </Link>
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
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-olive-700 text-xs font-semibold tracking-[0.08em] uppercase">Public Mode</p>
            <h1 className="mt-4 max-w-4xl text-4xl leading-tight font-semibold tracking-[0] sm:text-5xl">
              NaLI Learn & Report
            </h1>
            <p className="text-forest-800 mt-5 max-w-3xl text-lg leading-8">
              NaLI Learn & Report membantu mengubah catatan, sumber, lokasi, dan bahan mentah menjadi draft laporan
              berbasis bukti. Output tetap harus diperiksa, diedit, dan diverifikasi oleh pengguna.
            </p>
          </div>
        </section>

        <section className="border-stone-200 border-b bg-stone-100 py-12">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="h-5 w-5 text-olive-700" aria-hidden="true" />
                Untuk siapa
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {users.map((user) => (
                  <span className="border-stone-300 bg-stone-50 rounded-sm border px-3 py-1 text-sm" key={user}>
                    {user}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <SearchCheck className="h-5 w-5 text-olive-700" aria-hidden="true" />
                Bisa membantu apa
              </h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {useCases.map((item) => (
                  <p className="flex gap-2 text-sm leading-6" key={item}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" aria-hidden="true" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Bukan karya final",
                  text: "NaLI menyusun draft berbasis bahan. Pengguna tetap wajib memeriksa dan mengedit.",
                },
                {
                  title: "Tidak membuat sitasi palsu",
                  text: "URL dari pengguna akan dicatat sebagai bahan dan diberi status belum terverifikasi di MVP ini.",
                },
                {
                  title: "Batas bukti terlihat",
                  text: "Setiap draft memiliki evidence table, uncertainty note, dan disclaimer integritas akademik.",
                },
              ].map((item) => (
                <article className="border-stone-200 bg-stone-50 p-5" key={item.title}>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="text-forest-700 mt-3 text-sm leading-7">{item.text}</p>
                </article>
              ))}
            </div>
            <Link
              className="bg-forest-900 hover:bg-forest-800 mt-8 inline-flex min-h-12 items-center gap-2 rounded-sm px-5 text-sm font-semibold text-stone-50 transition"
              href="/create-report"
            >
              Mulai Susun Laporan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
