"use client";

interface EmptyStateProps {
  onSampleClick: (text: string) => void;
}

const SAMPLES = [
  {
    icon: "🦅",
    title: "Laporan observasi satwa",
    preview: "Saya mengamati elang jawa di lereng Semeru...",
    full: "Saya mengamati burung elang jawa (Nisaetus bartelsi) di lereng Gunung Semeru pada ketinggian 1800 mdpl. Kondisi habitat: hutan primer campuran, tutupan kanopi 80%. Durasi observasi: 2 jam. Jumlah individu: 1 ekor dewasa jantan. Perilaku: berburu, bertengger di pohon rasamala. Tolong bantu saya susun laporan observasi berbasis bukti ini.",
  },
  {
    icon: "🔬",
    title: "Laporan praktikum biologi",
    preview: "Hasil pengamatan sel bawang merah di bawah mikroskop...",
    full: "Hasil praktikum pengamatan sel bawang merah (Allium cepa) menggunakan mikroskop cahaya perbesaran 400x. Terlihat: dinding sel jelas, sitoplasma granular, inti sel tidak selalu terlihat. Kondisi: preparat basah dengan larutan garam fisiologis. Tolong bantu saya buat laporan praktikum berbasis pengamatan ini.",
  },
  {
    icon: "📋",
    title: "Laporan KKN lingkungan",
    preview: "Data hasil survei kondisi sungai di Desa Tlogosari...",
    full: "Data survei kondisi Sungai Kaligarang di Kelurahan Tlogosari Kulon, Semarang. Tanggal: 15 Mei 2026. Tim: 5 mahasiswa KKN. Temuan: kekeruhan tinggi (>50 NTU visual), sampah plastik di bantaran, tidak ada vegetasi riparian dalam radius 50m. Tidak ada pengujian laboratorium dilakukan. Tolong bantu saya susun laporan KKN lingkungan berbasis data ini.",
  },
] as const;

export function EmptyState({ onSampleClick }: EmptyStateProps) {
  return (
    <div className="w-full">
      <p className="text-sm text-white/40 mb-8">
        Tempel catatan lapangan, bahan observasi, atau data praktikum.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
        {SAMPLES.map((s) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onSampleClick(s.full)}
            className="group flex flex-col items-start gap-2 rounded-xl border border-[#00FFB3]/10 bg-white/[0.025] p-4 text-left transition duration-200 hover:border-[#00FFB3]/25 hover:bg-white/[0.04] cursor-pointer"
          >
            <span className="text-xl">{s.icon}</span>
            <span className="text-xs font-semibold text-white/70 group-hover:text-white/90 transition-colors">
              {s.title}
            </span>
            <span className="text-[11px] text-white/35 leading-relaxed line-clamp-2">
              {s.preview}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
