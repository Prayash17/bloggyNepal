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
  isReactionType,
} from "@/lib/engagement";

import {
  getVisitorId,
  setVisitorCookie,
} from "@/lib/visitor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };
}

/**
 * GET /api/reactions
 *
 * Returns counts + this visitor's reaction.
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
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    // Server-controlled visitor ID.
    const {
      visitorId,
      isNew,
    } = await getVisitorId();

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("reactions")
      .select("emoji, user_id")
      .eq("post_slug", postSlug)
      .eq("content_type", contentType);

    if (error) {
      console.error(
        "Reaction GET database error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load reactions.",
        },
        {
          status: 500,
          headers: noStoreHeaders(),
        }
      );
    }

    const counts: Record<string, number> = {};

    let myReaction: string | null = null;

    for (const reaction of data ?? []) {
      counts[reaction.emoji] =
        (counts[reaction.emoji] || 0) + 1;

      if (
        reaction.user_id === visitorId
      ) {
        myReaction = reaction.emoji;
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        counts,
        total: data?.length ?? 0,
        myReaction,
      },
      {
        status: 200,
        headers: noStoreHeaders(),
      }
    );

    if (isNew) {
      setVisitorCookie(
        response,
        visitorId
      );
    }

    return response;
  } catch (error) {
    console.error(
      "Reaction GET fatal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load reactions.",
      },
      {
        status: 500,
        headers: noStoreHeaders(),
      }
    );
  }
}

/**
 * POST /api/reactions
 *
 * Adds, changes, or removes the current
 * visitor's reaction.
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
      "reaction",
      30
    );

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many reactions. Please slow down.",
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
      postId?: unknown;
      postSlug?: unknown;
      contentType?: unknown;
      emoji?: unknown;
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
    // 3. CLEAN INPUT
    // --------------------------------------------------------

    const postId = cleanText(
      body.postId,
      200
    );

    const postSlug = cleanText(
      body.postSlug,
      200
    );

    const contentType = cleanText(
      body.contentType,
      30
    );

    const emoji = cleanText(
      body.emoji,
      20
    );

    // --------------------------------------------------------
    // 4. VALIDATE
    // --------------------------------------------------------

    if (
      !postId ||
      !postSlug ||
      !isContentType(contentType) ||
      !isReactionType(emoji)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid reaction request.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 5. GET SERVER-CONTROLLED VISITOR ID
    // --------------------------------------------------------

    const {
      visitorId,
      isNew,
    } = await getVisitorId();

    // --------------------------------------------------------
    // 6. LOOK FOR EXISTING REACTION
    // --------------------------------------------------------

    const {
      data: existing,
      error: existingError,
    } = await supabaseAdmin
      .from("reactions")
      .select("id, emoji")
      .eq("post_id", postId)
      .eq("user_id", visitorId)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Reaction lookup failed:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to process your reaction.",
        },
        {
          status: 500,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 7. TOGGLE OFF
    // --------------------------------------------------------

    if (
      existing &&
      existing.emoji === emoji
    ) {
      const {
        error: deleteError,
      } = await supabaseAdmin
        .from("reactions")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        console.error(
          "Reaction delete failed:",
          deleteError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to remove reaction.",
          },
          {
            status: 500,
            headers: noStoreHeaders(),
          }
        );
      }

      const response = NextResponse.json(
        {
          success: true,
          action: "removed",
          emoji,
          remaining: limit.remaining,
        },
        {
          status: 200,
          headers: noStoreHeaders(),
        }
      );

      if (isNew) {
        setVisitorCookie(
          response,
          visitorId
        );
      }

      return response;
    }

    // --------------------------------------------------------
    // 8. CHANGE EXISTING REACTION
    // --------------------------------------------------------

    if (existing) {
      const {
        error: updateError,
      } = await supabaseAdmin
        .from("reactions")
        .update({
          emoji,
          created_at:
            new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error(
          "Reaction update failed:",
          updateError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to update reaction.",
          },
          {
            status: 500,
            headers: noStoreHeaders(),
          }
        );
      }

      const response = NextResponse.json(
        {
          success: true,
          action: "updated",
          previousEmoji: existing.emoji,
          emoji,
          remaining: limit.remaining,
        },
        {
          status: 200,
          headers: noStoreHeaders(),
        }
      );

      if (isNew) {
        setVisitorCookie(
          response,
          visitorId
        );
      }

      return response;
    }

    // --------------------------------------------------------
    // 9. NEW REACTION
    // --------------------------------------------------------

    const {
      error: insertError,
    } = await supabaseAdmin
      .from("reactions")
      .insert({
        content_type: contentType,
        post_id: postId,
        post_slug: postSlug,
        emoji,
        user_id: visitorId,
        user_agent:
          req.headers
            .get("user-agent")
            ?.slice(0, 500) || null,
      });

    if (insertError) {
      console.error(
        "Reaction insert failed:",
        insertError
      );

      // Unique constraint race-condition handling.
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Your reaction was already registered. Please refresh.",
          },
          {
            status: 409,
            headers: noStoreHeaders(),
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to save reaction.",
        },
        {
          status: 500,
          headers: noStoreHeaders(),
        }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        action: "added",
        emoji,
        remaining: limit.remaining,
      },
      {
        status: 201,
        headers: noStoreHeaders(),
      }
    );

    if (isNew) {
      setVisitorCookie(
        response,
        visitorId
      );
    }

    return response;
  } catch (error) {
    console.error(
      "Reaction POST fatal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to save reaction.",
      },
      {
        status: 500,
        headers: noStoreHeaders(),
      }
    );
  }
}