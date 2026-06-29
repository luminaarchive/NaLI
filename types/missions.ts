/**
 * NaLI V2, Modul 5: Research Missions. Open collaboration on real research gaps,
 * without account registration. Numeric fields report the honest current state
 * (zero contributors until people actually contribute); they are never padded.
 */
export interface MissionSubmission {
  tanggal: string;
  deskripsi: string;
  status: "approved" | "review";
}

export interface ResearchMission {
  id: string;
  judul: string;
  deskripsi: string;
  status: "aktif" | "selesai";
  progressPercentage: number;
  kebutuhanBukti: string[];
  kontributor: {
    peneliti: number;
    pembaca: number;
    penerjemah: number;
  };
  logSubmission: MissionSubmission[];
  /**
   * Provenance. "editorial" = authored by NaLI (static JSON). "lab" = promoted
   * from an Internal Lab lead (Step 3.4); these render a "from Lab investigation"
   * badge and are framed as open questions, never claims.
   */
  source?: "editorial" | "lab";
  /** Originating lab_leads id when source === "lab" (traceability only). */
  leadId?: number | null;
}
