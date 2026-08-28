import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

function escapeCsv(value: unknown): string {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export async function GET() {
  const { response } = await requireAdmin();

  if (response) {
    return response;
  }

  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .select("email, name, status, subscribed_at")
    .eq("status", "active")
    .order("subscribed_at", { ascending: false });

  if (error) {
    console.error("Subscriber export error:", error);

    return NextResponse.json(
      { error: "Failed to export subscribers." },
      { status: 500 }
    );
  }

  const csvRows = [
    ["Email", "Name", "Status", "Subscribed At"],
    ...(data ?? []).map((row) => [
      row.email,
      row.name || "",
      row.status,
      row.subscribed_at,
    ]),
  ];

  const csv = csvRows
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        "attachment; filename=subscribers.csv",
    },
  });
}