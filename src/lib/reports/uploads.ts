import { createHash, randomBytes, randomUUID } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import { getGuestSessionIdHash, getReportAccessTokenHash, generateReportAccessToken } from "@/lib/reports/access";
import { REPORT_MACRO_STATUSES, type ReportMacroStatus } from "@/lib/reports/persistence";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export const MAX_REPORT_UPLOAD_BYTES = 10 * 1024 * 1024;
export const REPORT_UPLOAD_BUCKET = "nali_report_uploads";
export const REPORT_UPLOAD_PATH_PREFIX = "pending_reports";
export const REPORT_UPLOAD_JOB_STATUSES = ["queued", "verifying", "verified", "failed"] as const;
export const REPORT_UPLOAD_STEPS = [
  "reading_metadata",
  "calculating_fingerprint",
  "reading_page_count",
  "checking_integrity",
] as const;

const SIGNED_UPLOAD_TTL_MS = 2 * 60 * 60 * 1000;
const PDF_MAGIC = "%PDF-";

type ReportUploadJobStatus = (typeof REPORT_UPLOAD_JOB_STATUSES)[number];
type ReportUploadStep = (typeof REPORT_UPLOAD_STEPS)[number];

type StoreResult = { ok: true } | { ok: false; error: string };

export type ReportUploadRecord = {
  file_size_bytes?: number | null;
  id: string;
  original_filename?: string | null;
  page_count?: number | null;
  processing_metadata?: Record<string, unknown> | null;
  report_access_token_hash?: string;
  status: ReportMacroStatus;
  storage_last_modified?: string | null;
  storage_path?: string | null;
  upload_expires_at?: string | null;
  verified_file_sha256?: string | null;
};

export type PendingUploadReportInsert = {
  guest_session_id_hash: string;
  id: string;
  input: Record<string, unknown>;
  mode: "draft_from_materials";
  original_filename: string;
  processing_metadata: Record<string, unknown>;
  report_access_token_hash: string;
  status: "pending_upload";
  storage_path: string;
  upload_expires_at: string;
};

export type UploadVerificationJobInsert = {
  report_id: string;
  status: "queued";
};

export type ReportUploadStore = {
  createPendingUpload(input: {
    job: UploadVerificationJobInsert;
    report: PendingUploadReportInsert;
  }): Promise<StoreResult>;
  createSignedUploadUrl(storagePath: string): Promise<{ ok: true; signedUrl: string } | { ok: false; error: string }>;
  downloadStorageObject(
    storagePath: string,
  ): Promise<{ downloaded: true; file: Blob } | { downloaded: false; error: string }>;
  getReportByAccess(
    reportId: string,
    accessHash: string,
  ): Promise<{ found: true; report: ReportUploadRecord } | { found: false; error?: string }>;
  getReportForVerification(
    reportId: string,
  ): Promise<{ found: true; report: ReportUploadRecord } | { found: false; error?: string }>;
  getStorageInfo(
    storagePath: string,
  ): Promise<{ found: true; lastModified: string | null; size: number } | { found: false; error: string }>;
  markVerificationStarted(reportId: string, metadata: Record<string, unknown>): Promise<StoreResult>;
  storeVerificationFailure(reportId: string, patch: VerificationFailurePatch): Promise<StoreResult>;
  storeVerificationSuccess(reportId: string, patch: VerificationSuccessPatch): Promise<StoreResult>;
};

type VerificationFailurePatch = {
  failure_details: string;
  failure_reason: string;
  failure_stage: ReportUploadStep;
  processing_metadata: Record<string, unknown>;
  status: "failed";
};

type VerificationSuccessPatch = {
  failure_details: null;
  failure_reason: null;
  failure_stage: null;
  file_size_bytes: number;
  page_count: number;
  processing_metadata: Record<string, unknown>;
  status: "pending_payment";
  storage_last_modified: string | null;
  verified_file_sha256: string;
};

type CreateUploadInput = {
  contentType?: unknown;
  fileName?: unknown;
  fileSizeBytes?: unknown;
  guestSessionId?: unknown;
};

type CreateUploadDeps = {
  createReportId?: () => string;
  createUploadNonce?: () => string;
  now?: () => Date;
  store?: ReportUploadStore | null;
};

