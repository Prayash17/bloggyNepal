import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { response } = await requireAdmin();

  if (response) {
    return response;
  }

  const { data: reactions, error } = await supabaseAdmin
    .from("reactions")
    .select("emoji, post_slug");

  if (error) {
    console.error("Admin reactions GET error:", error);

    return NextResponse.json(
      { error: "Failed to load reactions." },
      { status: 500 }
    );
  }

  const typeCounts: Record<string, number> = {};
  const pageCounts: Record<string, number> = {};

  for (const reaction of reactions ?? []) {
    const emoji = reaction.emoji || "unknown";
    const slug = reaction.post_slug || "unknown";

    typeCounts[emoji] = (typeCounts[emoji] || 0) + 1;
    pageCounts[slug] = (pageCounts[slug] || 0) + 1;
  }

  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({
      slug,
      count,
    }));

  return NextResponse.json({
    typeCounts,
    topPages,
    total: reactions?.length ?? 0,
  });
}