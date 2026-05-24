import type { Metadata } from "next";
import { siteMetadata } from "@/lib/seo/siteMetadata";
import { AgentWorkspace } from "@/components/report/AgentWorkspace";

export const metadata: Metadata = {
  title: siteMetadata.routes.createReport.title,
  description: siteMetadata.routes.createReport.description,
  alternates: {
    canonical: `${siteMetadata.canonicalBase}/create-report`,
  },
};

export default function CreateReportPage() {
  return <AgentWorkspace />;
}
