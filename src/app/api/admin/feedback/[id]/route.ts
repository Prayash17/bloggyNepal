import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin-log";

const ALLOWED_STATUSES = [
  "reviewing",
  "resolved",
] as const;

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const body = await req.json();

  const status = body?.status;

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid feedback status." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("feedback")
    .update({
      status,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Admin feedback update error:", error);

    return NextResponse.json(
      { error: "Failed to update feedback." },
      { status: 500 }
    );
  }

  await logAdminAction({
    action: `update_feedback_${status}`,
    entity: "feedback",
    entity_id: id,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  const { error } = await supabaseAdmin
    .from("feedback")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Admin feedback delete error:", error);

    return NextResponse.json(
      { error: "Failed to delete feedback." },
      { status: 500 }
    );
  }

  await logAdminAction({
    action: "delete_feedback",
    entity: "feedback",
    entity_id: id,
  });

  return NextResponse.json({
    success: true,
  });
}