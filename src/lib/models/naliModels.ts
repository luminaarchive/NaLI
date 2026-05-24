export interface NaliModel {
  id: "peregrine" | "obsidian" | "zephyr";
  label: string;
  shortDescription: string;
  intent: string;
  safeCapabilities: string[];
  forbiddenClaims: string[];
}

export const naliModels: NaliModel[] = [
  {
    id: "peregrine",
    label: "Peregrine",
    shortDescription: "Fast starter model for quick drafts and early structure.",
    intent: "Struktur draf awal cepat, rendah friksi, pembantu belajar ringkas.",
    safeCapabilities: [
      "Struktur draf cepat",
      "Format belajar ringkas",
      "Penyusunan awal instan berbasis bahan",
    ],
    forbiddenClaims: [
      "akurasi tertinggi",
      "bukti terverifikasi resmi",
      "analisis profesional matang",
      "pemeriksaan lapangan otomatis",
    ],
  },
  {
    id: "obsidian",
    label: "Obsidian",
    shortDescription: "Evidence-aware model for stronger structure, claim boundaries, and safer reasoning.",
    intent: "Pemisahan batas klaim, penandaan ketidakpastian bukti, peringatan draf.",
    safeCapabilities: [
      "Batas klaim bukti ketat",
      "Pemisahan temuan vs interpretasi",
      "Peringatan bukti lemah/tidak lengkap",
    ],
    forbiddenClaims: [
      "verifikasi lapangan resmi",
      "validasi institusi",
      "jaminan kebenaran ilmiah mutlak",
    ],
  },
  {
    id: "zephyr",
    label: "Zephyr",
    shortDescription: "Clear refinement model for natural flow, academic clarity, and user-context adaptation.",
    intent: "Penyelarasan draf natural, perapian alur bahasa akademik, slot konteks personal.",
    safeCapabilities: [
      "Penyelarasan alur draf (Natural Draft Pass)",
      "Peningkatan kejelasan akademik (Academic Clarity Pass)",
      "Adaptasi konteks personal (Make It Mine / Voice Adapter)",
      "Penyusunan ulang berbasis bukti (Evidence-Safe Rewrite)",
    ],
    forbiddenClaims: [
      "Turnitin bypass",
      "Humanizer",
      "undetectable AI writing",
      "AI detector evasion",
      "plagiarism bypass",
      "evasi detektor",
      "skripsi otomatis lulus",
    ],
  },
];
