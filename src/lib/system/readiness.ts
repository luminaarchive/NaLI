import { env } from "@/lib/config/env";
import { getPurgeReadiness } from "@/lib/maintenance/purge";
import { isMidtransConfigured } from "@/lib/payments/midtrans";
import { getReportUploadReadiness } from "@/lib/reports/uploads";

export type SystemReadiness = {
  adminViewEnabled: boolean;
  exportGatePrepared: boolean;
  exportGateStatus: "prepared_locked" | "active";
  fileUploadActive: false;
  maintenanceSecretConfigured: boolean;
  midtransConfigured: boolean;
  openRouterConfigured: boolean;
  professionalFieldIntelligence: "positioning_only";
  purgeConfigured: boolean;
  purgePrepared: true;
  sourceVerificationActive: false;
  supabaseConfigured: boolean;
  uploadActive: false;
  uploadConfigured: boolean;
  uploadPrepared: true;
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
  const upload = getReportUploadReadiness();
  const purge = getPurgeReadiness();

  return {
    adminViewEnabled: env.admin.viewEnabled,
    exportGatePrepared: true,
    exportGateStatus: supabaseConfigured && midtransConfigured ? "active" : "prepared_locked",
    fileUploadActive: false,
    maintenanceSecretConfigured: purge.maintenanceSecretConfigured,
    midtransConfigured,
    openRouterConfigured,
    professionalFieldIntelligence: "positioning_only",
    purgeConfigured: purge.purgeConfigured,
    purgePrepared: purge.purgePrepared,
    sourceVerificationActive: false,
    supabaseConfigured,
    uploadActive: false,
    uploadConfigured: upload.uploadConfigured,
    uploadPrepared: upload.uploadPrepared,
  };
}
