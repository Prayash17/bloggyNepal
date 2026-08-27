import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL in server environment."
  );
}

if (!supabaseSecretKey) {
  throw new Error(
    "Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in server environment."
  );
}

/**
 * -----------------------------------------------------------
 * SERVER-ONLY SUPABASE ADMIN CLIENT
 * -----------------------------------------------------------
 *
 * NEVER import this file into a Client Component.
 *
 * The secret/service-role key bypasses RLS, so this module
 * must remain server-only.
 */
export const supabaseAdmin = createClient(
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
 * -----------------------------------------------------------
 * GET CLIENT IP
 * -----------------------------------------------------------
 *
 * Prefer the first IP from x-forwarded-for, which is commonly
 * provided by Vercel.
 *
 * We never store the raw IP.
 */
export function getClientIP(
  req: Request
): string {
  const forwardedFor =
    req.headers
      .get("x-forwarded-for")
      ?.trim();

  if (forwardedFor) {
    const ip = forwardedFor
      .split(",")[0]
      ?.trim();

    if (ip) {
      return ip;
    }
  }

  const realIP =
    req.headers
      .get("x-real-ip")
      ?.trim();

  if (realIP) {
    return realIP;
  }

  return "0.0.0.0";
}

/**
 * -----------------------------------------------------------
 * HASH IP
 * -----------------------------------------------------------
 *
 * Raw IP addresses are never stored.
 *
 * IP_HASH_SALT should be a dedicated random secret.
 */
export function hashIP(
  ip: string
): string {
  const salt =
    process.env.IP_HASH_SALT?.trim();

  if (!salt) {
    throw new Error(
      "Missing IP_HASH_SALT in server environment."
    );
  }

  return createHash("sha256")
    .update(`${ip}:${salt}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * -----------------------------------------------------------
 * RATE LIMIT TYPES
 * -----------------------------------------------------------
 */
export type RateLimitAction =
  | "reaction"
  | "comment"
  | "feedback"
  | "newsletter";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * -----------------------------------------------------------
 * DATABASE RATE LIMITER
 * -----------------------------------------------------------
 *
 * Current implementation:
 *
 * 1. Count recent requests.
 * 2. Reject when limit is reached.
 * 3. Record the new request.
 *
 * The rate_limits table is private and accessed only by the
 * server-side Supabase client.
 */
export async function checkRateLimit(
  identifier: string,
  action: RateLimitAction,
  maxPerHour: number
): Promise<RateLimitResult> {
  if (
    !identifier ||
    typeof identifier !== "string"
  ) {
    console.error(
      "Rate limit failed: missing or invalid identifier."
    );

    return {
      allowed: false,
      remaining: 0,
    };
  }

  if (
    !Number.isInteger(maxPerHour) ||
    maxPerHour <= 0
  ) {
    console.error(
      "Rate limit failed: invalid maxPerHour."
    );

    return {
      allowed: false,
      remaining: 0,
    };
  }

  const now = Date.now();

  const oneHourAgo =
    new Date(
      now - 60 * 60 * 1000
    ).toISOString();

  try {
    /**
     * -------------------------------------------------------
     * 1. COUNT RECENT REQUESTS
     * -------------------------------------------------------
     */
    const {
      count,
      error: lookupError,
    } = await supabaseAdmin
      .from("rate_limits")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "identifier",
        identifier
      )
      .eq(
        "action",
        action
      )
      .gte(
        "created_at",
        oneHourAgo
      );

    if (lookupError) {
      console.error(
        "❌ Rate limit lookup failed:",
        {
          message:
            lookupError.message,
          code:
            lookupError.code,
          details:
            lookupError.details,
          hint:
            lookupError.hint,
        }
      );

      return {
        allowed: false,
        remaining: 0,
      };
    }

    const currentCount =
      count ?? 0;

    /**
     * -------------------------------------------------------
     * 2. CHECK LIMIT
     * -------------------------------------------------------
     */
    if (
      currentCount >=
      maxPerHour
    ) {
      return {
        allowed: false,
        remaining: 0,
      };
    }

    /**
     * -------------------------------------------------------
     * 3. RECORD REQUEST
     * -------------------------------------------------------
     */
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
        {
          message:
            insertError.message,
          code:
            insertError.code,
          details:
            insertError.details,
          hint:
            insertError.hint,
        }
      );

      return {
        allowed: false,
        remaining: 0,
      };
    }

    /**
     * -------------------------------------------------------
     * 4. PERIODIC CLEANUP
     * -------------------------------------------------------
     *
     * Small random percentage prevents cleanup from running
     * on every request.
     */
    if (Math.random() < 0.05) {
      const oneDayAgo =
        new Date(
          now -
            24 * 60 * 60 * 1000
        ).toISOString();

      void supabaseAdmin
        .from("rate_limits")
        .delete()
        .lt(
          "created_at",
          oneDayAgo
        )
        .then(({ error }) => {
          if (error) {
            console.error(
              "⚠️ Rate limit cleanup failed:",
              error
            );
          }
        })
        .catch((error) => {
          console.error(
            "⚠️ Rate limit cleanup exception:",
            error
          );
        });
    }

    /**
     * -------------------------------------------------------
     * 5. SUCCESS
     * -------------------------------------------------------
     */
    return {
      allowed: true,
      remaining: Math.max(
        0,
        maxPerHour -
          currentCount -
          1
      ),
    };
  } catch (error) {
    console.error(
      "❌ Rate limiter fatal error:",
      error
    );

    return {
      allowed: false,
      remaining: 0,
    };
  }
}