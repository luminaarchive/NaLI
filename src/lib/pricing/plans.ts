export interface Plan {
  id: "free" | "starter" | "pro" | "max";
  name: string;
  priceLabel: string;
  priceAmount: number;
  credits: number;
  description: string;
  modes: string[];
  features: string[];
  limitations?: string[];
  cta: string;
  popular?: boolean;
}

export interface TopUpPack {
  id: "mini" | "student" | "scholar" | "pro_boost";
  name: string;
  priceLabel: string;
  priceAmount: number;
  credits: number;
  description: string;
}

export interface ActionCost {
  actionType: string;
  credits: number;
  label: string;
}

export const PLAN_CATALOG: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "Rp0",
    priceAmount: 0,
    credits: 30,
    description: "Untuk mencoba NaLI",
    modes: ["Fast Mode saja"],
    features: [
      "Fast Mode preview",
      "Draf pendek",
      "Peringatan bukti dasar",
      "Tidak termasuk ekspor PDF"
    ],
    cta: "Mulai Gratis"
  },
  {
    id: "starter",
    name: "Starter",
    priceLabel: "Rp49.000 / bln",
    priceAmount: 49000,
    credits: 300,
    description: "Untuk laporan sederhana & tugas mahasiswa ringan",
    modes: ["Fast Mode", "Advanced Report Mode terbatas"],
    features: [
      "Fast Mode",
      "Advanced Report Mode terbatas",
      "Laporan dasar",
      "Akses ekspor PDF",
      "Template dasar"
    ],
    cta: "Pilih Starter"
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "Rp149.000 / bln",
    priceAmount: 149000,
    credits: 1200,
    description: "Untuk laporan lebih kuat & alur kerja akademis",
    modes: ["Fast Mode", "Advanced Report Mode"],
    features: [
      "Fast Mode",
      "Advanced Report Mode",
      "Penyusunan laporan terstruktur",
      "Pemeriksaan bukti lebih kuat",
      "Draf lebih panjang",
      "Pemrosesan prioritas"
    ],
    cta: "Pilih Pro",
    popular: true
  },
  {
    id: "max",
    name: "Max",
    priceLabel: "Rp399.000 / bln",
    priceAmount: 399000,
    credits: 4000,
    description: "Untuk laporan berat, catatan lapangan & riset mendalam",
    modes: ["Fast Mode", "Advanced Report Mode", "Deep Intelligence Mode terbatas"],
    features: [
      "Fast Mode",
      "Advanced Report Mode",
      "Deep Intelligence Mode terbatas (early access)",
      "Mendukung laporan panjang",
      "Analisis laporan lapangan ringan",
      "Matriks literatur dasar (saat aktif)",
      "Prioritas tertinggi"
    ],
    cta: "Pilih Max"
  }
];

export const TOP_UP_PACKS: TopUpPack[] = [
  {
    id: "mini",
    name: "Mini",
    priceLabel: "Rp15.000",
    priceAmount: 15000,
    credits: 100,
    description: "Tambahan cepat untuk refinement kecil"
  },
  {
    id: "student",
    name: "Student",
    priceLabel: "Rp35.000",
    priceAmount: 35000,
    credits: 300,
    description: "Tambahan pas untuk tugas kuliah"
  },
  {
    id: "scholar",
    name: "Scholar",
    priceLabel: "Rp75.000",
    priceAmount: 75000,
    credits: 800,
    description: "Ideal untuk draf riset yang lebih panjang"
  },
  {
    id: "pro_boost",
    name: "Pro Boost",
    priceLabel: "Rp150.000",
    priceAmount: 150000,
    credits: 1800,
    description: "Tambahan besar untuk proyek intensif"
  }
];

export const CREDIT_ACTION_COSTS: Record<string, ActionCost> = {
  quick_answer: { actionType: "quick_answer", credits: 2, label: "Outline / Jawaban Cepat" },
  rewrite: { actionType: "rewrite", credits: 5, label: "Penyempurnaan / Tulis Ulang Draf" },
  basic_draft: { actionType: "basic_draft", credits: 10, label: "Panduan Awal / Draf Dasar" },
  standard_report: { actionType: "standard_report", credits: 20, label: "Penyusunan Draf Laporan" },
  evidence_check: { actionType: "evidence_check", credits: 10, label: "Pemeriksaan Bukti & Sumber" },
  markdown_export: { actionType: "markdown_export", credits: 5, label: "Ekspor Markdown" },
  pdf_export: { actionType: "pdf_export", credits: 15, label: "Ekspor PDF" },
  quality_upgrade: { actionType: "quality_upgrade", credits: 15, label: "Tinjauan Kualitas Laporan" },
  scholar_draft: { actionType: "scholar_draft", credits: 40, label: "Draf Akademis Berat" },
  literature_matrix_lite: { actionType: "literature_matrix_lite", credits: 60, label: "Matriks Literatur Ringan" },
  field_report: { actionType: "field_report", credits: 80, label: "Laporan Observasi Lapangan Lengkap" },
  long_report: { actionType: "long_report", credits: 120, label: "Laporan NGO/CSR Panjang" }
};

export function getEstimatedCreditCost(actionType: string): number {
  return CREDIT_ACTION_COSTS[actionType]?.credits ?? 5;
}

export function getEstimatedCreditCostFromQuery(query: string): number {
  const lowercaseQuery = query.toLowerCase();

  if (lowercaseQuery.includes("literature matrix") || lowercaseQuery.includes("matriks literatur")) {
    return CREDIT_ACTION_COSTS.literature_matrix_lite.credits;
  }
  if (lowercaseQuery.includes("scholar") || lowercaseQuery.includes("akademis")) {
    return CREDIT_ACTION_COSTS.scholar_draft.credits;
  }
  if (lowercaseQuery.includes("kualitas") || lowercaseQuery.includes("quality")) {
    return CREDIT_ACTION_COSTS.quality_upgrade.credits;
  }
  if (lowercaseQuery.includes("bukti") || lowercaseQuery.includes("sumber") || lowercaseQuery.includes("evidence")) {
    return CREDIT_ACTION_COSTS.evidence_check.credits;
  }
  if (lowercaseQuery.includes("outline") || lowercaseQuery.includes("kerangka")) {
    return CREDIT_ACTION_COSTS.quick_answer.credits;
  }
  if (
    lowercaseQuery.includes("kesimpulan") ||
    lowercaseQuery.includes("ringkas") ||
    lowercaseQuery.includes("formal") ||
    lowercaseQuery.includes("perpendek") ||
    lowercaseQuery.includes("perpanjang")
  ) {
    return CREDIT_ACTION_COSTS.rewrite.credits;
  }

  // Default to standard rewrite/refinement cost
  return CREDIT_ACTION_COSTS.rewrite.credits;
}

export function getPlanById(planId: string): Plan | undefined {
  return PLAN_CATALOG.find((p) => p.id === planId);
}

export function getTopUpPackById(packId: string): TopUpPack | undefined {
  return TOP_UP_PACKS.find((p) => p.id === packId);
}
