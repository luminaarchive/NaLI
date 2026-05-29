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
  abstractWordCount: number;
  keywordsCount: number;
  articleWordTarget: number;
  hasConservationImplication: boolean;
  hasMethodsReplicability: boolean;
  usesMetricOrSIUnitsWhenMeasurementsExist: boolean;
  scientificNameDiscipline: "ok" | "missing" | "not_applicable";
  ethicsSafetyNotePresent: boolean;
  referenceConsistencyStatus: "safe" | "warning" | "blocked";
  quantitativeEvidenceLevel: "none" | "descriptive" | "basic_quantitative" | "statistical";
}

function countWords(str: string): number {
  return (str || "").trim().split(/\s+/).filter(Boolean).length;
}

function hasFakeClaims(candidate: any, userInputText: string): boolean {
  const fields = [
    candidate.title,
    candidate.abstract,
    candidate.introduction,
    candidate.literatureReview,
    candidate.materialsAndMethods,
    candidate.results,
    candidate.discussion,
    candidate.conclusion,
    candidate.citationIntegrityNote,
    ...(candidate.keywords || []),
    ...(candidate.limitations || []),
    ...(candidate.futureResearch || []),
    ...(candidate.referencesSuppliedByUser || [])
  ].join(" ").toLowerCase();

  const fakePatterns = [
    /doi\.org\/10\.\d{4,9}\//i,
    /issn\s*\d{4}-\d{3}[\dX]/i,
    /peer-reviewed/i,
    /published/i,
    /accepted/i,
    /indexed/i,
    /siap\s+submit/i,
    /jurnal\s+final/i,
    /animal\s+conservation/i,
    /wiley/i,
    /zsl/i,
    /journal\s+of\s+wildlife\s+and\s+conservation/i,
    /e-palli/i
  ];

  return fakePatterns.some(pattern => {
    const hasInCandidate = pattern.test(fields);
    const hasInUserInput = pattern.test(userInputText.toLowerCase());
    return hasInCandidate && !hasInUserInput;
  });
}