type ConfirmUploadInput = {
  reportAccessToken?: unknown;
  reportId?: unknown;
};

type ConfirmUploadDeps = {
  now?: () => Date;
  store?: ReportUploadStore | null;
};

type VerifyUploadDeps = {
  now?: () => Date;
  store?: ReportUploadStore | null;
};

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getReportUploadReadiness() {
  const uploadConfigured = Boolean(
    hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      hasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
      hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
  );

  return {
    uploadConfigured,
    uploadPrepared: true as const,
  };
}

function isAllowedMacroStatus(status: string): status is ReportMacroStatus {
  return (REPORT_MACRO_STATUSES as readonly string[]).includes(status);
}

function normalizeFileName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[^\w .()-]/g, "_").slice(0, 180);
}

function parseFileSize(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : NaN;
  }
  return NaN;
}

function validateCreateUploadInput(input: CreateUploadInput) {
  const guestSessionId = typeof input.guestSessionId === "string" ? input.guestSessionId.trim() : "";
  if (guestSessionId.length < 16) {
    return {
      code: "MISSING_GUEST_SESSION",
      error: "Guest session belum siap. Muat ulang halaman lalu coba lagi.",
      success: false as const,
    };
  }

  const fileName = normalizeFileName(input.fileName);
  const contentType = typeof input.contentType === "string" ? input.contentType.trim().toLowerCase() : "";
  const fileSizeBytes = parseFileSize(input.fileSizeBytes);

  if (!fileName || !fileName.toLowerCase().endsWith(".pdf") || (contentType && contentType !== "application/pdf")) {
    return {
      code: "PDF_ONLY",
      error: "Sprint 0 hanya menerima PDF.",
      success: false as const,
    };
  }

  if (!Number.isInteger(fileSizeBytes) || fileSizeBytes <= 0) {
    return {
      code: "INVALID_FILE_SIZE",
      error: "Ukuran file tidak valid.",
      success: false as const,
    };
  }

  if (fileSizeBytes > MAX_REPORT_UPLOAD_BYTES) {
    return {
      code: "FILE_TOO_LARGE",
      error: "Ukuran PDF melebihi batas Sprint 0 sebesar 10MB.",
      success: false as const,
    };
  }

  return {
    data: {
      contentType: contentType || "application/pdf",
      fileName,
      fileSizeBytes,
      guestSessionId,
    },
    success: true as const,
  };
}

function uploadPath(reportId: string, nonce: string) {
  return `${REPORT_UPLOAD_PATH_PREFIX}/${reportId}/${nonce}.pdf`;
}

function createStepMetadata(activeStep?: ReportUploadStep, failedStep?: ReportUploadStep) {
  const activeIndex = activeStep ? REPORT_UPLOAD_STEPS.indexOf(activeStep) : REPORT_UPLOAD_STEPS.length - 1;
  const failedIndex = failedStep ? REPORT_UPLOAD_STEPS.indexOf(failedStep) : -1;

  return REPORT_UPLOAD_STEPS.map((step, index) => {
    let status: "completed" | "failed" | "in_progress" | "pending" = "pending";

    if (failedIndex >= 0) {
      status = index < failedIndex ? "completed" : index === failedIndex ? "failed" : "pending";
    } else if (activeStep) {
      status = index < activeIndex ? "completed" : index === activeIndex ? "in_progress" : "pending";
    } else {
      status = "completed";
    }

    return { name: step, status };
  });
}

function baseMetadata(previous: Record<string, unknown> | null | undefined, uploadVerification: Record<string, unknown>) {
  const safePrevious = previous && typeof previous === "object" && !Array.isArray(previous) ? previous : {};

  return {
    ...safePrevious,
    upload_verification: uploadVerification,
  };
}

function failurePatch({
  code,
  details,
  previousMetadata,
  stage,
}: {
  code: string;
  details: string;
  previousMetadata?: Record<string, unknown> | null;
  stage: ReportUploadStep;
}): VerificationFailurePatch {
  return {
    failure_details: details,
    failure_reason: code,
    failure_stage: stage,
    processing_metadata: baseMetadata(previousMetadata, {
      result: "failed",
      steps: createStepMetadata(undefined, stage),
    }),
    status: "failed",
  };
}

