
import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "bloggyNepal | Honest Travel Guides",
  description:
    "Thoughtful Nepal travel guides, itineraries, destination ideas, and real stories.",
  verification: {
    google: "ptiZgLG_l5VaFlu04WYsGAD-I7wHkESwJvX-v4zwzt8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden bg-[#fbfaf7] text-slate-800 antialiased">
        <Navbar />
        <div className="pt-20">{children}</div>
      </body>
    </html>
  );
}