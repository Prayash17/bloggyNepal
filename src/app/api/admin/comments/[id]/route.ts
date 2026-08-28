import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin-log";

const ALLOWED_STATUSES = [
  "approved",
  "rejected",
  "spam",
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
      { error: "Invalid comment status." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("comments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Admin comment update error:", error);

    return NextResponse.json(
      { error: "Failed to update comment." },
      { status: 500 }
    );
  }

  await logAdminAction({
    action: `update_comment_${status}`,
    entity: "comment",
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
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Admin comment delete error:", error);

    return NextResponse.json(
      { error: "Failed to delete comment." },
      { status: 500 }
    );
  }

  await logAdminAction({
    action: "delete_comment",
    entity: "comment",
    entity_id: id,
  });

  return NextResponse.json({
    success: true,
  });
}