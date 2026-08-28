import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { response } = await requireAdmin();

  if (response) {
    return response;
  }

  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  if (error) {
    console.error("Admin subscribers GET error:", error);

    return NextResponse.json(
      { error: "Failed to load subscribers." },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}