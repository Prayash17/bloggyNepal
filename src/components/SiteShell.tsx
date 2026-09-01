"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/Navbar";

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isStudioRoute =
    pathname === "/studio" ||
    pathname.startsWith("/studio/");

  if (isStudioRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />

      <div className="pt-20">
        {children}
      </div>
    </>
  );
}