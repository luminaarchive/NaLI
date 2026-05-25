import { journalModelCapabilities, type JournalModelId } from "@/lib/reports/journalModelCapabilities";

export interface NaliModel {
  id: JournalModelId;
  label: string;
  shortDescription: string;
  intent: string;
  safeCapabilities: string[];
  limitations: string[];
  forbiddenClaims: string[];
  estimatedCredits: number;
  costLabel: "Starter" | "Evidence Audit" | "Premium";
  pricingReadinessNote: string;
  lockedWithoutEntitlement: boolean;
  accessLabel: "Tersedia" | "Terkunci";
}

export const CP1_PREMIUM_ACCESS_MESSAGE =
  "Akses model premium belum aktif; checkout/pembayaran tidak diaktifkan di CP1. Peregrine tetap tersedia sebagai starter.";

export const naliModels: NaliModel[] = [
  {
    id: "peregrine",
    label: "Peregrine — Starter Cepat",
    shortDescription:
      "Untuk jawaban cepat dan draft super ringkas. Cocok untuk mulai dari catatan mentah, tapi tidak sedalam Obsidian atau sehalus Zephyr.",
    intent: "Jawaban cepat dan draf awal yang sengaja dibatasi sebagai starter.",
    safeCapabilities: ["Jawaban cepat", "Draft pendek", "Praktikum dasar", "Batas bukti sederhana"],
    limitations: ["Tidak untuk jurnal panjang", "Tidak untuk audit bukti penuh", "Tidak untuk polish akademik premium"],
    forbiddenClaims: [
      "akurasi tertinggi",
      "bukti terverifikasi resmi",
      "analisis profesional matang",
      "pemeriksaan lapangan otomatis",
    ],
    estimatedCredits: journalModelCapabilities.peregrine.estimatedCredits,
    costLabel: journalModelCapabilities.peregrine.costLabel,
    pricingReadinessNote: journalModelCapabilities.peregrine.pricingReadinessNote,
    lockedWithoutEntitlement: false,
    accessLabel: "Tersedia",
  },
  {
    id: "obsidian",
    label: "Obsidian — Evidence Audit",
    shortDescription:
      "Untuk laporan yang jauh lebih kuat dari Peregrine: audit bukti, batas klaim, risiko data, dan bagian 'yang belum bisa disimpulkan'.",
    intent: "Audit bukti, risiko data, dan batas klaim untuk draf yang perlu ditelaah serius.",
    safeCapabilities: [
      "Evidence audit",
      "Risk register",
      "Claim boundary",
      "Measurement table",
      "Cannot-conclude section",
    ],
    limitations: ["Tidak sehalus Zephyr untuk narasi jurnal premium"],
    forbiddenClaims: ["verifikasi lapangan resmi", "validasi institusi", "jaminan kebenaran ilmiah mutlak"],
    estimatedCredits: journalModelCapabilities.obsidian.estimatedCredits,
    costLabel: journalModelCapabilities.obsidian.costLabel,
    pricingReadinessNote: journalModelCapabilities.obsidian.pricingReadinessNote,
    lockedWithoutEntitlement: true,
    accessLabel: "Terkunci",
  },
  {
    id: "zephyr",
    label: "Zephyr — Premium Journal Draft",
    shortDescription:
      "Model paling mahal dan paling kuat untuk draft jurnal panjang: narasi akademik paling halus, struktur paling rapi, dan editorial polish terbaik.",
    intent: "Draf jurnal premium panjang dengan alur akademik dan penyuntingan paling matang.",
    safeCapabilities: [
      "Full journal-style draft",
      "Integrated discussion",
      "Editorial polish",
      "Refined captions",
      "Premium structure",
      "Reviewer-readiness checklist",
    ],
    limitations: [],
    forbiddenClaims: [
      "Turnitin bypass",
      "Humanizer",
      "undetectable AI writing",
      "AI detector evasion",
      "plagiarism bypass",
      "evasi detektor",
      "skripsi otomatis lulus",
    ],
    estimatedCredits: journalModelCapabilities.zephyr.estimatedCredits,
    costLabel: journalModelCapabilities.zephyr.costLabel,
    pricingReadinessNote: journalModelCapabilities.zephyr.pricingReadinessNote,
    lockedWithoutEntitlement: true,
    accessLabel: "Terkunci",
  },
];
