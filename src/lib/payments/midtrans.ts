import { createHash } from "node:crypto";

export const DEFAULT_EXPORT_PRICE_IDR = 19000;
export const SUPPORTED_EXPORT_TYPES = ["markdown", "pdf", "docx"] as const;

export type ExportType = (typeof SUPPORTED_EXPORT_TYPES)[number];

export type MidtransNotification = {
  fraud_status?: string;
  gross_amount?: string;
  order_id?: string;
  payment_type?: string;
  signature_key?: string;
  status_code?: string;
  transaction_status?: string;
  transaction_time?: string;
  transaction_id?: string;
  [key: string]: unknown;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | "denied";

const MIDTRANS_PRODUCTION_SNAP_ENDPOINT = "https://app.midtrans.com/snap/v1/transactions";
const MIDTRANS_SANDBOX_SNAP_ENDPOINT = "https://app.sandbox.midtrans.com/snap/v1/transactions";

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

function isMidtransAppHost(hostname: string) {
  return hostname === "app.midtrans.com" || hostname === "app.sandbox.midtrans.com";
}

export function isSupportedExportType(value: unknown): value is ExportType {
  return typeof value === "string" && SUPPORTED_EXPORT_TYPES.includes(value as ExportType);
}

export function normalizeExportType(value: unknown): ExportType {
  return isSupportedExportType(value) ? value : "markdown";
}

export function getExportAmountIdr(exportType: ExportType) {
  const configured = Number.parseInt(process.env.NALI_EXPORT_PRICE_IDR ?? "", 10);
  const base = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_EXPORT_PRICE_IDR;

  return exportType === "markdown" ? base : base;
}

export function isMidtransConfigured() {
  return hasValue(process.env.MIDTRANS_SERVER_KEY) && hasValue(process.env.MIDTRANS_MERCHANT_ID);
}

export function isMidtransProduction() {
  const productionFlag = process.env.MIDTRANS_IS_PRODUCTION?.trim().toLowerCase();
  if (productionFlag) return ["1", "true", "yes", "production"].includes(productionFlag);

  return process.env.MIDTRANS_ENVIRONMENT?.trim().toLowerCase() === "production";
}

export function getMidtransSnapEndpoint() {
  const configuredBaseUrl = process.env.MIDTRANS_SNAP_BASE_URL?.trim();

  if (configuredBaseUrl) {
    try {
      const url = new URL(configuredBaseUrl);
      if (url.protocol === "https:" && isMidtransAppHost(url.hostname)) {
        if (!url.pathname.endsWith("/transactions")) {
          const basePath = url.pathname.replace(/\/$/, "") || "/snap/v1";
          url.pathname = `${basePath}/transactions`;
        }
        url.search = "";
        url.hash = "";
        return url.toString();
      }
    } catch {
      // Fall through to the environment-derived safe endpoint.
    }
  }

  return isMidtransProduction() ? MIDTRANS_PRODUCTION_SNAP_ENDPOINT : MIDTRANS_SANDBOX_SNAP_ENDPOINT;
}

export function isSafeMidtransCheckoutUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && isMidtransAppHost(url.hostname);
  } catch {
    return false;
  }
}

export function getMidtransNotificationOrderId(notification: MidtransNotification) {
  return typeof notification.order_id === "string" ? notification.order_id : "";
}

export function createMidtransOrderId(reportId: string) {
  return `nali-${reportId.slice(0, 8)}-${Date.now()}`;
}

export function getMidtransPaymentExpiry() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  return expiresAt;
}

export function createMidtransSignature({
  grossAmount,
  orderId,
  serverKey,
  statusCode,
}: {
  grossAmount: string;
  orderId: string;
  serverKey: string;
  statusCode: string;
}) {
  return createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
}

export function verifyMidtransSignature(notification: MidtransNotification, serverKey = process.env.MIDTRANS_SERVER_KEY) {
  if (!serverKey || !notification.order_id || !notification.status_code || !notification.gross_amount) {
    return false;
  }

  const expected = createMidtransSignature({
    grossAmount: notification.gross_amount,
    orderId: notification.order_id,
    serverKey,
    statusCode: notification.status_code,
  });

  return expected === notification.signature_key;
}

export function mapMidtransTransactionStatus(notification: MidtransNotification): PaymentStatus {
  const transactionStatus = notification.transaction_status;
  const fraudStatus = notification.fraud_status;

  if (transactionStatus === "settlement" || (transactionStatus === "capture" && fraudStatus === "accept")) {
    return "paid";
  }

  if (transactionStatus === "expire") {
    return "expired";
  }

  if (transactionStatus === "cancel") {
    return "cancelled";
  }

  if (transactionStatus === "deny") {
    return "denied";
  }

  if (transactionStatus === "failure") {
    return "failed";
  }

  return "pending";
}

export function sanitizeMidtransNotification(notification: MidtransNotification) {
  const { signature_key: _signatureKey, ...safeNotification } = notification;
  return safeNotification;
}

export function isSuccessfulPaymentStatus(status: string | null | undefined) {
  return status === "paid" || status === "success";
}

export function getMidtransAuthorizationHeader(serverKey = process.env.MIDTRANS_SERVER_KEY ?? "") {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}
