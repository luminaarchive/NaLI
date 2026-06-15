/**
 * NaLI V2, Modul 3: geospatial markers. Each marker plots a real article onto a
 * known place whose coordinates come from a curated gazetteer, never guessed. An
 * article that does not match a known place is simply not plotted.
 */
export interface GeoMarker {
  id: string;
  /** [longitude, latitude] */
  coordinates: [number, number];
  title: string;
  kategori: string;
  linkedArticleSlug: string;
  sourceCount: number;
  placeLabel: string;
}
