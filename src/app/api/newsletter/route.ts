import { NextResponse } from "next/server";
import { Resend } from "resend";

import {
  supabaseAdmin,
  checkRateLimit,
  hashIP,
  getClientIP,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };
}

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

function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

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
    // --------------------------------------------------------
    // 1. RATE LIMIT
    // --------------------------------------------------------

    const ip = getClientIP(req);
    const ipHash = hashIP(ip);

    const limit = await checkRateLimit(
      ipHash,
      "newsletter",
      3
    );

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many subscription attempts. Please try again later.",
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
          message: "Welcome!",
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

    const email = cleanText(
      body.email,
      254
    ).toLowerCase();

    const name = cleanText(
      body.name,
      50
    );

    // --------------------------------------------------------
    // 5. VALIDATION
    // --------------------------------------------------------

    if (!email || !isValidEmail(email)) {
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
      name &&
      (name.length < 2 || name.length > 50)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name must be between 2 and 50 characters.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 6. CHECK EXISTING SUBSCRIBER
    // --------------------------------------------------------

    const {
      data: existing,
      error: lookupError,
    } = await supabaseAdmin
      .from("subscribers")
      .select("id, email, status")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "Subscriber lookup failed:",
        lookupError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to process your subscription right now.",
        },
        {
          status: 500,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 7. ALREADY ACTIVE
    // --------------------------------------------------------

    if (existing?.status === "active") {
      return NextResponse.json(
        {
          success: false,
          error:
            "You're already subscribed to BloggyNepal.",
        },
        {
          status: 400,
          headers: noStoreHeaders(),
        }
      );
    }

    // --------------------------------------------------------
    // 8. SAFE SOURCE VALUE
    // --------------------------------------------------------

    // DB constraint allows max 100 chars.
    const source =
      cleanText(
        req.headers.get("referer"),
        100
      ) || "website";

    // --------------------------------------------------------
    // 9. RE-SUBSCRIBE
    // --------------------------------------------------------

    if (existing) {
      const {
        error: updateError,
      } = await supabaseAdmin
        .from("subscribers")
        .update({
          status: "active",
          unsubscribed_at: null,
          subscribed_at:
            new Date().toISOString(),
          name: name || null,
          source,
          ip_hash: ipHash,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error(
          "Subscriber re-subscribe failed:",
          updateError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to reactivate your subscription.",
          },
          {
            status: 500,
            headers: noStoreHeaders(),
          }
        );
      }
    }

    // --------------------------------------------------------
    // 10. NEW SUBSCRIBER
    // --------------------------------------------------------

    else {
      const {
        error: insertError,
      } = await supabaseAdmin
        .from("subscribers")
        .insert({
          email,
          name: name || null,
          status: "active",
          source,
          ip_hash: ipHash,
          subscribed_at:
            new Date().toISOString(),
        });

      if (insertError) {
        console.error(
          "Subscriber insert failed:",
          insertError
        );

        // Handle possible race-condition duplicate.
        if (insertError.code === "23505") {
          return NextResponse.json(
            {
              success: false,
              error:
                "You're already subscribed to BloggyNepal.",
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
              "Unable to save your subscription right now.",
          },
          {
            status: 500,
            headers: noStoreHeaders(),
          }
        );
      }
    }

    // --------------------------------------------------------
    // 11. WELCOME EMAIL
    // --------------------------------------------------------

    if (
      resend &&
      process.env.RESEND_FROM_EMAIL
    ) {
      const safeName = name
        ? escapeHtml(name)
        : "traveller";

      try {
        await resend.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL,

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
                Thank you for joining BloggyNepal.
              </p>

              <p>
                You'll receive useful Nepal travel
                stories, destinations, guides, and
                travel tips.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // Subscription remains successful even if
        // the welcome email fails.
        console.error(
          "Welcome email failed:",
          emailError
        );
      }
    }

    // --------------------------------------------------------
    // 12. SUCCESS
    // --------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Welcome to BloggyNepal!",
      },
      {
        status: 201,
        headers: noStoreHeaders(),
      }
    );
  } catch (error) {
    console.error(
      "Newsletter POST fatal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to process your subscription.",
      },
      {
        status: 500,
        headers: noStoreHeaders(),
      }
    );
  }
}