import "server-only";
import { getAllArticles } from "./content";
import type { GeoMarker } from "@/types/geo";

/**
 * Curated gazetteer of well-known Indonesian places, with real coordinates
 * [longitude, latitude]. Keys are lowercase substrings matched against an
 * article's slug, title, tags, and location labels. Only matches with a known
 * coordinate are plotted, so no location is invented.
 */
const GAZETTEER: { keys: string[]; label: string; lon: number; lat: number }[] = [
  { keys: ["krakatau", "anak krakatau", "selat sunda"], label: "Krakatau, Selat Sunda", lon: 105.42, lat: -6.1 },
  { keys: ["tambora"], label: "Tambora, Sumbawa", lon: 118.0, lat: -8.25 },
  { keys: ["toba"], label: "Danau Toba, Sumatra", lon: 98.9, lat: 2.6 },
  { keys: ["merapi"], label: "Merapi, Jawa Tengah", lon: 110.45, lat: -7.54 },
  { keys: ["samalas", "rinjani"], label: "Rinjani, Lombok", lon: 116.45, lat: -8.41 },
  { keys: ["mahakam", "pesut"], label: "Sungai Mahakam, Kalimantan Timur", lon: 116.0, lat: 0.4 },
  { keys: ["ujung kulon", "badak jawa"], label: "Ujung Kulon, Banten", lon: 105.35, lat: -6.75 },
  { keys: ["jakarta", "batavia"], label: "Jakarta", lon: 106.83, lat: -6.2 },
  { keys: ["borobudur"], label: "Borobudur, Jawa Tengah", lon: 110.2, lat: -7.61 },
  { keys: ["kutai", "yupa", "mulawarman"], label: "Kutai, Kalimantan Timur", lon: 116.7, lat: 0.0 },
  { keys: ["tapanuli", "orangutan tapanuli"], label: "Tapanuli, Sumatra Utara", lon: 99.3, lat: 1.5 },
  { keys: ["komodo"], label: "Komodo, Nusa Tenggara Timur", lon: 119.5, lat: -8.55 },
  { keys: ["raja ampat"], label: "Raja Ampat, Papua Barat", lon: 130.5, lat: -0.5 },
  { keys: ["leuser"], label: "Ekosistem Leuser, Aceh", lon: 97.5, lat: 3.7 },
  { keys: ["citarum"], label: "Sungai Citarum, Jawa Barat", lon: 107.4, lat: -6.9 },
  { keys: ["banda"], label: "Kepulauan Banda, Maluku", lon: 129.9, lat: -4.52 },
  { keys: ["mangrove segara anakan", "segara anakan"], label: "Segara Anakan, Jawa Tengah", lon: 108.8, lat: -7.7 },
  { keys: ["harimau jawa"], label: "Jawa", lon: 110.0, lat: -7.3 },
];

function haystack(a: { slug: string; title: string; tags?: string[]; locationLabels?: string[] }): string {
  return [a.slug, a.title, ...(a.tags ?? []), ...(a.locationLabels ?? [])].join(" ").toLowerCase();
}

/**
 * Modul 3: build geo markers from real articles that match a known place.
 */
export async function getGeoMarkers(): Promise<GeoMarker[]> {
  const articles = await getAllArticles();
  const markers: GeoMarker[] = [];

  for (const a of articles) {
    const hay = haystack(a);
    const place = GAZETTEER.find((g) => g.keys.some((k) => hay.includes(k)));
    if (!place) continue;
    markers.push({
      id: a.slug,
      coordinates: [place.lon, place.lat],
      title: a.title,
      kategori: a.category,
      linkedArticleSlug: a.slug,
      sourceCount: (a.sourceIds ?? []).length,
      placeLabel: place.label,
    });
  }

  return markers;
}
