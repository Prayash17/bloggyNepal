import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Create the response that Supabase can attach refreshed auth cookies to.
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /*
   * IMPORTANT:
   * getUser() validates the authenticated user with Supabase.
   * This is safer for protecting server-side routes than relying
   * only on getSession().
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * /admin/login must ALWAYS be accessible without authentication.
   *
   * If an already-authenticated user visits /admin/login,
   * send them to /admin instead.
   */
  if (pathname === "/admin/login") {
    if (user) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      adminUrl.search = "";

      return NextResponse.redirect(adminUrl);
    }

    return response;
  }

  /*
   * Every other /admin route requires authentication.
   *
   * Example:
   * /admin
   * /admin/comments
   * /admin/feedback
   * /admin/subscribers
   */
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();

      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";

      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};