function getDefaultUploadStore(): ReportUploadStore | null {
  const supabase = getOptionalSupabaseAdminClient();
  if (!supabase) return null;

  return {
    async createPendingUpload({ job, report }) {
      const { error: reportError } = await supabase.from("reports").insert(report);
      if (reportError) return { ok: false, error: reportError.message };

      const { error: jobError } = await supabase.from("upload_verification_jobs").insert(job);
      if (jobError) return { ok: false, error: jobError.message };

      return { ok: true };
    },
    async createSignedUploadUrl(storagePath) {
      const { data, error } = await supabase.storage
        .from(REPORT_UPLOAD_BUCKET)
        .createSignedUploadUrl(storagePath, { upsert: false });

      if (error || !data?.signedUrl) {
        return { ok: false, error: error?.message ?? "Signed upload URL was not returned." };
      }

      return { ok: true, signedUrl: data.signedUrl };
    },
    async downloadStorageObject(storagePath) {
      const { data, error } = await supabase.storage.from(REPORT_UPLOAD_BUCKET).download(storagePath);

      if (error || !data) {
        return { downloaded: false, error: error?.message ?? "File could not be downloaded for verification." };
      }

      return { downloaded: true, file: data };
    },
    async getReportByAccess(reportId, accessHash) {
      const { data, error } = await supabase
        .from("reports")
        .select(
          "id,status,storage_path,upload_expires_at,processing_metadata,page_count,verified_file_sha256,report_access_token_hash",
        )
        .eq("id", reportId)
        .eq("report_access_token_hash", accessHash)
        .maybeSingle();

      if (error) return { found: false, error: error.message };
      if (!data) return { found: false };
      return { found: true, report: data as ReportUploadRecord };
    },
    async getReportForVerification(reportId) {
      const { data, error } = await supabase
        .from("reports")
        .select("id,status,storage_path,upload_expires_at,processing_metadata")
        .eq("id", reportId)
        .maybeSingle();

      if (error) return { found: false, error: error.message };
      if (!data) return { found: false };
      return { found: true, report: data as ReportUploadRecord };
    },
    async getStorageInfo(storagePath) {
      const { data, error } = await supabase.storage.from(REPORT_UPLOAD_BUCKET).info(storagePath);
      if (error || !data) return { found: false, error: error?.message ?? "File metadata unavailable." };

      const size = typeof data.size === "number" ? data.size : Number(data.metadata?.size);
      if (!Number.isFinite(size)) return { found: false, error: "File size metadata unavailable." };
      const storageInfo = data as typeof data & { last_modified?: string; updated_at?: string };

      return {
        found: true,
        lastModified: data.lastModified ?? data.updatedAt ?? storageInfo.last_modified ?? storageInfo.updated_at ?? null,
        size: Math.trunc(size),
      };
    },
    async markVerificationStarted(reportId, metadata) {
      const { error: reportError } = await supabase
        .from("reports")
        .update({ processing_metadata: metadata, status: "verifying" })
        .eq("id", reportId);
      if (reportError) return { ok: false, error: reportError.message };

      const { error: jobError } = await supabase
        .from("upload_verification_jobs")
        .update({ heartbeat_at: new Date().toISOString(), status: "verifying" })
        .eq("report_id", reportId);
      if (jobError) return { ok: false, error: jobError.message };

      return { ok: true };
    },
    async storeVerificationFailure(reportId, patch) {
      const { error: reportError } = await supabase.from("reports").update(patch).eq("id", reportId);
      if (reportError) return { ok: false, error: reportError.message };

      const { error: jobError } = await supabase
        .from("upload_verification_jobs")
        .update({ last_error: patch.failure_reason, status: "failed" })
        .eq("report_id", reportId);
      if (jobError) return { ok: false, error: jobError.message };

      return { ok: true };
    },
    async storeVerificationSuccess(reportId, patch) {
      const { error: reportError } = await supabase.from("reports").update(patch).eq("id", reportId);
      if (reportError) return { ok: false, error: reportError.message };

      const { error: jobError } = await supabase
        .from("upload_verification_jobs")
        .update({ last_error: null, status: "verified" })
        .eq("report_id", reportId);
      if (jobError) return { ok: false, error: jobError.message };

      return { ok: true };
    },
  };
}

