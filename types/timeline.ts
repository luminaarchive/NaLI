/**
 * NaLI V2, Modul 4: Historical Timeline.
 *
 * A timeline event is derived from a real article that carries an explicit year
 * signal (in its title, tags, or slug). Events without a verifiable year are not
 * placed on the timeline, so nothing is guessed.
 */
export interface TimelineEvent {
  id: string;
  tahun: number;
  peristiwa: string;
  ringkasan?: string;
  kategori: string;
  articleSlug: string;
  sumberId: string[];
}
