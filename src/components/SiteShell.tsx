"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/Navbar";
import MobileDock from "@/components/MobileDock";

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

      <div className="pt-20 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </div>
      <MobileDock />
    </>
  );
}