import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
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

// Clean grotesque for the neo-museum landing display type (scoped via --font-inter).
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
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
    "Nature Life Intelligence",
    "jurnal riset terbuka Indonesia",
    "open-source evidence journal",
    "riset alam Indonesia",
    "sejarah Indonesia",
    "investigasi sumber terbuka",
    "arsip sumber",
  ],
  // favicon/apple-icon resolved from the app/icon.svg file convention (navy gunungan tile)
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
  // Let search engines index everything (except /admin + /api, handled in robots.ts)
  // and allow large image previews + full text snippets for richer listings.
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
  // Ownership verification. Set the tokens in Vercel env to verify the property
  // in Google Search Console / Bing Webmaster Tools (founder step, needs the
  // respective account). Until set, these render nothing.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
};

/** Site-wide structured data: Organization + WebSite (with a sitelinks search box). */
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  alternateName: "Nature Life Intelligence",
  url: SITE.url,
  logo: `${SITE.url}/brand/nali-emblem-navy.png`,
  description: SITE.description,
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  inLanguage: "id-ID",
  description: SITE.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/cari?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${mono.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/* set theme before paint: saved preference, else system */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("nali-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();',
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
        />
        <SiteChrome footer={<Footer />}>{children}</SiteChrome>
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  );
}
