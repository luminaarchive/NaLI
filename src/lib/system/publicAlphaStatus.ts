export interface PublicAlphaStatus {
  publicAlpha: boolean;
  aiEngineStatus: "available" | "temporarily_unavailable" | "unknown";
  paymentStatus: "inactive";
  pdfExportStatus: "locked";
  uploadStatus: "inactive";
  sourceVerificationStatus: "inactive";
  journalPdfStatus: "locked";
}

export function getPublicAlphaStatus(): PublicAlphaStatus {
  // Safe environment/configuration checking without exposing secrets or internal provider states
  const envStatus = process.env.NEXT_PUBLIC_AI_ENGINE_STATUS || process.env.NALI_AI_ENGINE_STATUS;
  
  let aiEngineStatus: "available" | "temporarily_unavailable" | "unknown" = "temporarily_unavailable";
  if (envStatus === "available") {
    aiEngineStatus = "available";
  } else if (envStatus === "unknown") {
    aiEngineStatus = "unknown";
  }

  return {
    publicAlpha: true,
    aiEngineStatus,
    paymentStatus: "inactive",
    pdfExportStatus: "locked",
    uploadStatus: "inactive",
    sourceVerificationStatus: "inactive",
    journalPdfStatus: "locked",
  };
}
