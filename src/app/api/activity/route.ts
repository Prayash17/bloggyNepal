import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST: Record a new activity log
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { action, details } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action field is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("activity_logs")
      .insert([
        {
          action,
          details: details || null,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting activity log:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error logging activity:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET: Fetch recent activity logs (for API usage)
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}