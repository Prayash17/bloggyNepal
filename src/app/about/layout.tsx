import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata(
  "About BloggyNepal",
  "Discover the story behind BloggyNepal and its approach to sharing Nepal's culture, landscapes, local experiences, and practical travel information.",
  "/about"
);

export default function AboutLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}