function getStore(deps: { store?: ReportUploadStore | null } = {}) {
  if ("store" in deps) return deps.store ?? null;
  return getDefaultUploadStore();
}

export async function createReportUploadRequest(input: CreateUploadInput, deps: CreateUploadDeps = {}) {
  const validated = validateCreateUploadInput(input);

  if (!validated.success) {
    return {
      code: validated.code,
      error: validated.error,
      ok: false as const,
      status: 400,
    };
  }

  const readiness = getReportUploadReadiness();
  const store = getStore(deps);
  const uploadConfigured = deps.store ? true : readiness.uploadConfigured;

  if (!uploadConfigured || !store) {
    return {
      code: "UPLOAD_NOT_CONFIGURED",
      error: "Upload PDF belum aktif karena Supabase Storage belum dikonfigurasi di environment ini.",
      ok: false as const,
      status: 503,
      uploadConfigured: false,
    };
  }

  const now = deps.now?.() ?? new Date();
  const reportId = deps.createReportId?.() ?? randomUUID();
  const nonce = deps.createUploadNonce?.() ?? randomBytes(18).toString("base64url");
  const storagePath = uploadPath(reportId, nonce);
  const reportAccessToken = generateReportAccessToken();
  const uploadExpiresAt = new Date(now.getTime() + SIGNED_UPLOAD_TTL_MS).toISOString();

  const report: PendingUploadReportInsert = {
    guest_session_id_hash: getGuestSessionIdHash(validated.data.guestSessionId),
    id: reportId,
    input: {
      content_type: validated.data.contentType,
      declared_file_size_bytes: validated.data.fileSizeBytes,
      material_type: "pdf_upload",
      original_filename: validated.data.fileName,
      source_verification: "inactive_mvp",
      sprint: "zero",
    },
    mode: "draft_from_materials",
    original_filename: validated.data.fileName,
    processing_metadata: {
      sprint: "zero",
      upload: {
        max_file_size_bytes: MAX_REPORT_UPLOAD_BYTES,
        pdf_only: true,
      },
      upload_verification: {
        result: "pending_upload",
        steps: createStepMetadata("reading_metadata"),
      },
    },
    report_access_token_hash: getReportAccessTokenHash(reportAccessToken),
    status: "pending_upload",
    storage_path: storagePath,
    upload_expires_at: uploadExpiresAt,
  };
  const job: UploadVerificationJobInsert = {
    report_id: reportId,
    status: "queued",
  };

  const created = await store.createPendingUpload({ job, report });
  if (!created.ok) {
    return {
      code: "UPLOAD_RECORD_CREATE_FAILED",
      error: "NaLI belum bisa menyiapkan catatan upload.",
      ok: false as const,
      status: 500,
    };
  }

  const signed = await store.createSignedUploadUrl(storagePath);
  if (!signed.ok) {
    await store.storeVerificationFailure(
      reportId,
      failurePatch({
        code: "SIGNED_UPLOAD_URL_FAILED",
        details: signed.error,
        previousMetadata: report.processing_metadata,
        stage: "reading_metadata",
      }),
    );

    return {
      code: "SIGNED_UPLOAD_URL_FAILED",
      error: "Supabase Storage belum siap menerima upload PDF.",
      ok: false as const,
      status: 503,
    };
  }

  return {
    expires_at: uploadExpiresAt,
    ok: true as const,
    report_access_token: reportAccessToken,
    report_id: reportId,
    signed_upload_url: signed.signedUrl,
    storage_path: storagePath,
    uploadConfigured: true,
  };
}

async function readBlobForVerification(file: Blob) {
  const hash = createHash("sha256");
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  let firstBytes = Buffer.alloc(0);

  const reader = file.stream().getReader();

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = Buffer.from(value);
    totalBytes += chunk.byteLength;
    hash.update(chunk);
    chunks.push(chunk);

    if (firstBytes.byteLength < PDF_MAGIC.length) {
      firstBytes = Buffer.concat([firstBytes, chunk], Math.min(PDF_MAGIC.length, firstBytes.byteLength + chunk.byteLength));
    }
  }

  return {
    bytes: Buffer.concat(chunks, totalBytes),
    firstBytes,
    sha256: hash.digest("hex"),
    totalBytes,
  };
}

async function readPdfPageCount(bytes: Buffer) {
  const pdf = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
  });
  return pdf.getPageCount();
}

