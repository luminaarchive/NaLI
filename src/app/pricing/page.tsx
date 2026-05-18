import { CheckCircle2, Clock3, CreditCard, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SiteFooter, SiteNav } from "@/components/ui/SiteNav";

const tiers = [
  {
    access: ["Limited drafts", "Basic outline", "Basic source check placeholder"],
    fit: "Pengguna baru yang ingin mencoba alur Learn & Report.",
    name: "Free",
    price: "Rp0",
    status: "Aktif untuk MVP",
  },
  {
    access: ["Report drafts", "Markdown export", "Source coverage warning"],
    fit: "Siswa atau mahasiswa yang sering menyusun laporan singkat.",
    name: "Student",
    price: "Rp29.000-49.000/bulan",
    status: "Beta, payment belum aktif",
  },
  {
    access: ["Literature matrix", "Source verification", "Scholar field mode later"],
    fit: "Mahasiswa akhir, peneliti junior, atau guru yang butuh struktur sumber lebih kuat.",
    name: "Scholar",
    price: "Rp99.000-149.000/bulan",
    status: "Direncanakan",
  },
  {
    access: ["Report polishing", "Evidence gap review", "Professional writing support"],
    fit: "NGO/CSR junior, staf lapangan, atau penulis laporan proyek.",
    name: "Professional Writer",
    price: "Beta terbatas",
    status: "Direncanakan",
  },
];

const oneTime = [
  {
    name: "Short report",
    price: "Rp9.000-29.000",
    text: "Untuk draft singkat berbasis catatan atau sumber yang sudah disediakan pengguna.",
  },
  {
    name: "College/practicum report",
    price: "Rp29.000-99.000",
    text: "Untuk laporan kuliah atau praktikum yang membutuhkan struktur dan checklist review lebih rapi.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <SiteNav />
      <main>
        <section className="border-b border-stone-200 bg-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <Badge tone="green">Beta pricing</Badge>
            <h1 className="mt-4 max-w-[720px] text-4xl font-semibold tracking-[0] sm:text-5xl">
              Struktur harga awal NaLI
            </h1>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-forest-800">
              Struktur harga beta. Payment gateway belum aktif, jadi halaman ini belum menjadi checkout atau langganan
              aktif.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-warning-amber/40 bg-warning-amber/10 px-4 py-2 text-sm font-semibold text-warning-amber">
              Payment gateway belum aktif. Harga ini adalah struktur awal beta.
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-4 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card className="flex flex-col p-5" key={tier.name}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold">{tier.name}</h2>
                    <p className="mt-2 text-lg font-semibold text-forest-800">{tier.price}</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-olive-700" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm leading-7 text-forest-700">
                  <span className="font-semibold text-forest-950">Cocok untuk: </span>
                  {tier.fit}
                </p>
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">Akses utama</p>
                  <ul className="mt-3 space-y-3 text-sm leading-6">
                    {tier.access.map((feature) => (
                      <li className="flex gap-2" key={feature}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto pt-6">
                  <Badge tone={tier.name === "Free" ? "green" : "paper"}>{tier.status}</Badge>
                  <ButtonLink className="mt-4 w-full" href="/create-report" variant={tier.name === "Free" ? "primary" : "secondary"}>
                    {tier.name === "Free" ? "Mulai dari Free" : "Segera tersedia"}
                  </ButtonLink>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-stone-200 bg-stone-100 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <Badge tone="paper">One-Time Report</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Pilihan sekali pakai untuk validasi beta.</h2>
              <p className="mt-4 text-sm leading-7 text-forest-700">
                Payment belum aktif. Paket ini hanya struktur awal untuk memahami kebutuhan pengguna.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {oneTime.map((item) => (
                <Card key={item.name}>
                  <FileText className="h-5 w-5 text-olive-700" aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-semibold">{item.name}</h3>
                  <p className="mt-2 text-lg font-semibold text-forest-800">{item.price}</p>
                  <p className="mt-3 text-sm leading-7 text-forest-700">{item.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Clock3 className="h-6 w-6 text-olive-700" aria-hidden="true" />
              <h2 className="mt-4 text-3xl font-semibold">Coba MVP dulu, validasi harga nanti.</h2>
              <p className="mt-3 max-w-[720px] text-sm leading-7 text-forest-700">
                Langkah paling aman sekarang adalah menguji apakah NaLI membantu dari satu catatan atau dari nol tanpa
                membuat data palsu.
              </p>
            </div>
            <ButtonLink href="/create-report">Coba MVP</ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
