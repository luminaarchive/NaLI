import fs from "node:fs";
import path from "node:path";

export interface Correction {
  id: string;
  artikelSlug: string;
  artikelTitle: string;
  tanggalDiterima: string;
  tanggalDiperbaiki: string;
  klaimLama: string;
  klaimBaru: string;
  alasan: string;
  sumberKoreksi: string;
}

const DIR = path.join(process.cwd(), "content", "corrections");

/**
 * Public correction log (F6.1). Each correction is a JSON file in
 * content/corrections/. Returns newest first; an empty log is an honest state
 * (no corrections issued yet), not an error.
 */
export function getAllCorrections(): Correction[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Correction)
    .sort(
      (a, b) =>
        new Date(b.tanggalDiperbaiki).getTime() - new Date(a.tanggalDiperbaiki).getTime(),
    );
}
