import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // No valid authenticated Supabase user
  if (error || !user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const adminUserId = process.env.ADMIN_USER_ID?.trim();

  // Fail closed if the admin ID has not been configured.
  if (!adminUserId) {
    console.error("ADMIN_USER_ID is not configured.");
    return {
      user: null,
      response: NextResponse.json(
        { error: "Admin authorization is not configured." },
        { status: 500 }
      ),
    };
  }

  // Authenticated does NOT automatically mean administrator.
  if (user.id !== adminUserId) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}