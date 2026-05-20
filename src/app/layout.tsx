import type { Metadata } from "next";
import { getServerLanguage } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";
import { seoKeywords, siteDescription, siteUrl } from "@/lib/seo/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "NaLI",
  title: {
    default: "NaLI — Asisten Laporan Berbasis Bukti",
    template: "%s | NaLI",
  },
  description: siteDescription,
  keywords: seoKeywords,
  alternates: {
    canonical: siteUrl,
  },
  category: "conservation technology",
  openGraph: {
    title: "NaLI — Asisten Laporan Berbasis Bukti",
    description: siteDescription,
    url: siteUrl,
    siteName: "NaLI",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 388,
        alt: "Logo NaLI",
      },
    ],
    locale: "id_ID",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NaLI — Asisten Laporan Berbasis Bukti",
    description: siteDescription,
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getServerLanguage();

  return (
    <html data-scroll-behavior="smooth" lang={language}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <meta name="theme-color" content="#F7F3EA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-[#09090b] font-body-md text-body-md text-white antialiased">
        <I18nProvider initialLanguage={language}>{children}</I18nProvider>
      </body>
    </html>
  );
}
