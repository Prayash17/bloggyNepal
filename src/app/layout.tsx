import type { Metadata } from "next";
import "@/app/globals.css";

import { siteConfig } from "@/lib/site";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: siteConfig.title,
    template: "%s | bloggyNepal",
  },

  description: siteConfig.description,

  applicationName: siteConfig.name,

  generator: "Next.js",

  referrer: "origin-when-cross-origin",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  verification: {
    google: "ptiZgLG_l5VaFlu04WYsGAD-I7wHkESwJvX-v4zwzt8",
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

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    type: "website",
    locale: "en_NP",
    siteName: siteConfig.name,

    title: siteConfig.title,

    description: siteConfig.description,

    images: [
      {
        url: siteConfig.images.og,
        width: 1200,
        height: 630,
        alt: "bloggyNepal — Honest Travel Guides to Nepal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: siteConfig.title,

    description: siteConfig.description,

    images: [siteConfig.images.og],
  },

  category: "travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden bg-[#fbfaf7] text-slate-800 antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}