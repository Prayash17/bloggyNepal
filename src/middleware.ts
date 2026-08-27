import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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
            // Update cookies on the request so the current request
            // sees the refreshed authentication state.
            request.cookies.set(name, value);

            // Update cookies on the response so the browser
            // receives the refreshed authentication state.
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /*
   * IMPORTANT:
   * Always validate the user before protecting admin routes.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  /*
   * /admin/login is public.
   *
   * Logged-out users are allowed to see it.
   * Logged-in users are redirected to /admin.
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