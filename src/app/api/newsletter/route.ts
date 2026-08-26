import { NextResponse } from "next/server";
import { Resend } from "resend";

import {
  supabaseAdmin,
  checkRateLimit,
  hashIP,
  getClientIP,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Clean user-provided text.
 */
function cleanText(
  value: unknown,
  maxLength: number
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate an email address.
 *
 * This intentionally stays simple. The real authority
 * for email delivery is still the email provider.
 */
function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/**
 * Escape HTML before placing user content
 * inside the welcome email.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    console.log(
      "================================="
    );
    console.log(
      "NEWSLETTER REQUEST STARTED"
    );
    console.log(
      "================================="
    );

    // ========================================================
    // 1. GET CLIENT IP
    // ========================================================

    const ip = getClientIP(req);
    const ipHash = hashIP(ip);

    console.log(
      "IP hash created:",
      Boolean(ipHash)
    );

    // ========================================================
    // 2. RATE LIMIT
    // ========================================================

    const limit = await checkRateLimit(
      ipHash,
      "newsletter",
      3
    );

    console.log("Rate limit:", limit);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many subscription attempts. Please try again later.",
        },
        { status: 429 }
      );
    }

    // ========================================================
    // 3. READ BODY
    // ========================================================

    let body: {
      email?: unknown;
      name?: unknown;
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
        { status: 400 }
      );
    }

    console.log(
      "Newsletter body received:",
      {
        hasEmail: Boolean(body.email),
        hasName: Boolean(body.name),
        hasWebsite: Boolean(body.website),
      }
    );

    // ========================================================
    // 4. HONEYPOT
    // ========================================================

    const website = cleanText(
      body.website,
      200
    );

    if (website) {
      console.log(
        "HONEYPOT TRIGGERED"
      );

      return NextResponse.json({
        success: true,
        message: "Welcome!",
      });
    }

    // ========================================================
    // 5. CLEAN INPUT
    // ========================================================

    const email = cleanText(
      body.email,
      254
    ).toLowerCase();

    const name = cleanText(
      body.name,
      50
    );

    console.log("Email:", email);
    console.log(
      "Name:",
      name || "(none)"
    );

    // ========================================================
    // 6. VALIDATE EMAIL
    // ========================================================

    if (
      !email ||
      !isValidEmail(email)
    ) {
      console.log(
        "INVALID EMAIL"
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // 7. CHECK EXISTING SUBSCRIBER
    // ========================================================

    const {
      data: existing,
      error: lookupError,
    } = await supabaseAdmin
      .from("subscribers")
      .select(
        "id, email, status"
      )
      .eq("email", email)
      .maybeSingle();

    console.log(
      "Existing subscriber:",
      existing
    );

    console.log(
      "Lookup error:",
      lookupError
    );

    if (lookupError) {
      console.error(
        "❌ SUBSCRIBER LOOKUP FAILED:",
        lookupError
      );

      return NextResponse.json(
        {
          success: false,
          stage: "lookup",
          error:
            lookupError.message,
          details:
            lookupError.details,
          hint:
            lookupError.hint,
          code:
            lookupError.code,
        },
        { status: 500 }
      );
    }

    // ========================================================
    // 8. ALREADY ACTIVE
    // ========================================================

    if (
      existing?.status ===
      "active"
    ) {
      console.log(
        "EMAIL ALREADY ACTIVE"
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "You're already subscribed to BloggyNepal.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // 9. RE-SUBSCRIBE
    // ========================================================

    if (existing) {
      console.log(
        "Re-subscribing existing user..."
      );

      const {
        data: updated,
        error: updateError,
      } = await supabaseAdmin
        .from("subscribers")
        .update({
          status: "active",
          unsubscribed_at: null,
          subscribed_at:
            new Date().toISOString(),
          name:
            name || null,
          ip_hash: ipHash,
        })
        .eq(
          "id",
          existing.id
        )
        .select()
        .single();

      console.log(
        "Updated subscriber:",
        updated
      );

      console.log(
        "Update error:",
        updateError
      );

      if (updateError) {
        console.error(
          "❌ SUBSCRIBER UPDATE FAILED:",
          updateError
        );

        return NextResponse.json(
          {
            success: false,
            stage: "update",
            error:
              updateError.message,
            details:
              updateError.details,
            hint:
              updateError.hint,
            code:
              updateError.code,
          },
          { status: 500 }
        );
      }
    }

    // ========================================================
    // 10. NEW SUBSCRIBER
    // ========================================================

    else {
      console.log(
        "Creating NEW subscriber..."
      );

      const subscriber = {
        email,
        name:
          name || null,
        status: "active",
        source:
          req.headers
            .get("referer")
            ?.slice(0, 500) ||
          "website",
        ip_hash: ipHash,
        subscribed_at:
          new Date().toISOString(),
      };

      console.log(
        "Insert payload:",
        {
          ...subscriber,
          ip_hash:
            "[HASHED]",
        }
      );

      const {
        data: inserted,
        error: insertError,
      } = await supabaseAdmin
        .from("subscribers")
        .insert(
          subscriber
        )
        .select()
        .single();

      console.log(
        "Inserted subscriber:",
        inserted
      );

      console.log(
        "Insert error:",
        insertError
      );

      if (insertError) {
        console.error(
          "❌ SUBSCRIBER INSERT FAILED:",
          insertError
        );

        return NextResponse.json(
          {
            success: false,
            stage: "insert",
            error:
              insertError.message,
            details:
              insertError.details,
            hint:
              insertError.hint,
            code:
              insertError.code,
          },
          { status: 500 }
        );
      }
    }

    // ========================================================
    // 11. SEND WELCOME EMAIL
    // ========================================================

    if (
      resend &&
      process.env.RESEND_FROM_EMAIL
    ) {
      const safeName = name
        ? escapeHtml(name)
        : "traveller";

      try {
        const emailResult =
          await resend.emails.send({
            from:
              process.env
                .RESEND_FROM_EMAIL,

            to: [email],

            subject:
              "🙏 Namaste from BloggyNepal",

            html: `
              <div style="
                font-family: Georgia, serif;
                max-width: 600px;
                margin: 40px auto;
                padding: 40px;
                background: #ffffff;
                border-radius: 24px;
              ">
                <p style="
                  color:#991b1b;
                  font-weight:bold;
                  letter-spacing:3px;
                ">
                  BLOGGYNEPAL
                </p>

                <h1>
                  Welcome aboard.
                </h1>

                <p>
                  Hi ${safeName},
                </p>

                <p>
                  Thank you for joining
                  BloggyNepal.
                </p>

                <p>
                  You'll receive useful
                  Nepal travel stories,
                  destinations, guides,
                  and travel tips.
                </p>
              </div>
            `,
          });

        console.log(
          "✅ Welcome email sent:",
          emailResult
        );
      } catch (emailError) {
        console.error(
          "⚠️ Welcome email failed:",
          emailError
        );
      }
    } else {
      console.log(
        "Resend is not configured. Skipping welcome email."
      );
    }

    // ========================================================
    // 12. SUCCESS
    // ========================================================

    console.log(
      "================================="
    );

    console.log(
      "✅ NEWSLETTER SUCCESS"
    );

    console.log(
      "================================="
    );

    return NextResponse.json({
      success: true,
      message:
        "Welcome to BloggyNepal!",
    });
  } catch (error) {
    console.error(
      "❌ NEWSLETTER FATAL ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        stage: "fatal",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}