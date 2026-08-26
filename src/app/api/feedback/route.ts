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

function isAdmin(req: Request): boolean {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return false;
  }

  const authorization =
    req.headers.get("authorization");

  return authorization === `Bearer ${adminKey}`;
}

export async function POST(req: Request) {
  try {
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
          error:
            "Too many submissions. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot
    if (cleanText(body.website, 200)) {
      return NextResponse.json({
        success: true,
      });
    }

    const name = cleanText(body.name, 50);
    const email = cleanText(body.email, 254)
      .toLowerCase();

    const type = cleanText(body.type, 30);

    const message = cleanText(
      body.message,
      3000
    );

    const pageUrl = cleanText(
      body.pageUrl,
      500
    );

    const rating =
      typeof body.rating === "number"
        ? body.rating
        : null;

    if (message.length < 10) {
      return NextResponse.json(
        {
          error:
            "Please provide at least 10 characters.",
        },
        { status: 400 }
      );
    }

    if (
      email &&
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    const validTypes = [
      "bug",
      "suggestion",
      "correction",
      "general",
    ];

    const finalType =
      validTypes.includes(type)
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
          error: "Rating must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("feedback")
      .insert({
        name: name || null,
        email: email || null,
        type: finalType,
        message,
        page_url: pageUrl || null,
        rating,
        status: "new",
        ip_hash: ipHash,
        user_agent:
          req.headers.get("user-agent")?.slice(0, 500) ||
          null,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message:
        "Thank you! Your feedback has been received.",
    });
  } catch (error) {
    console.error("Feedback POST error:", error);

    return NextResponse.json(
      { error: "Unable to submit feedback." },
      { status: 500 }
    );
  }
}

/**
 * PRIVATE ADMIN ENDPOINT
 *
 * Example:
 *
 * GET /api/feedback
 *
 * Authorization:
 * Bearer YOUR_ADMIN_API_KEY
 */
export async function GET(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("feedback")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(200);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      feedback: data ?? [],
    });
  } catch (error) {
    console.error("Feedback GET error:", error);

    return NextResponse.json(
      { error: "Unable to load feedback." },
      { status: 500 }
    );
  }
}