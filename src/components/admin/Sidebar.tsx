"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Comments", href: "/admin/comments" },
  { label: "Feedback", href: "/admin/feedback" },
  { label: "Subscribers", href: "/admin/subscribers" },
  { label: "Reactions", href: "/admin/reactions" },
  { label: "Activity Log", href: "/admin/activity" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">BloggyNepal</h2>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
