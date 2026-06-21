/**
 * Real, dated anniversaries tied to existing NaLI articles. Used by the "Hari ini
 * dalam sejarah" cell, which only renders when today's month + day matches one of
 * these. Never invent a date: add an entry only when the day is well established
 * and an article covers it.
 */
export interface Anniversary {
  month: number; // 1-12
  day: number; // 1-31
  year: number;
  peristiwa: string;
  slug: string;
}

export const ANNIVERSARIES: Anniversary[] = [
  {
    month: 4,
    day: 10,
    year: 1815,
    peristiwa: "Gunung Tambora meletus, salah satu letusan terbesar dalam sejarah tercatat.",
    slug: "tambora-1815-iklim-dunia",
  },
  {
    month: 8,
    day: 27,
    year: 1883,
    peristiwa: "Krakatau meledak dahsyat dan memicu tsunami yang tercatat di banyak negara.",
    slug: "krakatau-1883-tsunami-arsip-global",
  },
  {
    month: 12,
    day: 22,
    year: 2018,
    peristiwa: "Longsoran tubuh Anak Krakatau memicu tsunami Selat Sunda tanpa peringatan.",
    slug: "anak-krakatau-2018-runtuhan-tsunami",
  },
];
