import { createHash, randomBytes } from "node:crypto";

export const REPORT_ACCESS_TOKEN_BYTES = 32;
export const GUEST_SESSION_MIN_LENGTH = 16;

export function hashSecret(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function generateReportAccessToken() {
  return randomBytes(REPORT_ACCESS_TOKEN_BYTES).toString("base64url");
}

export function isUsableGuestSessionId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= GUEST_SESSION_MIN_LENGTH;
}

export function getGuestSessionIdHash(guestSessionId: string) {
  return hashSecret(guestSessionId.trim());
}

export function getReportAccessTokenHash(reportAccessToken: string) {
  return hashSecret(reportAccessToken.trim());
}
