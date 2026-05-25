import type { JournalModelId } from "@/lib/reports/journalModelCapabilities";

export type RequiredModelEntitlement = "none" | "premium_model_entitlement_or_credit";
export type ModelEntitlementStatus =
  | "starter_available"
  | "locked_by_default"
  | "verified_entitlement"
  | "verified_credit";

export type VerifiedPremiumAccess = {
  /**
   * These values may only be set by a trusted server-side entitlement resolver.
   * Client request fields must never be used to construct this input.
   */
  verifiedPremiumCredit?: boolean;
  verifiedPremiumEntitlement?: boolean;
};

export type ModelEntitlementResult = {
  allowed: boolean;
  entitlementStatus: ModelEntitlementStatus;
  modelId: JournalModelId;
  reason: string;
  requiredEntitlement: RequiredModelEntitlement;
};

export const PREMIUM_MODEL_LOCK_MESSAGE =
  "Akses model premium belum aktif untuk sesi ini. Peregrine tetap tersedia sebagai starter; checkout/pembayaran tidak diaktifkan di CP1.";

function normalizeModelId(modelId: string): JournalModelId {
  return modelId === "obsidian" || modelId === "zephyr" ? modelId : "peregrine";
}

export function evaluateModelEntitlement(
  requestedModelId: string,
  trustedAccess: VerifiedPremiumAccess = {},
): ModelEntitlementResult {
  const modelId = normalizeModelId(requestedModelId);

  if (modelId === "peregrine") {
    return {
      allowed: true,
      entitlementStatus: "starter_available",
      modelId,
      reason: "starter_model_available_by_default",
      requiredEntitlement: "none",
    };
  }

  if (trustedAccess.verifiedPremiumEntitlement) {
    return {
      allowed: true,
      entitlementStatus: "verified_entitlement",
      modelId,
      reason: "trusted_premium_entitlement_confirmed",
      requiredEntitlement: "premium_model_entitlement_or_credit",
    };
  }

  if (trustedAccess.verifiedPremiumCredit) {
    return {
      allowed: true,
      entitlementStatus: "verified_credit",
      modelId,
      reason: "trusted_premium_credit_confirmed",
      requiredEntitlement: "premium_model_entitlement_or_credit",
    };
  }

  return {
    allowed: false,
    entitlementStatus: "locked_by_default",
    modelId,
    reason: "trusted_premium_entitlement_or_credit_missing",
    requiredEntitlement: "premium_model_entitlement_or_credit",
  };
}
