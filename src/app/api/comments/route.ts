
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
export const revalidate = 0;

type ContentType =
  | "district"
  | "destination"
  | "story";

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };
}

/**
 * GET /api/comments
 *
 * Returns only approved comments for one post.
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

    if (!postSlug || !isContentType(contentType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid content request.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("comments")
      .select(
        "id, author_name, content, parent_id, created_at"
      )
      .eq("content_type", contentType as ContentType)
      .eq("post_slug", postSlug)
      .eq("status", "approved")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Comments GET database error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load comments.",
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
        comments: data ?? [],
      },
      {
        status: 200,
        headers: noStoreHeaders(),
      }
    );
  } catch (error) {
    console.error("Comments GET fatal error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load comments.",
      },
      {
        status: 500,
        headers: noStoreHeaders(),
      }
    );
  }
}

/**
 * POST /api/comments
 *
 * Creates a pending comment.
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

    const website = cleanText(body.website, 200);

    if (website) {
      return NextResponse.json(
        {
          success: true,
          message: "Your comment has been received.",
        },
        {
          status: 201,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 4. CLEAN INPUT
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // 5. VALIDATION
    // --------------------------------------------------------

    if (
      !authorName ||
      authorName.length < 2 ||
      authorName.length > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid name.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    if (
      !authorEmail ||
      authorEmail.length > 254 ||
      !isValidEmail(authorEmail)
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
      content.length < 2 ||
      content.length > 2000
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            content.length > 2000
              ? "Comment is too long."
              : "Comment is too short.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    if (
      !postSlug ||
      !isContentType(contentType)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid content.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 6. OPTIONAL PARENT COMMENT
    // --------------------------------------------------------

    let validParentId: string | null = null;

    if (parentId) {
      const { data: parent, error: parentError } =
        await supabaseAdmin
          .from("comments")
          .select(
            "id, post_slug, content_type, status"
          )
          .eq("id", parentId)
          .maybeSingle();

      if (parentError) {
        console.error(
          "Parent comment lookup failed:",
          parentError
        );

        return NextResponse.json(
          {
            success: false,
            error: "Unable to validate reply.",
          },
          {
            status: 500,
            headers: noStoreHeaders(),
          }
        );
      }

      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The comment you're replying to does not exist.",
          },
          {
            status: 400,
            headers: noStoreHeaders(),
          }
        );
      }

      // Reply must belong to the same post.
      if (
        parent.post_slug !== postSlug ||
        parent.content_type !== contentType ||
        parent.status !== "approved"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "You can only reply to an approved comment on this post.",
          },
          {
            status: 400,
            headers: noStoreHeaders(),
          }
        );
      }

      validParentId = parentId;
    }

    // --------------------------------------------------------
    // 7. SERVER-CONTROLLED VALUES
    // --------------------------------------------------------

    const userAgent =
      req.headers
        .get("user-agent")
        ?.slice(0, 500) || null;

    // IMPORTANT:
    // Never accept status from the browser.
    // Every public comment starts as "pending".
    const insertPayload = {
      content_type:
        contentType as ContentType,
      post_slug: postSlug,
      author_name: authorName,
      author_email: authorEmail,
      content,
      parent_id: validParentId,
      status: "pending",
      ip_hash: ipHash,
      user_agent: userAgent,
    };

    // --------------------------------------------------------
    // 8. INSERT
    // --------------------------------------------------------

    const { data, error } =
      await supabaseAdmin
        .from("comments")
        .insert(insertPayload)
        .select(
          "id, author_name, content, parent_id, created_at, status"
        )
        .single();

    if (error) {
      console.error(
        "Comment insert failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to save your comment right now.",
        },
        {
          status: 500,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 9. SUCCESS
    // --------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Thanks! Your comment has been submitted and is awaiting review.",
        comment: data,
      },
      {
        status: 201,
        headers: noStoreHeaders(),
      }
    );
  } catch (error) {
    console.error(
      "Comments POST fatal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to submit comment.",
      },
      {
        status: 500,
        headers: noStoreHeaders(),
      }
    );
  }
}