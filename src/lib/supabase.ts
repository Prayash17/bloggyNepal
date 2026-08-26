import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL"
  );
}

if (!supabaseSecretKey) {
  throw new Error(
    "Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY"
  );
}

/**
 * SERVER-ONLY SUPABASE CLIENT
 *
 * This client uses the secret/service-role key.
 *
 * NEVER import this file into a client component.
 */
export const supabaseAdmin =
  createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

/**
 * Create a privacy-aware hash of the client IP.
 *
 * We never store the raw IP.
 */
export function hashIP(ip: string): string {
  const salt =
    process.env.IP_HASH_SALT ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "bloggy-nepal-default-salt";

  return createHash("sha256")
    .update(`${ip}:${salt}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Get the client IP from the request.
 */
export function getClientIP(
  req: Request
): string {
  const realIP =
    req.headers.get("x-real-ip");

  if (realIP) {
    return realIP.trim();
  }

  const forwardedFor =
    req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  return "0.0.0.0";
}

/**
 * Database-backed rate limiter.
 */
export async function checkRateLimit(
  identifier: string,
  action:
    | "reaction"
    | "comment"
    | "feedback"
    | "newsletter",
  maxPerHour: number
): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const oneHourAgo =
    new Date(
      Date.now() -
        60 * 60 * 1000
    ).toISOString();

  // -----------------------------------------
  // Check recent requests
  // -----------------------------------------

  const {
    count,
    error: lookupError,
  } = await supabaseAdmin
    .from("rate_limits")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("identifier", identifier)
    .eq("action", action)
    .gte(
      "created_at",
      oneHourAgo
    );

  if (lookupError) {
    console.error(
      "❌ Rate limit lookup failed:",
      lookupError
    );

    return {
      allowed: false,
      remaining: 0,
    };
  }

  const currentCount =
    count ?? 0;

  if (
    currentCount >=
    maxPerHour
  ) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  // -----------------------------------------
  // Record this request
  // -----------------------------------------

  const {
    error: insertError,
  } = await supabaseAdmin
    .from("rate_limits")
    .insert({
      identifier,
      action,
    });

  if (insertError) {
    console.error(
      "❌ Rate limit insert failed:",
      insertError
    );

    return {
      allowed: false,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining:
      maxPerHour -
      currentCount -
      1,
  };
}