export function evaluateJournalQuality(
  input: ReportRequest,
  candidate: any
): JournalQualityResult {
  const missingSections: string[] = [];
  const recommendedFixes: string[] = [];

  const emptyResult: JournalQualityResult = {
    score: 0,
    level: "weak",
    imradComplete: false,
    missingSections: ["Draf tidak dapat dimuat"],
    citationIntegrity: "warning",
    evidenceSufficiency: "weak",
    publicationClaimAllowed: false,
    recommendedFixes: ["Pastikan input dan draf tersedia."],
    abstractWordCount: 0,
    keywordsCount: 0,
    articleWordTarget: 0,
    hasConservationImplication: false,
    hasMethodsReplicability: false,
    usesMetricOrSIUnitsWhenMeasurementsExist: false,
    scientificNameDiscipline: "not_applicable",
    ethicsSafetyNotePresent: false,
    referenceConsistencyStatus: "warning",
    quantitativeEvidenceLevel: "none"
  };

  if (!candidate || typeof candidate !== "object") {
    return emptyResult;
  }

  const combinedUserInput = [
    input.title || "",
    input.topic || "",
    input.mainText || "",
    input.location || "",
    input.fileDescription || "",
    ...(input.sourceUrls || [])
  ].join(" ");

  // Check for fake claims
  const fakeClaimsFound = hasFakeClaims(candidate, combinedUserInput);

  // 1. Text word counts
  const abstractWordCount = countWords(candidate.abstract);
  const keywordsCount = Array.isArray(candidate.keywords) ? candidate.keywords.length : 0;
  
  const introWords = countWords(candidate.introduction);
  const litWords = countWords(candidate.literatureReview);
  const methodWords = countWords(candidate.materialsAndMethods || candidate.methods);
  const resultsWords = countWords(candidate.results);
  const discWords = countWords(candidate.discussion);
  const concWords = countWords(candidate.conclusion);
  const articleWordTarget = introWords + litWords + methodWords + resultsWords + discWords + concWords;

  // 2. Sections checks
  const introOk = introWords > 10;
  const methodsOk = methodWords > 10;
  const resultsOk = resultsWords > 10;
  const discussionOk = discWords > 10;
  const conclusionOk = concWords > 10;

  if (!introOk) missingSections.push("Introduction (Pendahuluan)");
  if (!methodsOk) missingSections.push("Methods (Metode)");
  if (!resultsOk) missingSections.push("Results (Hasil)");
  if (!discussionOk) missingSections.push("Discussion (Pembahasan)");
  if (!conclusionOk) missingSections.push("Conclusion (Kesimpulan)");

  const imradComplete = introOk && methodsOk && resultsOk && discussionOk && conclusionOk;

  // 3. Dual benchmark guidelines mapping
  // Broader implication check
  const textForImplication = (candidate.discussion || "") + " " + (candidate.introduction || "");
  const hasConservationImplication = candidate.hasConservationImplication === true || 
    /konservasi|dampak|implication|populasi|safety|kebijakan/i.test(textForImplication);

  // Replicability check
  const hasMethodsReplicability = methodsOk && 
    /protocol|langkah|metode|desain|sampling|spesifik|cara|koordinat/i.test(candidate.materialsAndMethods || "");

  // Metric/SI check
  const textForMetric = (candidate.materialsAndMethods || "") + " " + (candidate.results || "");
  const usesMetricOrSIUnitsWhenMeasurementsExist = 
    /meter|cm|mm|kg|gram|hektar|ha|celcius|°C|\b\d+\s*(?:m|cm|mm|g|kg|ha)\b/i.test(textForMetric);

  // Scientific name check
  const scientificNameDiscipline = (candidate.scientificNameDiscipline || 
    (/^[A-Z][a-z]+\s+[a-z]+$/i.test(candidate.title || "") ? "ok" : "not_applicable")) as "ok" | "missing" | "not_applicable";

  // Ethics safety note present
  const ethicsSafetyNotePresent = candidate.ethicsSafetyNotePresent === true || 
    /etika|izin|safety|keamanan|ethics|hewan|liar/i.test((candidate.materialsAndMethods || "") + " " + (candidate.introduction || ""));

  // 4. Citation and evidence sufficiency
  const hasSuppliedRefs = Array.isArray(input.sourceUrls) && input.sourceUrls.length > 0;
  const citationIntegrity: "safe" | "warning" | "blocked" = fakeClaimsFound 
    ? "blocked" 
    : (hasSuppliedRefs ? "safe" : "warning");
  
  const referenceConsistencyStatus = citationIntegrity;

  if (citationIntegrity === "warning") {
    recommendedFixes.push("Sediakan referensi/sumber pustaka pendukung untuk meningkatkan kejujuran ilmiah.");
  }

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

  // Quantitative level
  let quantitativeEvidenceLevel: "none" | "descriptive" | "basic_quantitative" | "statistical" = "none";
  if (candidate.quantitativeEvidenceLevel) {
    quantitativeEvidenceLevel = candidate.quantitativeEvidenceLevel;
  } else {
    const textForQuantitative = (candidate.results || "") + " " + (candidate.materialsAndMethods || "");
    if (/signifikan|anova|p-value|uji|korelasi|regresi/i.test(textForQuantitative)) {
      quantitativeEvidenceLevel = "statistical";
    } else if (/\b\d+(?:\.\d+)?\b/i.test(textForQuantitative)) {
      quantitativeEvidenceLevel = "basic_quantitative";
    } else if (textForQuantitative.trim().length > 50) {
      quantitativeEvidenceLevel = "descriptive";
    }
  }

  // 5. Score calculation
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

  if (evidenceSufficiency === "strong") score += 15;
  else if (evidenceSufficiency === "moderate") score += 10;

  if (citationIntegrity === "safe") score += 10;

  // Limitations check
  const limitationsLength = Array.isArray(candidate.limitations)
    ? candidate.limitations.length
    : (typeof candidate.limitations === "string" && candidate.limitations.trim().length > 0 ? 1 : 0);
  if (limitationsLength > 0) {
    score += 15;
  } else {
    recommendedFixes.push("Tambahkan daftar batasan data/bukti (limitations) secara lebih spesifik.");
  }

  // Target word bonuses
  if (abstractWordCount >= 180 && abstractWordCount <= 300) {
    score += 5;
  }
  if (keywordsCount >= 4 && keywordsCount <= 7) {
    score += 5;
  }

  // Cap score for thin inputs
  const combinedInputLength = (input.mainText || "").trim().length + (input.topic || "").trim().length;
  if (combinedInputLength < 100) {
    score = Math.min(score, 55);
  }

  // Determine level
  let level: "weak" | "basic" | "good" | "strong" = "weak";
  if (score >= 80) {
    level = "strong";
  } else if (score >= 60) {
    level = "good";
  } else if (score >= 40) {
    level = "basic";
  }

  // Hard gates
  if (!hasConservationImplication) {
    if (level === "strong") {
      level = "good";
      score = 79;
    }
    recommendedFixes.push("Jelaskan implikasi konservasi yang lebih luas (broader conservation implications).");
  }
  if (!hasMethodsReplicability) {
    if (level === "strong") {
      level = "good";
      score = 79;
    }
    recommendedFixes.push("Detailkan metode kerja agar dapat direplikasi (methods replicability).");
  }
  if (evidenceRows.length === 0) {
    if (level === "strong") {
      level = "good";
      score = 79;
    }
  }
  if (quantitativeEvidenceLevel === "none") {
    if (level === "strong") {
      level = "good";
      score = 79;
    }
    recommendedFixes.push("Gunakan data kuantitatif atau deskripsi data terukur dalam draf hasil.");
  }
  if (!hasSuppliedRefs) {
    // If no references, citationIntegrity must be warning, not safe
    if (citationIntegrity === "safe") {
      // should already be warning because of hasSuppliedRefs check, but force it
      score -= 10;
    }
  }

  // Blocked gate
  if (fakeClaimsFound) {
    score = 0;
    level = "weak";
    recommendedFixes.push("Draf diblokir karena terdeteksi klaim publikasi/peer-reviewed palsu atau pencatutan identitas jurnal.");
  }

  // Ensure bounds
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    level,
    imradComplete,
    missingSections,
    citationIntegrity: fakeClaimsFound ? "blocked" : citationIntegrity,
    evidenceSufficiency,
    publicationClaimAllowed: false,
    recommendedFixes,
    abstractWordCount,
    keywordsCount,
    articleWordTarget,
    hasConservationImplication,
    hasMethodsReplicability,
    usesMetricOrSIUnitsWhenMeasurementsExist,
    scientificNameDiscipline,
    ethicsSafetyNotePresent,
    referenceConsistencyStatus: fakeClaimsFound ? "blocked" : citationIntegrity,
    quantitativeEvidenceLevel
  };
}
