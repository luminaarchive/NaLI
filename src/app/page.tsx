import type { Metadata } from "next";
import Link from "next/link";
import { HomeQueryBox } from "@/components/report/HomeQueryBox";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: siteMetadata.routes.home.title,
  description: siteMetadata.routes.home.description,
  alternates: {
    canonical: siteMetadata.canonicalBase,
  },
};

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <PublicAppShell isHomepage>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />
      <main className="flex flex-1 flex-col justify-center bg-[#f5f0e8]">
        <section className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 py-12">
          <div className="flex w-full max-w-[680px] flex-col items-center text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#4a6455]">
              NaLI Learn &amp; Report
            </p>
            <h1 className="mb-3 font-serif text-[clamp(28px,4.5vw,52px)] font-semibold leading-[1.15] text-[#1e3525]">
              Apa yang ingin kamu susun hari ini?
            </h1>
            <p className="mb-4 max-w-[580px] text-sm sm:text-base leading-relaxed text-[#4a6455] font-medium">
              Nature &amp; Evidence Intelligence OS (Public Alpha) untuk menyusun laporan lingkungan, praktikum, dan observasi secara jujur.
            </p>
            <p className="mb-8 text-xs text-[#4a6455]/70 italic">
              Penyusunan berbasis AI aktif saat kapasitas engine tersedia. NaLI membedakan bukti pengguna, inferensi AI, dan bukti yang kurang.
            </p>

            <HomeQueryBox />

            {/* Agent Preview Card */}
            <div className="mt-8 w-full max-w-[620px] rounded-2xl border border-[#1e3525]/12 bg-white/50 p-5 text-left shadow-[0_4px_20px_rgba(30,53,37,0.04)] backdrop-blur-sm">
              <h3 className="mb-3.5 font-serif text-xs font-bold uppercase tracking-wider text-[#1e3525]">
                Rencana Kerja NaLI (Agentic Work Plan)
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  "Membaca konteks input",
                  "Mengidentifikasi jenis laporan",
                  "Memetakan klaim dan bukti",
                  "Menandai bukti yang kurang",
                  "Menyusun struktur laporan",
                  "Membuat draft awal",
                  "Mengecek batas klaim",
                  "Menyiapkan hasil"
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#4a6455]">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1e3525]/10 text-[9px] font-bold text-[#1e3525]">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside
              aria-label="Batas bukti"
              className="mt-8 w-full max-w-[620px] border-t border-[#1e3525]/10 pt-5 text-center text-xs leading-6 text-[#4a6455]"
            >
              <p className="font-medium text-[#1e3525]/80">
                Mau bikin laporan apa? NaLI menyusun draft dari bahanmu dengan batas bukti yang jelas.
              </p>
              <p>Bukti yang belum tersedia tetap ditandai, bukan dibuat-buat. AI inference bukan bukti lapangan.</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/learn-report">
                  Cara kerja singkat
                </Link>
                <Link
                  className="font-medium text-[#1e3525] underline-offset-4 hover:underline"
                  href="/field-intelligence"
                >
                  Field Intelligence (roadmap)
                </Link>
                <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/pricing">
                  Harga alpha
                </Link>
              </div>
              <p className="mt-3 text-[#4a6455]/70">
                Public Alpha: AI draft tersedia jika kapasitas tersedia &middot;: pembayaran belum aktif &middot; Upload belum aktif &middot; Source verification belum aktif
              </p>
            </aside>

            <p className="mt-8 text-xs leading-relaxed text-[#4a6455]/60">
              5 gunung pilot: Semeru &middot; Merbabu &middot; Lawu &middot; Sindoro-Sumbing &middot; Rinjani
            </p>
          </div>
        </section>

        {/* Dedicated Centered Status Section */}
        <section id="status" className="border-t border-[#1e3525]/10 bg-white/40 py-16 px-4">
          <div className="mx-auto max-w-[620px] text-center">
            <h2 className="font-serif text-2xl font-bold text-[#1e3525] tracking-tight mb-4">
              Status Sistem NaLI
            </h2>
            <p className="mb-8 text-xs text-[#4a6455]">
              Pemantauan status kesiapan operasional fitur publik NaLI (Public Alpha).
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              {[
                { label: "Public Alpha", status: "aktif", desc: "Akses publik gratis" },
                { label: "AI engine", status: "kapasitas bisa terbatas", desc: "Provider rate limits/quota" },
                { label: "Pembayaran", status: "belum aktif", desc: "Checkout ditangguhkan" },
                { label: "PDF publik", status: "terkunci", desc: "Unduh laporan lokal saja" },
                { label: "Upload", status: "belum aktif", desc: "Materi input via teks/form" },
                { label: "Source verification", status: "belum aktif", desc: "Klaim rujukan diverifikasi manual" }
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-[#1e3525]/8 bg-white/80 p-4 shadow-[0_2px_12px_rgba(30,53,37,0.02)]">
                  <span className="block text-xs font-semibold text-[#4a6455] uppercase tracking-wider">{item.label}</span>
                  <span className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-[#1e3525]">
                    <span className={`h-2 w-2 rounded-full ${item.status === "aktif" ? "bg-emerald-500" : item.status === "kapasitas bisa terbatas" ? "bg-amber-500 animate-pulse" : "bg-zinc-400"}`} />
                    {item.status}
                  </span>
                  <span className="mt-1 block text-[11px] text-[#4a6455]/70">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
