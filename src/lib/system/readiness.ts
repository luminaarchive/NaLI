import { env } from "@/lib/config/env";
import { getPurgeReadiness } from "@/lib/maintenance/purge";
import { isMidtransConfigured, isMidtransProduction } from "@/lib/payments/midtrans";
import { getReportUploadReadiness } from "@/lib/reports/uploads";
import { getCostProtectionReadiness, getCostProtectionStatus } from "@/lib/usage/costProtection";

export type SystemReadiness = {
  adminViewEnabled: boolean;
  costProtectionActive: boolean;
  costProtectionConfigured: boolean;
  costProtectionPrepared: true;
  exportGatePrepared: boolean;
  exportGateStatus: "prepared_locked" | "active";
  fileUploadActive: false;
  maintenanceSecretConfigured: boolean;
  midtransConfigured: boolean;
  midtransProductionMode: boolean;
  midtransEnvironment: "sandbox" | "production" | "not_configured";
  paidCheckoutActive: boolean;
  creditPurchaseActive: boolean;
  paidExportActive: boolean;
  naliLockPrepared: true;
  openRouterConfigured: boolean;
  professionalFieldIntelligence: "positioning_only";
  purgeConfigured: boolean;
  purgePrepared: true;
  rateLimitPrepared: true;
  sourceVerificationActive: false;
  supabaseConfigured: boolean;
  uploadActive: false;
  uploadConfigured: boolean;
  uploadPrepared: true;
  entitlementGate: "enabled";
  premiumModelsLockedByDefault: true;
  peregrineAvailable: true;
  paymentActivation: "disabled";
  midtrans: "deferred_inactive";
  publicExport: "locked_inactive";
};

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getSystemReadiness(): SystemReadiness {
  const supabaseConfigured = Boolean(
    hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    hasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
  const openRouterConfigured = hasValue(process.env.OPENROUTER_API_KEY);
  const midtransConfigured = isMidtransConfigured();
  const midtransProductionMode = isMidtransProduction();
  const upload = getReportUploadReadiness();
  const purge = getPurgeReadiness();
  const costProtection = getCostProtectionReadiness();

  const midtransEnvironment = !midtransConfigured
    ? "not_configured"
    : midtransProductionMode
      ? "production"
      : "sandbox";

  const exportActive = supabaseConfigured && midtransConfigured;

  return {
    adminViewEnabled: env.admin.viewEnabled,
    costProtectionActive: costProtection.costProtectionActive,
    costProtectionConfigured: costProtection.costProtectionConfigured,
    costProtectionPrepared: costProtection.costProtectionPrepared,
    exportGatePrepared: true,
    exportGateStatus: exportActive ? "active" : "prepared_locked",
    fileUploadActive: false,
    maintenanceSecretConfigured: purge.maintenanceSecretConfigured,
    midtransConfigured,
    midtransProductionMode,
    midtransEnvironment,
    paidCheckoutActive: exportActive,
    creditPurchaseActive: exportActive,
    paidExportActive: supabaseConfigured,
    naliLockPrepared: true,
    openRouterConfigured,
    professionalFieldIntelligence: "positioning_only",
    purgeConfigured: purge.purgeConfigured,
    purgePrepared: purge.purgePrepared,
    rateLimitPrepared: true,
    sourceVerificationActive: false,
    supabaseConfigured,
    uploadActive: false,
    uploadConfigured: upload.uploadConfigured,
    uploadPrepared: upload.uploadPrepared,
    entitlementGate: "enabled",
    premiumModelsLockedByDefault: true,
    peregrineAvailable: true,
    paymentActivation: "disabled",
    midtrans: "deferred_inactive",
    publicExport: "locked_inactive",
  };
}

export async function getRuntimeSystemReadiness(): Promise<SystemReadiness> {
  const readiness = getSystemReadiness();
  const costProtection = await getCostProtectionStatus();

  return {
    ...readiness,
    costProtectionActive: costProtection.active,
    costProtectionConfigured: costProtection.configured,
  };
}
