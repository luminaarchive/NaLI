// One-time backfill: add structured trust metadata to legacy source entries.
// Idempotent — only fills missing fields. Safe to re-run.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "sources");
const CHECKED = "2026-06-12";

const REL_BY_TYPE = {
  jurnal: "high", laporan: "high", arsip: "primary",
  buku: "medium", media: "contextual", lainnya: "contextual",
};
const LIMIT_BY_TYPE = {
  jurnal: "Akses teks penuh sebagian artikel mungkin berbayar; gunakan abstrak/laporan terbuka bila perlu.",
  laporan: "Angka dan status dapat berubah pada penilaian berikutnya — selalu rujuk versi terbaru.",
  arsip: "Arsip membawa bias zaman dan pembuatnya; dibaca kritis, bukan sebagai kebenaran netral.",
  buku: "Berisi interpretasi penulis; klaim kunci sebaiknya dibandingkan dengan sumber primer.",
  media: "Reportase, bukan sumber primer — untuk konteks; telusuri ke dokumen aslinya.",
  lainnya: "Periksa keandalan dan tanggal sumber sebelum dikutip sebagai bukti.",
};

let changed = 0;
for (const file of fs.readdirSync(DIR)) {
  if (!/\.mdx?$/.test(file)) continue;
  const full = path.join(DIR, file);
  const { data, content } = matter(fs.readFileSync(full, "utf8"));
  let touched = false;

  if (!data.checkedAt) { data.checkedAt = CHECKED; touched = true; }
  if (!data.reliabilityLevel) {
    data.reliabilityLevel = REL_BY_TYPE[data.type] ?? "contextual";
    touched = true;
  }
  if (!data.topics) {
    const rt = (data.related_topic || "").trim();
    const topics = rt ? rt.split(/[,;]/).map((t) => t.trim()).filter(Boolean) : ["Indonesia"];
    data.topics = topics.length ? topics : ["Indonesia"];
    touched = true;
  }
  if (!data.limitations) {
    data.limitations = [LIMIT_BY_TYPE[data.type] ?? LIMIT_BY_TYPE.lainnya];
    touched = true;
  }

  if (touched) { fs.writeFileSync(full, matter.stringify(content, data)); changed++; }
}
console.log(`Backfilled ${changed} source file(s).`);
