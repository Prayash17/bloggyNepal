import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "bloggyNepal - Honest Travel Guides",
  description: "Explore Nepal with real maps, itineraries, and stories.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-slate-700">
        <Navbar />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}