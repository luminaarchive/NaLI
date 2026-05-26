export type ReportPackageId = "basic" | "pro" | "pro_bundle";
export type PaidReportType = "basic" | "pro";
export type InternalReportEngine = "basic_report_engine" | "pro_report_engine";

export type ReportPackage = {
  id: ReportPackageId;
  internalEngine: InternalReportEngine;
  label: string;
  paymentActive: false;
  priceIdr: number;
  publicCopy: string;
  reportsIncluded: number;
  reportType: PaidReportType;
};

export const REPORT_PACKAGES: readonly ReportPackage[] = [
  {
    id: "basic",
    internalEngine: "basic_report_engine",
    label: "Basic",
    paymentActive: false,
    priceIdr: 15_000,
    publicCopy: "5 laporan cepat",
    reportsIncluded: 5,
    reportType: "basic",
  },
  {
    id: "pro",
    internalEngine: "pro_report_engine",
    label: "Pro",
    paymentActive: false,
    priceIdr: 49_000,
    publicCopy: "5 laporan lengkap",
    reportsIncluded: 5,
    reportType: "pro",
  },
  {
    id: "pro_bundle",
    internalEngine: "pro_report_engine",
    label: "Pro Bundle",
    paymentActive: false,
    priceIdr: 89_000,
    publicCopy: "10 laporan lengkap",
    reportsIncluded: 10,
    reportType: "pro",
  },
] as const;

export function getReportPackage(packageId: ReportPackageId) {
  return REPORT_PACKAGES.find((reportPackage) => reportPackage.id === packageId);
}