async function failVerification({
  code,
  details,
  report,
  stage,
  store,
}: {
  code: string;
  details: string;
  report: ReportUploadRecord;
  stage: ReportUploadStep;
  store: ReportUploadStore;
}) {
  await store.storeVerificationFailure(
    report.id,
    failurePatch({
      code,
      details,
      previousMetadata: report.processing_metadata,
      stage,
    }),
  );

  return {
    code,
    error: details,
    ok: false as const,
    status: "failed" as const,
  };
}

export async function verifyReportUpload(reportId: string, deps: VerifyUploadDeps = {}) {
  const store = getStore(deps);
  if (!store) {
    return {
      code: "UPLOAD_NOT_CONFIGURED",
      error: "Upload PDF belum aktif karena Supabase Storage belum dikonfigurasi.",
      ok: false as const,
      status: "failed" as const,
    };
  }

  const lookup = await store.getReportForVerification(reportId);
  if (!lookup.found) {
    return {
      code: "REPORT_NOT_FOUND",
      error: lookup.error ?? "Report upload tidak ditemukan.",
      ok: false as const,
      status: "failed" as const,
    };
  }

  const report = lookup.report;

  if (!isAllowedMacroStatus(report.status)) {
    return failVerification({
      code: "INVALID_REPORT_STATUS",
      details: "Report status tidak termasuk status Sprint 0 yang diizinkan.",
      report,
      stage: "reading_metadata",
      store,
    });
  }

  if (report.status === "pending_payment" && report.verified_file_sha256 && report.page_count) {
    return {
      idempotent: true as const,
      ok: true as const,
      page_count: report.page_count,
      status: "pending_payment" as const,
    };
  }

  const uploadExpiresAt = report.upload_expires_at ? new Date(report.upload_expires_at) : null;
  const now = deps.now?.() ?? new Date();

  if (!uploadExpiresAt || Number.isNaN(uploadExpiresAt.getTime()) || uploadExpiresAt.getTime() < now.getTime()) {
    return failVerification({
      code: "UPLOAD_EXPIRED",
      details: "Batas waktu upload PDF sudah berakhir.",
      report,
      stage: "reading_metadata",
      store,
    });
  }

  if (!report.storage_path) {
    return failVerification({
      code: "STORAGE_PATH_MISSING",
      details: "Storage path upload belum tersedia.",
      report,
      stage: "reading_metadata",
      store,
    });
  }

  const startedMetadata = baseMetadata(report.processing_metadata, {
    result: "verifying",
    steps: createStepMetadata("reading_metadata"),
  });
  const started = await store.markVerificationStarted(report.id, startedMetadata);
  if (!started.ok) {
    return {
      code: "VERIFICATION_START_FAILED",
      error: started.error,
      ok: false as const,
      status: "failed" as const,
    };
  }

  const storageInfo = await store.getStorageInfo(report.storage_path);
  if (!storageInfo.found) {
    return failVerification({
      code: "FILE_NOT_FOUND",
      details: storageInfo.error,
      report: { ...report, processing_metadata: startedMetadata, status: "verifying" },
      stage: "reading_metadata",
      store,
    });
  }

  if (storageInfo.size > MAX_REPORT_UPLOAD_BYTES) {
    return failVerification({
      code: "FILE_SIZE_LIMIT_EXCEEDED",
      details: "Ukuran PDF di storage melebihi batas 10MB.",
      report: { ...report, processing_metadata: startedMetadata, status: "verifying" },
      stage: "reading_metadata",
      store,
    });
  }

  const download = await store.downloadStorageObject(report.storage_path);
  if (!download.downloaded) {
    return failVerification({
      code: "FILE_DOWNLOAD_FAILED",
      details: download.error,
      report: { ...report, processing_metadata: startedMetadata, status: "verifying" },
      stage: "reading_metadata",
      store,
    });
  }

  const fingerprint = await readBlobForVerification(download.file);
  if (fingerprint.totalBytes > MAX_REPORT_UPLOAD_BYTES) {
    return failVerification({
      code: "FILE_SIZE_LIMIT_EXCEEDED",
      details: "Ukuran PDF terunduh melebihi batas 10MB.",
      report: { ...report, processing_metadata: startedMetadata, status: "verifying" },
      stage: "reading_metadata",
      store,
    });
  }

  if (fingerprint.firstBytes.toString("utf8") !== PDF_MAGIC) {
    return failVerification({
      code: "INVALID_PDF_MAGIC_BYTES",
      details: "File yang terunggah tidak memiliki tanda awal PDF yang valid.",
      report: { ...report, processing_metadata: startedMetadata, status: "verifying" },
      stage: "checking_integrity",
      store,
    });
  }

  let pageCount: number;

  try {
    pageCount = await readPdfPageCount(fingerprint.bytes);
  } catch (error) {
    return failVerification({
      code: "PDF_PAGE_COUNT_UNREADABLE",
      details: error instanceof Error ? error.message : "Jumlah halaman PDF tidak dapat dibaca.",
      report: { ...report, processing_metadata: startedMetadata, status: "verifying" },
      stage: "reading_page_count",
      store,
    });
  }

  if (pageCount > 100) {
    return failVerification({
      code: "PAGE_LIMIT_EXCEEDED",
      details: "PDF melebihi batas Sprint 0 sebanyak 100 halaman.",
      report: { ...report, processing_metadata: startedMetadata, status: "verifying" },
      stage: "checking_integrity",
      store,
    });
  }

  const pageGate =
    pageCount > 50
      ? {
          fee_status: "prepared_not_charged",
          page_range: "51-100",
          tier: "graduated_gate_fee",
        }
      : "regular";

  const successPatch: VerificationSuccessPatch = {
    failure_details: null,
    failure_reason: null,
    failure_stage: null,
    file_size_bytes: storageInfo.size,
    page_count: pageCount,
    processing_metadata: baseMetadata(report.processing_metadata, {
      page_gate: pageGate,
      result: "verified",
      source_verification: "inactive_mvp",
      steps: createStepMetadata(),
    }),
    status: "pending_payment",
    storage_last_modified: storageInfo.lastModified,
    verified_file_sha256: fingerprint.sha256,
  };

  const stored = await store.storeVerificationSuccess(report.id, successPatch);
  if (!stored.ok) {
    return {
      code: "VERIFICATION_STORE_FAILED",
      error: stored.error,
      ok: false as const,
      status: "failed" as const,
    };
  }

  return {
    file_size_bytes: storageInfo.size,
    ok: true as const,
    page_count: pageCount,
    sha256: fingerprint.sha256,
    status: "pending_payment" as const,
  };
}

