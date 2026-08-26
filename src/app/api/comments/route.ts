import { NextResponse } from "next/server";

import {
  supabaseAdmin,
  checkRateLimit,
  hashIP,
  getClientIP,
} from "@/lib/supabase";

import {
  cleanText,
  isContentType,
  isValidEmail,
} from "@/lib/engagement";

export const dynamic = "force-dynamic";

type ContentType =
  | "district"
  | "destination"
  | "story";

/**
 * GET
 *
 * Return approved comments for a post.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const postSlug = cleanText(
      url.searchParams.get("postSlug"),
      200
    );

    const contentType = cleanText(
      url.searchParams.get("contentType"),
      30
    );

    if (
      !postSlug ||
      !isContentType(contentType)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid content request.",
        },
        { status: 400 }
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("comments")
      .select(
        "id, author_name, content, parent_id, created_at"
      )
      .eq(
        "content_type",
        contentType as ContentType
      )
      .eq("post_slug", postSlug)
      .eq("status", "approved")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Comments GET error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load comments.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comments: data ?? [],
    });
  } catch (error) {
    console.error(
      "Comments GET fatal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load comments.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 *
 * Create a new pending comment.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIP(req);
    const ipHash = hashIP(ip);

    const limit = await checkRateLimit(
      ipHash,
      "comment",
      5
    );

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many comments. Please try again later.",
        },
        { status: 429 }
      );
    }

    let body: {
      authorName?: unknown;
      authorEmail?: unknown;
      content?: unknown;
      website?: unknown;
      postSlug?: unknown;
      contentType?: unknown;
      parentId?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Honeypot
    // -----------------------------------------

    const website = cleanText(
      body.website,
      200
    );

    if (website) {
      return NextResponse.json({
        success: true,
        message:
          "Your comment has been received.",
      });
    }

    // -----------------------------------------
    // Clean fields
    // -----------------------------------------

    const authorName = cleanText(
      body.authorName,
      50
    );

    const authorEmail = cleanText(
      body.authorEmail,
      254
    ).toLowerCase();

    const content = cleanText(
      body.content,
      2000
    );

    const postSlug = cleanText(
      body.postSlug,
      200
    );

    const contentType = cleanText(
      body.contentType,
      30
    );

    const parentId = cleanText(
      body.parentId,
      100
    );

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (
      !authorName ||
      authorName.length < 2
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter your name.",
        },
        { status: 400 }
      );
    }

    if (
      !authorEmail ||
      !isValidEmail(authorEmail)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    if (content.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Comment is too short.",
        },
        { status: 400 }
      );
    }

    if (
      content.length > 2000
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Comment is too long.",
        },
        { status: 400 }
      );
    }

    if (
      !postSlug ||
      !isContentType(contentType)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid content.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Optional parent comment
    // -----------------------------------------

    let validParentId:
      | string
      | null = null;

    if (parentId) {
      const {
        data: parent,
        error: parentError,
      } = await supabaseAdmin
        .from("comments")
        .select("id")
        .eq("id", parentId)
        .eq("status", "approved")
        .maybeSingle();

      if (parentError) {
        console.error(
          "Parent comment lookup failed:",
          parentError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to validate reply.",
          },
          { status: 500 }
        );
      }

      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The comment you're replying to does not exist.",
          },
          { status: 400 }
        );
      }

      validParentId = parentId;
    }

    // -----------------------------------------
    // Insert pending comment
    // -----------------------------------------

    const { data, error } =
      await supabaseAdmin
        .from("comments")
        .insert({
          content_type:
            contentType as ContentType,
          post_slug: postSlug,
          author_name: authorName,
          author_email: authorEmail,
          content,
          parent_id:
            validParentId,
          status: "pending",
          ip_hash: ipHash,
          user_agent:
            req.headers
              .get("user-agent")
              ?.slice(0, 500) || null,
        })
        .select(
          "id, author_name, content, parent_id, created_at, status"
        )
        .single();

    if (error) {
      console.error(
        "Comment insert error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          stage: "insert",
          error:
            error.message,
          details:
            error.details,
          hint:
            error.hint,
          code:
            error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thanks! Your comment has been submitted and is awaiting review.",
        comment: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Comments POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to submit comment.",
      },
      { status: 500 }
    );
  }
}