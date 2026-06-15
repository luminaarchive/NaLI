import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { SiteChrome } from "@/components/SiteChrome";
import { PageViewTracker } from "@/components/PageViewTracker";
import { SITE } from "@/lib/site";

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}, Jurnal Riset Terbuka Indonesia`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  keywords: [
    "NaLI",
    "NatIve",
    "jurnal riset terbuka Indonesia",
    "open-source evidence journal",
    "riset alam Indonesia",
    "sejarah Indonesia",
    "investigasi sumber terbuka",
    "arsip sumber",
  ],
  icons: {
    icon: "/brand/png-exports/nali-app-icon-192x192.png",
    apple: "/brand/png-exports/nali-app-icon-512x512.png",
  },
  openGraph: {
    title: `${SITE.name}, Jurnal Riset Terbuka Indonesia`,
    description: SITE.description,
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE.url,
    images: [
      {
        url: "/brand/og-default.png",
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}`,
    description: SITE.description,
    images: ["/brand/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/* set theme before paint: saved preference, else system */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("nali-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();',
          }}
        />
        <SiteChrome footer={<Footer />}>{children}</SiteChrome>
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  );
}
