import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const tiers = [
  {
    features: ["limited drafts", "basic outline", "basic source check placeholder"],
    name: "Free",
    price: "Rp0",
  },
  {
    features: ["report drafts", "PDF/Markdown export", "source coverage warning"],
    name: "Student",
    price: "Rp29.000-49.000/bulan",
  },
  {
    features: ["literature matrix", "source verification", "scholar field mode later"],
    name: "Scholar",
    price: "Rp99.000-149.000/bulan",
  },
];

const oneTime = [
  ["Short report", "Rp9.000-29.000"],
  ["College/practicum report", "Rp29.000-99.000"],
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <header className="border-stone-200 bg-white border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link className="text-forest-700 hover:text-forest-950 inline-flex items-center gap-2 text-sm font-semibold" href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </Link>
          <Link
            className="bg-forest-900 hover:bg-forest-800 inline-flex min-h-10 items-center rounded-sm px-4 text-sm font-semibold text-stone-50 transition"
            href="/create-report"
          >
            Mulai Susun Laporan
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-olive-700 text-xs font-semibold tracking-[0.08em] uppercase">Beta pricing</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[0]">Struktur harga awal NaLI</h1>
        <p className="text-forest-800 mt-4 max-w-3xl text-base leading-7">
          Payment gateway belum aktif. Harga ini adalah struktur awal beta untuk membantu validasi produk dan tidak
          berarti pembayaran sudah tersedia.
        </p>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article className="border-stone-200 bg-white p-5 shadow-sm" key={tier.name}>
              <h2 className="text-2xl font-semibold">{tier.name}</h2>
              <p className="mt-3 text-xl font-semibold text-forest-800">{tier.price}</p>
              <ul className="mt-5 space-y-3 text-sm leading-6">
                {tier.features.map((feature) => (
                  <li className="flex gap-2" key={feature}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="border-stone-200 bg-white mt-8 p-5 shadow-sm">
          <h2 className="text-2xl font-semibold">One-time report</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-stone-200 border-b">
                  <th className="text-forest-700 px-3 py-2 font-semibold">Produk</th>
                  <th className="text-forest-700 px-3 py-2 font-semibold">Rentang beta</th>
                </tr>
              </thead>
              <tbody>
                {oneTime.map(([product, price]) => (
                  <tr className="border-stone-200 border-b" key={product}>
                    <td className="px-3 py-3">{product}</td>
                    <td className="px-3 py-3">{price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
