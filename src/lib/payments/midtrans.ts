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
  return Boolean(process.env.MIDTRANS_SERVER_KEY?.trim() && process.env.MIDTRANS_MERCHANT_ID?.trim());
}

export function getMidtransSnapEndpoint() {
  return process.env.MIDTRANS_ENVIRONMENT === "production"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
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

export function isSuccessfulPaymentStatus(status: string | null | undefined) {
  return status === "paid" || status === "success";
}

export function getMidtransAuthorizationHeader(serverKey = process.env.MIDTRANS_SERVER_KEY ?? "") {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}
