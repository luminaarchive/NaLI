export type JournalModelId = "peregrine" | "obsidian" | "zephyr";

export interface JournalModelCapability {
  id: JournalModelId;
  tier: "starter" | "evidence_audit" | "premium";
  publicTitle: string;
  articleType: string;
  role: string;
  badge: string;
  visualVariant: "starter" | "audit" | "premium";
  pdfTarget: {
    publicPages?: [number, number];
    richFixturePages: [number, number];
  };
  docxTarget: {
    pages: [number, number];
  };
  maxTables: number;
  maxFigures: number;
  maxReferences: number;
  estimatedCredits: number;
  costLabel: "Starter" | "Evidence Audit" | "Premium";
  pricingReadinessNote: string;
  sectionTitles: string[];
  prohibitedSections: string[];
  upgradeNote?: string;
}

export const PRICING_READINESS_NOTE = "Credit purchase belum aktif; estimasi ini untuk kesiapan pricing.";

export const journalModelCapabilities: Record<JournalModelId, JournalModelCapability> = {
  peregrine: {
    id: "peregrine",
    tier: "starter",
    publicTitle: "Peregrine - Starter Cepat",
    articleType: "Starter Brief / Short Practicum Note",
    role: "Fast answer model and first-draft helper for quick understanding or rough practicum notes.",
    badge: "Starter Draft",
    visualVariant: "starter",
    pdfTarget: { publicPages: [2, 4], richFixturePages: [4, 5] },
    docxTarget: { pages: [4, 6] },
    maxTables: 2,
    maxFigures: 1,
    maxReferences: 2,
    estimatedCredits: 5,
    costLabel: "Starter",
    pricingReadinessNote: PRICING_READINESS_NOTE,
    sectionTitles: [
      "Starter Abstract",
      "Background for Practicum",
      "Simple Materials and Method",
      "Starter Results",
      "Short Limitation Checklist",
      "Next Observation Steps",
    ],
    prohibitedSections: [
      "Literature Review",
      "Evidence Sufficiency Assessment",
      "Data Risk Register",
      "Integrated Discussion",
      "Publication-style Revision Notes",
      "Reviewer-readiness Checklist",
    ],
    upgradeNote:
      "Output ini sengaja dibatasi sebagai starter draft. Untuk audit bukti penuh, risk register, dan tabel pengukuran lengkap, gunakan Obsidian. Untuk draft jurnal premium yang lebih panjang, lebih halus, dan lebih siap diedit, gunakan Zephyr.",
  },
  obsidian: {
    id: "obsidian",
    tier: "evidence_audit",
    publicTitle: "Obsidian - Evidence Audit",
    articleType: "Evidence Audit Article",
    role: "Evidence-aware model for claim boundaries, data risks, and research sanity checks.",
    badge: "Evidence Audit",
    visualVariant: "audit",
    pdfTarget: { richFixturePages: [7, 10] },
    docxTarget: { pages: [9, 12] },
    maxTables: 5,
    maxFigures: 2,
    maxReferences: 8,
    estimatedCredits: 20,
    costLabel: "Evidence Audit",
    pricingReadinessNote: PRICING_READINESS_NOTE,
    sectionTitles: [
      "Audit Abstract",
      "Scope and Claim Boundary",
      "Materials and Measurement Method",
      "Evidence Inventory",
      "Measurement Tables",
      "Evidence Sufficiency Assessment",
      "Cannot Be Concluded",
      "Data Risk Register",
      "Methodological Vulnerability",
      "Citation Boundary Audit",
      "Conservative Conclusion",
    ],
    prohibitedSections: [
      "Editorial Abstract",
      "Integrated Literature Framing",
      "Integrated Discussion",
      "Publication-style Revision Notes",
      "Reviewer-readiness Checklist",
    ],
    upgradeNote:
      "Untuk polish editorial akademik paling halus dan struktur jurnal paling lengkap, lanjutkan dengan Zephyr.",
  },
  zephyr: {
    id: "zephyr",
    tier: "premium",
    publicTitle: "Zephyr - Premium Journal Draft",
    articleType: "Premium Journal Article Draft",
    role: "Flagship editorial model for long-form international-style journal drafts.",
    badge: "Premium Journal Draft",
    visualVariant: "premium",
    pdfTarget: { richFixturePages: [10, 14] },
    docxTarget: { pages: [12, 16] },
    maxTables: 7,
    maxFigures: 3,
    maxReferences: 12,
    estimatedCredits: 40,
    costLabel: "Premium",
    pricingReadinessNote: PRICING_READINESS_NOTE,
    sectionTitles: [
      "Executive Editorial Summary",
      "Editorial Abstract",
      "Integrated Literature Framing",
      "Materials and Methods",
      "Results",
      "Integrated Discussion",
      "Evidence and Source Limits",
      "Premium Conclusion",
      "Publication-style Revision Notes",
      "Reviewer-readiness Checklist",
      "Annexure and References Presentation",
    ],
    prohibitedSections: [],
  },
};

export function getJournalModelCapability(modelId: string): JournalModelCapability {
  return journalModelCapabilities[
    (modelId as JournalModelId) in journalModelCapabilities ? (modelId as JournalModelId) : "peregrine"
  ];
}
