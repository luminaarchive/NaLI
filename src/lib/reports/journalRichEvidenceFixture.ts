import type { EvidenceRow } from "./reportGenerator";

export interface LeafReplicate {
  id: string;
  lengthCm: number;
  widthCm: number;
  petioleLengthCm: number;
  marginType: string;
  shape: string;
  colorNote: string;
}

export interface LeafGroup {
  name: string;
  shape: string;
  marginType: string;
  colorNote: string;
  replicates: LeafReplicate[];
  stats: {
    meanLength: number;
    meanWidth: number;
    meanPetiole: number;
  };
}

export interface FigureInput {
  id: string;
  title: string;
  caption: string;
  type: string;
  label: string;
  status: string;
}

export interface FixtureReference {
  key: string;
  citationKey: string;
  rawText: string;
}

export interface RichEvidenceFixture {
  topic: string;
  location: string;
  dateTime: string;
  lightingCondition: string;
  observerNote: string;
  groups: LeafGroup[];
  figures: FigureInput[];
  references: FixtureReference[];
  evidenceStatus: {
    label: string;
    isVerified: boolean;
    verificationStatusText: string;
  };
}

export const richEvidenceFixture: RichEvidenceFixture = {
  topic: "Pengamatan morfologi daun di area kampus",
  location: "Sekitar halaman kampus",
  dateTime: "2026-05-25 pagi hari",
  lightingCondition: "Cahaya matahari pagi cerah (morning light)",
  observerNote: "Pengamatan langsung menggunakan kaca pembesar dan alat ukur manual penggaris berskala milimeter.",
  groups: [
    {
      name: "Daun A",
      shape: "Lonjong",
      marginType: "Rata",
      colorNote: "Hijau tua",
      replicates: [
        { id: "A1", lengthCm: 12.4, widthCm: 5.2, petioleLengthCm: 2.1, marginType: "Rata", shape: "Lonjong", colorNote: "Hijau tua" },
        { id: "A2", lengthCm: 11.9, widthCm: 4.8, petioleLengthCm: 1.9, marginType: "Rata", shape: "Lonjong", colorNote: "Hijau tua" },
        { id: "A3", lengthCm: 12.8, widthCm: 5.5, petioleLengthCm: 2.2, marginType: "Rata", shape: "Lonjong", colorNote: "Hijau tua" }
      ],
      stats: {
        meanLength: 12.37,
        meanWidth: 5.17,
        meanPetiole: 2.07
      }
    },
    {
      name: "Daun B",
      shape: "Menjari",
      marginType: "Bergerigi",
      colorNote: "Hijau muda",
      replicates: [
        { id: "B1", lengthCm: 8.5, widthCm: 9.2, petioleLengthCm: 4.5, marginType: "Bergerigi", shape: "Menjari", colorNote: "Hijau muda" },
        { id: "B2", lengthCm: 7.9, widthCm: 8.8, petioleLengthCm: 4.1, marginType: "Bergerigi", shape: "Menjari", colorNote: "Hijau muda" },
        { id: "B3", lengthCm: 8.8, widthCm: 9.5, petioleLengthCm: 4.8, marginType: "Bergerigi", shape: "Menjari", colorNote: "Hijau muda" }
      ],
      stats: {
        meanLength: 8.4,
        meanWidth: 9.17,
        meanPetiole: 4.47
      }
    }
  ],
  figures: [
    {
      id: "Fig1",
      title: "Figure 1: Leaf A/B Comparative Visual Plate",
      caption: "Visual comparison of Daun A (ovate/lonjong with entire margin) and Daun B (palmate/menjari with serrated margin). Labeled for morphological comparison.",
      type: "comparison",
      label: "synthetic QA placeholder",
      status: "local QA fixture"
    },
    {
      id: "Fig2",
      title: "Figure 2: Measurement Workflow & Sample Replicates Diagram",
      caption: "Schematic representation of leaf parameter measurements (length, width, and petiole length) across three replicates per group.",
      type: "workflow",
      label: "synthetic QA placeholder",
      status: "local QA fixture"
    }
  ],
  references: [
    {
      key: "botany_guide_2024",
      citationKey: "[Ref: Botany Guide, 2024]",
      rawText: "User-supplied reference placeholder: Botany morphology practical guide, no DOI supplied. [local QA fixture, not externally verified]"
    },
    {
      key: "flora_kampus_2025",
      citationKey: "[Ref: Flora Kampus, 2025]",
      rawText: "User-supplied reference placeholder: Flora dan Morfologi Tumbuhan Kampus, no DOI supplied. [local QA fixture, not externally verified]"
    }
  ],
  evidenceStatus: {
    label: "user-supplied-style fixture",
    isVerified: false,
    verificationStatusText: "not externally verified (source verification inactive; local QA fixture)"
  }
};

export function convertFixtureToEvidenceRows(location: string): EvidenceRow[] {
  return [
    {
      id: "EV-01",
      material_type: "catatan",
      summary: "Daun A: lonjong, tepi rata, hijau tua (replicates: A1, A2, A3)",
      user_provided: true,
      verification_status: "user-supplied-style fixture (not externally verified; source verification inactive)"
    },
    {
      id: "EV-02",
      material_type: "catatan",
      summary: "Daun B: menjari, tepi bergerigi, hijau muda (replicates: B1, B2, B3)",
      user_provided: true,
      verification_status: "user-supplied-style fixture (not externally verified; source verification inactive)"
    },
    {
      id: "EV-03",
      material_type: "lokasi",
      summary: location || "Sekitar halaman kampus",
      user_provided: true,
      verification_status: "user-supplied-style fixture (not externally verified; source verification inactive)"
    }
  ];
}