export async function confirmReportUpload(input: ConfirmUploadInput, deps: ConfirmUploadDeps = {}) {
  const reportId = typeof input.reportId === "string" ? input.reportId.trim() : "";
  const reportAccessToken = typeof input.reportAccessToken === "string" ? input.reportAccessToken.trim() : "";

  if (!reportId || !reportAccessToken) {
    return {
      code: "MISSING_REPORT_ACCESS",
      error: "Report ID dan akses upload wajib dikirim.",
      ok: false as const,
      status: 400,
    };
  }

  const store = getStore(deps);
  if (!store) {
    return {
      code: "UPLOAD_NOT_CONFIGURED",
      error: "Upload PDF belum aktif karena Supabase Storage belum dikonfigurasi.",
      ok: false as const,
      status: 503,
    };
  }

  const lookup = await store.getReportByAccess(reportId, getReportAccessTokenHash(reportAccessToken));
  if (!lookup.found) {
    return {
      code: "REPORT_NOT_FOUND",
      error: lookup.error ?? "Report upload tidak ditemukan.",
      ok: false as const,
      status: 404,
    };
  }

  if (lookup.report.status === "pending_payment" && lookup.report.verified_file_sha256) {
    return {
      idempotent: true as const,
      ok: true as const,
      report_id: reportId,
      status: "pending_payment" as const,
    };
  }

  if (lookup.report.status === "failed") {
    return {
      idempotent: true as const,
      ok: false as const,
      report_id: reportId,
      status: "failed" as const,
    };
  }

  const verified = await verifyReportUpload(reportId, deps);
  if (!verified.ok) {
    return {
      ...verified,
      report_id: reportId,
    };
  }

  return {
    idempotent: false as const,
    ok: true as const,
    page_count: verified.page_count,
    report_id: reportId,
    status: "pending_payment" as const,
  };
}
