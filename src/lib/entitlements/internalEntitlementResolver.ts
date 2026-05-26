import { verifyFounderToken } from "@/lib/system/founderAuthorization";

export const INTERNAL_PREMIUM_QA_HEADER = "x-nali-internal-premium-qa-token";

export type InternalPremiumQaStatus = "invalid" | "missing" | "unconfigured" | "valid_internal_qa";

export type InternalPremiumQaDecision = {
  allowed: boolean;
  status: InternalPremiumQaStatus;
};

export function getInternalPremiumQaResolverStatus(): "configured" | "unconfigured" {
  return verifyFounderToken(undefined).configured ? "configured" : "unconfigured";
}

export function resolveInternalPremiumQaEntitlement(requestHeaders: Headers): InternalPremiumQaDecision {
  const token = requestHeaders.get(INTERNAL_PREMIUM_QA_HEADER)?.trim();
  const founderAccess = verifyFounderToken(token || undefined);

  if (!founderAccess.configured) {
    return { allowed: false, status: "unconfigured" };
  }

  if (!token) {
    return { allowed: false, status: "missing" };
  }

  if (!founderAccess.authorized) {
    return { allowed: false, status: "invalid" };
  }

  return { allowed: true, status: "valid_internal_qa" };
}
