import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "bloggyNepal — Stories from the Roof of the World",
  description:
    "Notes, photographs, and honest stories from the Himalayas. Sharing the Nepal beyond the postcards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* ⬇️ Navbar appears on every page */}
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
