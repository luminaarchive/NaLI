import type { ReportRequest } from "./reportGenerator";

export interface JournalQualityResult {
  score: number;
  level: "weak" | "basic" | "good" | "strong";
  imradComplete: boolean;
  missingSections: string[];
  citationIntegrity: "safe" | "warning" | "blocked";
  evidenceSufficiency: "weak" | "moderate" | "strong";
  publicationClaimAllowed: false;
  recommendedFixes: string[];
}

export function evaluateJournalQuality(
  input: ReportRequest,
  candidate: any
): JournalQualityResult {
  const missingSections: string[] = [];
  const recommendedFixes: string[] = [];

  if (!candidate || typeof candidate !== "object") {
    return {
      score: 0,
      level: "weak",
      imradComplete: false,
      missingSections: ["Draf tidak dapat dimuat"],
      citationIntegrity: "warning",
      evidenceSufficiency: "weak",
      publicationClaimAllowed: false,
      recommendedFixes: ["Pastikan input dan draf tersedia."],
    };
  }

  // 1. Check IMRaD completeness (Intro, Methods, Results, Discussion, Conclusion)
  const introText = candidate.introduction || "";
  const methodsText = candidate.methods || "";
  const resultsText = candidate.results || "";
  const discussionText = candidate.discussion || "";
  const conclusionText = candidate.conclusion || "";

  let introOk = introText.trim().length > 50;
  let methodsOk = methodsText.trim().length > 50;
  let resultsOk = resultsText.trim().length > 50;
  let discussionOk = discussionText.trim().length > 50;
  let conclusionOk = conclusionText.trim().length > 50;

  if (!introOk) missingSections.push("Introduction (Pendahuluan)");
  if (!methodsOk) missingSections.push("Methods (Metode)");
  if (!resultsOk) missingSections.push("Results (Hasil)");
  if (!discussionOk) missingSections.push("Discussion (Pembahasan)");
  if (!conclusionOk) missingSections.push("Conclusion (Kesimpulan)");

  const imradComplete = introOk && methodsOk && resultsOk && discussionOk && conclusionOk;

  // 2. Citation Integrity
  // If user provided sourceUrls or referencesSuppliedByUser does not mention empty/none, it's safe
  const hasSuppliedRefs = Array.isArray(input.sourceUrls) && input.sourceUrls.length > 0;
  const citationIntegrity: "safe" | "warning" | "blocked" = hasSuppliedRefs ? "safe" : "warning";

  if (!hasSuppliedRefs) {
    recommendedFixes.push("Sediakan referensi/sumber pustaka pendukung untuk meningkatkan kejujuran ilmiah.");
  }

  // 3. Evidence Sufficiency
  const evidenceRows = candidate.evidenceTable || [];
  let evidenceSufficiency: "weak" | "moderate" | "strong" = "weak";
  if (evidenceRows.length >= 3) {
    evidenceSufficiency = "strong";
  } else if (evidenceRows.length >= 1) {
    evidenceSufficiency = "moderate";
  }

  if (evidenceRows.length === 0) {
    recommendedFixes.push("Tambahkan tabel bukti fisik pendukung (catatan, lokasi, atau deskripsi berkas).");
  }

  // 4. Score calculation
  let score = 30; // base score

  if (introOk) score += 6;
  if (methodsOk) score += 6;
  if (resultsOk) score += 6;
  if (discussionOk) score += 6;
  if (conclusionOk) score += 6;

  if (imradComplete) {
    score += 10;
  } else {
    if (!introOk) recommendedFixes.push("Lengkapi bagian Introduction (Pendahuluan) dengan minimal 50 karakter.");
    if (!methodsOk) recommendedFixes.push("Detailkan bagian Methods (Metode) dengan minimal 50 karakter.");
    if (!resultsOk) recommendedFixes.push("Lengkapi deskripsi Results (Hasil) dengan minimal 50 karakter.");
    if (!discussionOk) recommendedFixes.push("Lengkapi pembahasan Discussion (Pembahasan) dengan minimal 50 karakter.");
    if (!conclusionOk) recommendedFixes.push("Tambahkan ringkasan Conclusion (Kesimpulan) dengan minimal 50 karakter.");
  }

  // Evidence points
  if (evidenceSufficiency === "strong") score += 15;
  else if (evidenceSufficiency === "moderate") score += 10;

  // Citation integrity points
  if (citationIntegrity === "safe") score += 10;

  // Limitations points
  const limitationsText = candidate.limitations || "";
  if (limitationsText.trim().length > 30) {
    score += 15;
  } else {
    recommendedFixes.push("Tambahkan bagian Batasan data/bukti (limitations) secara lebih spesifik.");
  }

  // Cap score for thin inputs
  const combinedInputLength = (input.mainText || "").trim().length + (input.topic || "").trim().length;
  if (combinedInputLength < 100) {
    score = Math.min(score, 55);
  }

  // Ensure bounds
  score = Math.max(0, Math.min(100, score));

  // Determine Level
  let level: "weak" | "basic" | "good" | "strong" = "weak";
  if (score >= 80) {
    level = "strong";
  } else if (score >= 60) {
    level = "good";
  } else if (score >= 40) {
    level = "basic";
  }

  return {
    score,
    level,
    imradComplete,
    missingSections,
    citationIntegrity,
    evidenceSufficiency,
    publicationClaimAllowed: false,
    recommendedFixes,
  };
}
