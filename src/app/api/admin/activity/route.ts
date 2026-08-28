import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { response } = await requireAdmin();

  if (response) {
    return response;
  }

  const { data, error } = await supabaseAdmin
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Admin activity GET error:", error);

    return NextResponse.json(
      { error: "Failed to load activity." },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}