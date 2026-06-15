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
}
