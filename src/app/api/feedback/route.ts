import { NextResponse } from "next/server";

import {
  supabaseAdmin,
  checkRateLimit,
  hashIP,
  getClientIP,
} from "@/lib/supabase";

import {
  cleanText,
  isValidEmail,
} from "@/lib/engagement";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };
}

function isAdmin(req: Request): boolean {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return false;
  }

  const authorization =
    req.headers.get("authorization");

  return authorization === `Bearer ${adminKey}`;
}

/**
 * POST /api/feedback
 *
 * Public feedback submission.
 */
export async function POST(req: Request) {
  try {
    // --------------------------------------------------------
    // 1. RATE LIMIT
    // --------------------------------------------------------

    const ip = getClientIP(req);
    const ipHash = hashIP(ip);

    const limit = await checkRateLimit(
      ipHash,
      "feedback",
      5
    );

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many submissions. Please try again later.",
        },
        {
          status: 429,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 2. PARSE BODY
    // --------------------------------------------------------

    let body: {
      name?: unknown;
      email?: unknown;
      type?: unknown;
      message?: unknown;
      pageUrl?: unknown;
      rating?: unknown;
      website?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 3. HONEYPOT
    // --------------------------------------------------------

    if (cleanText(body.website, 200)) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Thank you! Your feedback has been received.",
        },
        {
          status: 200,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 4. CLEAN INPUT
    // --------------------------------------------------------

    const name = cleanText(
      body.name,
      50
    );

    const email = cleanText(
      body.email,
      254
    ).toLowerCase();

    const type = cleanText(
      body.type,
      30
    );

    const message = cleanText(
      body.message,
      3000
    );

    const pageUrl = cleanText(
      body.pageUrl,
      2048
    );

    const rating =
      typeof body.rating === "number"
        ? body.rating
        : null;

    // --------------------------------------------------------
    // 5. VALIDATION
    // --------------------------------------------------------

    if (
      name &&
      (name.length < 2 || name.length > 50)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Name must be between 2 and 50 characters.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    if (
      email &&
      (!isValidEmail(email) ||
        email.length > 254)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    if (
      !message ||
      message.length < 10
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide at least 10 characters.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Feedback message is too long.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    if (pageUrl.length > 2048) {
      return NextResponse.json(
        {
          success: false,
          error: "Page URL is too long.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    const validTypes = [
      "bug",
      "suggestion",
      "correction",
      "general",
    ];

    const finalType = validTypes.includes(type)
      ? type
      : "general";

    if (
      rating !== null &&
      (!Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rating must be between 1 and 5.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 6. SERVER-CONTROLLED VALUES
    // --------------------------------------------------------

    const userAgent =
      req.headers
        .get("user-agent")
        ?.slice(0, 500) || null;

    // Never accept "status" from the frontend.
    const insertPayload = {
      name: name || null,
      email: email || null,
      type: finalType,
      message,
      page_url: pageUrl || null,
      rating,
      status: "new",
      ip_hash: ipHash,
      user_agent: userAgent,
    };

    // --------------------------------------------------------
    // 7. INSERT
    // --------------------------------------------------------

    const { error } =
      await supabaseAdmin
        .from("feedback")
        .insert(insertPayload);

    if (error) {
      console.error(
        "Feedback insert failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to save your feedback right now.",
        },
        {
          status: 500,
          headers: noStoreHeaders(),
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! Your feedback has been received.",
      },
      {
        status: 201,
        headers: noStoreHeaders(),
      }
    );
  } catch (error) {
    console.error(
      "Feedback POST fatal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to submit feedback.",
      },
      {
        status: 500,
        headers: noStoreHeaders(),
      }
    );
  }
}

/**
 * GET /api/feedback
 *
 * PRIVATE ADMIN ENDPOINT
 *
 * Requires:
 * Authorization: Bearer YOUR_ADMIN_API_KEY
 */
export async function GET(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
          headers: noStoreHeaders(),
        }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("feedback")
        .select(
          "id, name, email, type, message, page_url, rating, status, created_at"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(200);

    if (error) {
      console.error(
        "Feedback admin GET failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load feedback.",
        },
        {
          status: 500,
          headers: noStoreHeaders(),
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        feedback: data ?? [],
      },
      {
        status: 200,
        headers: noStoreHeaders(),
      }
    );
  } catch (error) {
    console.error(
      "Feedback admin GET fatal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load feedback.",
      },
      {
        status: 500,
        headers: noStoreHeaders(),
      }
    );
  }
}