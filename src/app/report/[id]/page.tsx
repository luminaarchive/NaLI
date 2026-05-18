import { ReportResultClient } from "@/components/report/ReportResultClient";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ReportResultClient reportId={id} />;
}
