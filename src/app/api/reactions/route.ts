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
        { error: "Invalid content request" },
        { status: 400 }
      );
    }

    const { visitorId, isNew } = await getVisitorId();

    const { data, error } = await supabaseAdmin
      .from("reactions")
      .select("emoji, user_id")
      .eq("post_slug", postSlug)
      .eq("content_type", contentType);

    if (error) {
      console.error("Reaction fetch error:", error);
      throw error;
    }

    const counts: Record<string, number> = {};

    let myReaction: string | null = null;

    for (const reaction of data ?? []) {
      counts[reaction.emoji] =
        (counts[reaction.emoji] || 0) + 1;

      if (reaction.user_id === visitorId) {
        myReaction = reaction.emoji;
      }
    }

    const response = NextResponse.json({
      counts,
      total: data?.length ?? 0,
      myReaction,
    });

    if (isNew) {
      setVisitorCookie(response, visitorId);
    }

    return response;
  } catch (error) {
    console.error("Reaction GET error:", error);

    return NextResponse.json(
      { error: "Unable to load reactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
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
          error: "Too many reactions. Please slow down.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    const postId = cleanText(body.postId, 200);
    const postSlug = cleanText(body.postSlug, 200);
    const contentType = cleanText(body.contentType, 30);
    const emoji = body.emoji;

    if (
      !postId ||
      !postSlug ||
      !isContentType(contentType) ||
      !isReactionType(emoji)
    ) {
      return NextResponse.json(
        { error: "Invalid reaction request." },
        { status: 400 }
      );
    }

    const {
      visitorId,
      isNew,
    } = await getVisitorId();

    const { data: existing, error: existingError } =
      await supabaseAdmin
        .from("reactions")
        .select("id, emoji")
        .eq("post_id", postId)
        .eq("user_id", visitorId)
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    // --------------------------------------------------------
    // Toggle OFF
    // --------------------------------------------------------

    if (existing && existing.emoji === emoji) {
      const { error } = await supabaseAdmin
        .from("reactions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        throw error;
      }

      const response = NextResponse.json({
        success: true,
        action: "removed",
        emoji,
        remaining: limit.remaining,
      });

      if (isNew) {
        setVisitorCookie(response, visitorId);
      }

      return response;
    }

    // --------------------------------------------------------
    // Change reaction
    // --------------------------------------------------------

    if (existing) {
      const { error } = await supabaseAdmin
        .from("reactions")
        .update({
          emoji,
          created_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        throw error;
      }

      const response = NextResponse.json({
        success: true,
        action: "updated",
        previousEmoji: existing.emoji,
        emoji,
        remaining: limit.remaining,
      });

      if (isNew) {
        setVisitorCookie(response, visitorId);
      }

      return response;
    }

    // --------------------------------------------------------
    // New reaction
    // --------------------------------------------------------

    const { error } = await supabaseAdmin
      .from("reactions")
      .insert({
        content_type: contentType,
        post_id: postId,
        post_slug: postSlug,
        emoji,
        user_id: visitorId,
        user_agent:
          req.headers.get("user-agent")?.slice(0, 500) || null,
      });

    if (error) {
      throw error;
    }

    const response = NextResponse.json({
      success: true,
      action: "added",
      emoji,
      remaining: limit.remaining,
    });

    if (isNew) {
      setVisitorCookie(response, visitorId);
    }

    return response;
  } catch (error) {
    console.error("Reaction POST error:", error);

    return NextResponse.json(
      { error: "Unable to save reaction." },
      { status: 500 }
    );
  }
}