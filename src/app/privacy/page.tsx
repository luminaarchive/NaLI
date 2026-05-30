import type { Metadata } from "next";
import Link from "next/link";
import { PublicAppShell } from "@/components/ui/PublicAppShell";

export const metadata: Metadata = {
  title: "NaLI — Kebijakan Privasi",
  description: "Kebijakan privasi NaLI: data yang kami kumpulkan, bagaimana digunakan, dan hak pengguna.",
};

export default function PrivacyPage() {
  return (
    <PublicAppShell>
      <main className="flex-1 bg-[#060b08] text-[#f5f0e8]">
        <article className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
          <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-[#00FFB3] uppercase">Kebijakan Privasi</p>
          <h1 className="mb-2 font-serif text-3xl font-bold text-[#f5f0e8]">Kebijakan Privasi NaLI</h1>
          <p className="mb-12 text-xs text-[#a1b3a8]">Terakhir diperbarui: Juni 2026</p>

          <div className="space-y-10 text-sm leading-7 text-[#a1b3a8]">
            <section>
              <h2 className="mb-3 font-serif text-lg font-bold text-[#f5f0e8]">Data yang Kami Kumpulkan</h2>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong className="text-[#f5f0e8]">Data akun:</strong> nama dan alamat email saat registrasi
                </li>
                <li>
                  <strong className="text-[#f5f0e8]">Data laporan:</strong> prompt atau bahan yang kamu input, dan hasil
                  laporan yang dihasilkan
                </li>
                <li>
                  <strong className="text-[#f5f0e8]">Data catatan lapangan:</strong> catatan observasi yang kamu simpan
                  di platform
                </li>
                <li>
                  <strong className="text-[#f5f0e8]">Data teknis:</strong> log error dan waktu akses, digunakan untuk
                  perbaikan layanan saja
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-lg font-bold text-[#f5f0e8]">Bagaimana Data Digunakan</h2>
              <ul className="list-inside list-disc space-y-2">
                <li>Menyimpan riwayat laporan di akun kamu</li>
                <li>Meningkatkan kualitas layanan NaLI</li>
                <li>
                  <strong className="text-[#f5f0e8]">
                    Data laporan TIDAK digunakan untuk melatih model AI pihak ketiga
                  </strong>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-lg font-bold text-[#f5f0e8]">Data yang TIDAK Kami Kumpulkan</h2>
              <ul className="list-inside list-disc space-y-2">
                <li>Koordinat GPS spesifik lokasi satwa dilindungi</li>
                <li>Data pembayaran (ditangani langsung oleh Midtrans)</li>
                <li>Informasi kartu kredit atau rekening bank</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-lg font-bold text-[#f5f0e8]">Penyimpanan dan Keamanan</h2>
              <ul className="list-inside list-disc space-y-2">
                <li>Data disimpan di Supabase (infrastruktur AWS ap-southeast-1)</li>
                <li>Semua koneksi menggunakan HTTPS/TLS</li>
                <li>Row Level Security (RLS) aktif — kamu hanya bisa mengakses data milikmu sendiri</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-lg font-bold text-[#f5f0e8]">Hak Pengguna</h2>
              <ul className="list-inside list-disc space-y-2">
                <li>Kamu bisa menghapus akun dan semua data kapan saja</li>
                <li>Kamu bisa mengekspor laporan milikmu</li>
                <li>
                  Permintaan penghapusan data: hubungi kami di{" "}
                  <a href="mailto:privacy@hellonali.com" className="text-[#00FFB3] underline-offset-2 hover:underline">
                    privacy@hellonali.com
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-lg font-bold text-[#f5f0e8]">Kebijakan Cookie</h2>
              <p>
                NaLI menggunakan cookie sesi untuk autentikasi (Supabase auth token). Tidak ada cookie tracking atau
                iklan pihak ketiga.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-lg font-bold text-[#f5f0e8]">Perubahan Kebijakan</h2>
              <p>
                Perubahan material akan diberitahukan via email sebelum berlaku. Kamu bisa berhenti menggunakan layanan
                kapan saja jika tidak setuju dengan perubahan tersebut.
              </p>
            </section>

            <section className="border-t border-[#14261c] pt-8">
              <h2 className="mb-3 font-serif text-lg font-bold text-[#f5f0e8]">Kontak</h2>
              <p>
                NatIve &middot;{" "}
                <a href="mailto:privacy@hellonali.com" className="text-[#00FFB3] underline-offset-2 hover:underline">
                  privacy@hellonali.com
                </a>{" "}
                &middot; @hellonali
              </p>
            </section>
          </div>

          <div className="mt-12 border-t border-[#14261c] pt-8">
            <Link href="/" className="text-sm text-[#a1b3a8] transition-colors hover:text-[#f5f0e8]">
              &larr; Kembali ke beranda
            </Link>
          </div>
        </article>
      </main>
    </PublicAppShell>
  );
}
