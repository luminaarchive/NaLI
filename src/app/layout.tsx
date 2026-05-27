import type { Metadata } from "next";
import { getServerLanguage } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";
import { siteMetadata } from "@/lib/seo/siteMetadata";
import { seoKeywords } from "@/lib/seo/site";
import { Lora, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.canonicalBase),
  applicationName: "NaLI",
  title: {
    default: siteMetadata.defaultTitle,
    template: "%s | NaLI",
  },
  description: siteMetadata.defaultDescription,
  keywords: seoKeywords,
  alternates: {
    canonical: siteMetadata.canonicalBase,
  },
  category: "conservation technology",
  openGraph: {
    title: siteMetadata.defaultTitle,
    description: siteMetadata.defaultDescription,
    url: siteMetadata.canonicalBase,
    siteName: "NaLI",
    images: [
      {
        url: `${siteMetadata.canonicalBase}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "NaLI — Nature & Evidence Intelligence OS logo",
      },
    ],
    locale: "id_ID",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.defaultTitle,
    description: siteMetadata.defaultDescription,
    images: [`${siteMetadata.canonicalBase}/twitter-image`],
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
    <html data-scroll-behavior="smooth" lang={language} className={cn("dark font-sans", geist.variable)}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#060b08" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${lora.variable} ${plusJakartaSans.variable} flex min-h-screen flex-col overflow-x-hidden bg-[#060b08] font-sans antialiased text-[#f5f0e8]`}>
        <I18nProvider initialLanguage={language}>{children}</I18nProvider>
      </body>
    </html>
  );
}
