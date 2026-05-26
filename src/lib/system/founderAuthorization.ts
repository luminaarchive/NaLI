import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function verifyFounderToken(token: string | undefined): { authorized: boolean; configured: boolean } {
  const adminToken = process.env.NALI_FOUNDER_ADMIN_TOKEN?.trim();

  if (!adminToken) {
    return { authorized: false, configured: false };
  }

  if (!token) {
    return { authorized: false, configured: true };
  }

  return {
    authorized: timingSafeEqual(digest(token), digest(adminToken)),
    configured: true,
  };
}
