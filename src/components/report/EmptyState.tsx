"use client";

interface EmptyStateProps {
  onSampleClick: (text: string) => void;
}

// Starter chips. Clicking pre-fills the composer with a short template that
// guides the user to add the specific field data NaLI needs.
const CHIPS = [
  {
    icon: "🦅",
    label: "Observasi satwa",
    template:
      "Saya mengamati [spesies] di [lokasi, koordinat GPS jika ada] pada [tanggal dan jam]. Jumlah individu: [berapa ekor]. Kondisi habitat: [deskripsi]. Perilaku yang teramati: [tambahkan detail].",
  },
  {
    icon: "🐾",
    label: "Jejak & spoor",
    template:
      "Saya menemukan jejak di [lokasi, koordinat GPS jika ada] pada [tanggal dan jam]. Ukuran jejak: [panjang x lebar cm]. Karakteristik: [pola, kedalaman, substrat]. [Tambahkan detail lain yang kamu amati].",
  },
  {
    icon: "🌿",
    label: "Survei vegetasi",
    template:
      "Survei transek vegetasi di [lokasi, ketinggian] pada [tanggal]. Panjang transek: [meter]. Spesies dominan: [daftar]. Tutupan kanopi: [persen]. [Tambahkan data plot atau pengukuran lain].",
  },
  {
    icon: "📷",
    label: "Analisis foto lapangan",
    template:
      "Saya punya foto lapangan dari [lokasi] pada [tanggal]. Yang terlihat: [deskripsi objek atau spesies]. [Lampirkan foto lewat tombol + dan tambahkan konteks pengamatan].",
  },
  {
    icon: "📊",
    label: "Data kamera trap",
    template:
      "Data kamera trap dari [jumlah] lokasi selama [jumlah] hari di [area]. Total deteksi: [angka]. Spesies tercatat: [daftar]. [Tambahkan ringkasan per stasiun atau tanggal].",
  },
  {
    icon: "📋",
    label: "Laporan KKN/praktikum",
    template:
      "Laporan [KKN/praktikum] tentang [topik] di [lokasi] pada [tanggal]. Tim: [jumlah orang]. Metode: [deskripsi]. Temuan utama: [ringkasan data dan pengamatan].",
  },
] as const;

export function EmptyState({ onSampleClick }: EmptyStateProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2">
      {CHIPS.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={() => onSampleClick(c.template)}
          className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-2 text-[13px] text-white/75 transition duration-200 hover:border-[#00FFB3]/40 hover:text-[#00FFB3]"
        >
          <span className="text-sm leading-none">{c.icon}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}
