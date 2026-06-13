/**
 * Loads Jurnal publication records from the TypeScript batch files for Node
 * validators and the cover pipeline. Strips imports, inlines a trivial `p`,
 * transpiles, and imports via data URL. Attaches cover from pub-covers.json and
 * a generated metadata download, mirroring lib/jurnal.ts.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const PUB_DIR = path.join(process.cwd(), "content", "jurnal", "publications");
const MANIFEST = path.join(process.cwd(), "content", "jurnal", "pub-covers.json");

const P_SHIM = `const p = (e) => ({ ...e, id: e.id ?? e.slug });\n`;

function loadManifest() {
  if (!fs.existsSync(MANIFEST)) return {};
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

export function sourceCardFor(pub) {
  return {
    title: pub.title,
    sourceUrl: pub.sourceUrl,
    publisherOrInstitution: pub.publisherOrInstitution,
    license: "Tidak menampilkan gambar",
    displayBasis: "Cover asli tidak ditampilkan karena lisensi belum jelas",
    attribution: `${pub.publisherOrInstitution}${pub.year ? `, ${pub.year}` : ""}`,
    alt: `Kartu sumber untuk ${pub.title}`,
    caption: `${pub.title}. Cover asli tidak ditampilkan karena lisensi belum jelas.`,
    checkedAt: pub.checkedAt,
    isRealSourceCover: false,
    fallbackReason: "Cover belum diverifikasi lisensinya.",
  };
}

export function downloadFor(pub) {
  const metadataUrl = `/jurnal/${pub.slug}/download.txt`;
  if (pub.pdfUrl) {
    const kind =
      pub.publicationType === "dataset"
        ? "official_dataset"
        : ["report", "institutional_document", "archive_record", "museum_record"].includes(pub.publicationType)
          ? "official_document"
          : "official_pdf";
    return {
      primaryKind: kind,
      primaryUrl: pub.pdfUrl,
      label: kind === "official_dataset" ? "Unduh dataset" : "Download PDF",
      note: "Tautan ke PDF/dokumen resmi.",
      metadataUrl,
    };
  }
  return {
    primaryKind: "external_source_only",
    primaryUrl: pub.officialPageUrl ?? pub.sourceUrl,
    label: "Buka sumber asli",
    note: "PDF resmi tidak tersedia.",
    metadataUrl,
  };
}

export async function loadPublications() {
  if (!fs.existsSync(PUB_DIR)) return [];
  const covers = loadManifest();
  const files = fs.readdirSync(PUB_DIR).filter((f) => f.endsWith(".ts")).sort();
  const all = [];
  for (const file of files) {
    let src = fs.readFileSync(path.join(PUB_DIR, file), "utf8");
    src = src.replace(/^\s*import[^\n]*\n/gm, "");
    src = src.replace(/export\s+const\s+\w+\s*[:=][^=]*=/, "export default");
    src = P_SHIM + src;
    const js = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const url = "data:text/javascript;base64," + Buffer.from(js, "utf8").toString("base64");
    const mod = await import(url);
    const arr = mod.default;
    if (Array.isArray(arr)) {
      for (const pub of arr) {
        all.push({
          ...pub,
          cover: covers[pub.slug] ?? sourceCardFor(pub),
          download: downloadFor(pub),
          __file: `content/jurnal/publications/${file}`,
        });
      }
    }
  }
  return all;
}
