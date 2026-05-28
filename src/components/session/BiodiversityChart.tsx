"use client";
// Lightweight chart component for biodiversity data visualization in session results.
// Renders bar charts and simple stat cards from structured data in assistant messages.
// No heavy chart library — uses CSS-based bar charts for zero bundle impact.

interface SpeciesEntry {
  name: string;
  count: number;
  status?: "CR" | "EN" | "VU" | "NT" | "LC" | "DD" | "unknown";
}

interface BiodiversityData {
  title?: string;
  species: SpeciesEntry[];
  location?: string;
  date?: string;
}

const STATUS_COLORS: Record<string, string> = {
  CR: "#ff4444",
  EN: "#ff8800",
  VU: "#ffcc00",
  NT: "#88cc44",
  LC: "#00FFB3",
  DD: "#a1b3a8",
  unknown: "#4a6455",
};

const STATUS_LABELS: Record<string, string> = {
  CR: "Kritis",
  EN: "Terancam",
  VU: "Rentan",
  NT: "Hampir Terancam",
  LC: "Berisiko Rendah",
  DD: "Data Kurang",
  unknown: "Tidak Diketahui",
};

export function BiodiversityChart({ data }: { data: BiodiversityData }) {
  const max = Math.max(...data.species.map(s => s.count), 1);

  return (
    <div className="bg-[#0b1a12] border border-[#14261c] rounded-2xl p-5 my-3">
      {data.title && (
        <h4 className="font-serif text-[#f5f0e8] font-semibold mb-1 text-sm">{data.title}</h4>
      )}
      {(data.location || data.date) && (
        <p className="text-[#a1b3a8]/60 text-xs mb-4">
          {data.location && `📍 ${data.location}`}
          {data.location && data.date && " · "}
          {data.date && `📅 ${data.date}`}
        </p>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center">
          <div className="font-serif text-2xl font-bold text-[#00FFB3]">{data.species.length}</div>
          <div className="text-xs text-[#a1b3a8]/60">Spesies</div>
        </div>
        <div className="text-center">
          <div className="font-serif text-2xl font-bold text-[#f5f0e8]">
            {data.species.reduce((s, e) => s + e.count, 0)}
          </div>
          <div className="text-xs text-[#a1b3a8]/60">Total Individu</div>
        </div>
        <div className="text-center">
          <div className="font-serif text-2xl font-bold text-[#ff8800]">
            {data.species.filter(s => ["CR","EN","VU"].includes(s.status ?? "")).length}
          </div>
          <div className="text-xs text-[#a1b3a8]/60">Dilindungi</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex flex-col gap-2">
        {data.species.slice(0, 10).map(entry => {
          const pct = (entry.count / max) * 100;
          const color = STATUS_COLORS[entry.status ?? "unknown"];
          return (
            <div key={entry.name} className="flex items-center gap-3">
              <div className="w-32 text-xs text-[#a1b3a8] truncate flex-shrink-0" title={entry.name}>
                {entry.name}
              </div>
              <div className="flex-1 bg-[#060b08] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <div className="text-xs text-[#a1b3a8] w-8 text-right flex-shrink-0">{entry.count}</div>
              {entry.status && entry.status !== "unknown" && (
                <div
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
                  title={STATUS_LABELS[entry.status]}
                >
                  {entry.status}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
