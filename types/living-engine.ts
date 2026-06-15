/**
 * NaLI V2, Modul 1: Living Knowledge Engine.
 *
 * Live, aggregate snapshot of the evidence base, surfaced on the control-room
 * page. Every field is computed from real content (arsip sumber, jurnal,
 * articles, and their verification dates). Fields without a supporting system
 * yet (e.g. contributors) report zero honestly rather than a fabricated number.
 */
export interface LivingStats {
  /** All catalogued evidence units: arsip sumber + jurnal. */
  totalSumber: number;
  /** Jurnal publication records. */
  totalJurnal: number;
  /** Arsip sumber entries. */
  totalArsip: number;
  /** Published articles in the investigasi pillar. */
  totalInvestigasi: number;
  /** Active research missions (Modul 5; zero until that module ships). */
  misiAktifCount: number;
  /** Published articles whose confidence is below "terverifikasi kuat". */
  buktiDicariCount: number;
  /** Active contributors (zero until the contribution system ships). */
  kontributorAktifCount: number;
  /** Content items verified, updated, or logged today. */
  revisiHariIniCount: number;
  /** Most recent activity date across the evidence base (ISO YYYY-MM-DD). */
  lastUpdated: string;
}
