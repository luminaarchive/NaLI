import type { GeoMarker } from "@/types/geo";

/**
 * Modul 3: a dependency-free, privacy-first schematic locator map. No external
 * tiles, no tracker, no map library. Markers are plotted by a simple
 * equirectangular projection of real coordinates onto an SVG. It is a schematic
 * locator, not a survey-grade coastline, and says so plainly.
 */

// projection window over the Indonesian archipelago
const LON_MIN = 94;
const LON_MAX = 142;
const LAT_MAX = 7;
const LAT_MIN = -12;
const W = 1000;
const H = 380;
const PAD = 40;

function project(lon: number, lat: number): [number, number] {
  const x = PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (W - PAD * 2);
  const y = PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (H - PAD * 2);
  return [x, y];
}

const REGIONS: { name: string; lon: number; lat: number }[] = [
  { name: "Sumatra", lon: 101, lat: 0.5 },
  { name: "Jawa", lon: 110, lat: -8.4 },
  { name: "Kalimantan", lon: 114, lat: 1.2 },
  { name: "Sulawesi", lon: 121, lat: -1.8 },
  { name: "Maluku", lon: 128, lat: -3.2 },
  { name: "Papua", lon: 137, lat: -4.8 },
  { name: "Nusa Tenggara", lon: 121, lat: -9.2 },
];

const FILL: Record<string, string> = {
  alam: "#2DD4A7",
  sejarah: "#3B82F6",
  investigasi: "#F97316",
  "catatan-lapangan": "#9CA3AF",
};

export function IndonesiaMap({ markers }: { markers: GeoMarker[] }) {
  // spread markers that land on the same coordinate so they do not overlap
  const seen = new Map<string, number>();

  return (
    <figure className="border border-dashed border-ink/40 bg-paper">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Peta skematis lokasi liputan NaLI di Indonesia"
      >
        {/* frame */}
        <rect x="1" y="1" width={W - 2} height={H - 2} fill="none" stroke="rgb(var(--c-ink) / 0.18)" strokeDasharray="4 4" />

        {/* region labels */}
        {REGIONS.map((r) => {
          const [x, y] = project(r.lon, r.lat);
          return (
            <text
              key={r.name}
              x={x}
              y={y}
              textAnchor="middle"
              className="fill-ink/30"
              style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13, letterSpacing: 1 }}
            >
              {r.name.toUpperCase()}
            </text>
          );
        })}

        {/* markers */}
        {markers.map((m) => {
          const key = m.coordinates.join(",");
          const n = seen.get(key) ?? 0;
          seen.set(key, n + 1);
          const [bx, by] = project(m.coordinates[0], m.coordinates[1]);
          const angle = n * 1.7;
          const radius = n === 0 ? 0 : 9 + n * 2;
          const x = bx + Math.cos(angle) * radius;
          const y = by + Math.sin(angle) * radius;
          return (
            <a key={m.id} href={`/articles/${m.linkedArticleSlug}`} aria-label={`${m.title}, ${m.placeLabel}`}>
              <circle cx={x} cy={y} r={6} fill={FILL[m.kategori] ?? "#6B6B6B"} stroke="rgb(var(--c-paper))" strokeWidth={1.5}>
                <title>
                  {m.title} ({m.placeLabel}) , {m.sourceCount} sumber
                </title>
              </circle>
            </a>
          );
        })}
      </svg>
      <figcaption className="border-t border-dashed border-ink/40 p-3 font-mono text-[0.7rem] leading-relaxed text-gray">
        Peta skematis (locator), bukan peta survei. Titik diletakkan dari koordinat
        nyata tempat-tempat yang dikenal; tulisan yang lokasinya belum jelas tidak
        diplot. Klik titik untuk membuka artikelnya.
      </figcaption>
    </figure>
  );
}
