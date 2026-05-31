"use client";

interface EmptyStateProps {
  onSampleClick: (text: string) => void;
}

// Short, relatable starter prompts. Clicking pre-fills the composer and the
// user completes it. Keeps the first step effortless for field users.
const SAMPLES = [
  {
    icon: "🦅",
    label: "Saya melihat burung yang tidak biasa di hutan",
    fill: "Saya melihat burung yang tidak biasa di hutan. ",
  },
  {
    icon: "🐾",
    label: "Menemukan jejak besar di tepi sungai, ukuran sekitar 15 cm",
    fill: "Menemukan jejak besar di tepi sungai, ukuran sekitar 15 cm. ",
  },
  {
    icon: "🌿",
    label: "Survei transek vegetasi di gunung",
    fill: "Survei transek vegetasi di Gunung ",
  },
  {
    icon: "📊",
    label: "Data kamera trap dari 3 lokasi, 14 hari",
    fill: "Data kamera trap dari 3 lokasi selama 14 hari. ",
  },
] as const;

export function EmptyState({ onSampleClick }: EmptyStateProps) {
  return (
    <div className="w-full">
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onSampleClick(s.fill)}
            className="group flex cursor-pointer items-start gap-3 rounded-xl border border-[#00FFB3]/10 bg-white/[0.025] p-4 text-left transition duration-200 hover:border-[#00FFB3]/25 hover:bg-white/[0.04]"
          >
            <span className="text-xl leading-none">{s.icon}</span>
            <span className="text-sm leading-snug font-medium text-white/70 transition-colors group-hover:text-white/90">
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
