import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function logAdminAction({
  action,
  entity,
  entity_id,
}: {
  action: string;
  entity: string;
  entity_id: string;
}) {
  try {
    // Verify the currently authenticated admin.
    const authClient = await createClient();

    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      console.error("Admin log skipped: no authenticated user.");
      return;
    }

    // Use the service-role client for the private log table.
    const { error } = await supabaseAdmin
      .from("admin_logs")
      .insert({
        admin_id: user.id,
        action,
        entity,
        entity_id,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Admin log insert error:", error);
    }
  } catch (error) {
    console.error("Admin log unexpected error:", error);
  }
}