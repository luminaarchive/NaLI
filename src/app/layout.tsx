import type { Metadata } from "next";
import { getServerLanguage } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";
import { seoKeywords, siteDescription, siteUrl } from "@/lib/seo/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "NaLI",
  title: {
    default: "NaLI - Evidence-Based Reports and Field Intelligence",
    template: "%s | NaLI",
  },
  description: siteDescription,
  keywords: seoKeywords,
  alternates: {
    canonical: siteUrl,
  },
  category: "conservation technology",
  openGraph: {
    title: "NaLI - Evidence-Based Reports and Field Intelligence",
    description: siteDescription,
    url: siteUrl,
    siteName: "NaLI",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "NaLI wildlife field intelligence logo",
      },
    ],
    locale: "en_US",
    alternateLocale: ["id_ID"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NaLI - Evidence-Based Reports and Field Intelligence",
    description: siteDescription,
    images: ["/icon.svg"],
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#1e3525" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-surface text-on-surface font-body-md text-body-md selection:bg-primary flex min-h-screen flex-col overflow-x-hidden antialiased selection:text-stone-50">
        <I18nProvider initialLanguage={language}>{children}</I18nProvider>
      </body>
    </html>
  );
}
