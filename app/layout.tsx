import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
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
    default: `${SITE.name} — Field Journal & Research Publication`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  keywords: [
    "NaLI",
    "NatIve",
    "field journal Indonesia",
    "riset alam Indonesia",
    "sejarah Indonesia",
    "investigasi",
    "AI research publication",
  ],
  icons: {
    icon: "/brand/png-exports/nali-app-icon-192x192.png",
    apple: "/brand/png-exports/nali-app-icon-512x512.png",
  },
  openGraph: {
    title: `${SITE.name} — Field Journal & Research Publication`,
    description: SITE.description,
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}`,
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
