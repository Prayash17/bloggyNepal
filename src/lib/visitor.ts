import "server-only";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const VISITOR_COOKIE = "bloggynepal_visitor";

export async function getVisitorId(): Promise<{
  visitorId: string;
  isNew: boolean;
}> {
  const cookieStore = await cookies();

  const existing = cookieStore.get(VISITOR_COOKIE)?.value;

  if (existing) {
    return {
      visitorId: existing,
      isNew: false,
    };
  }

  return {
    visitorId: randomUUID(),
    isNew: true,
  };
}

export function setVisitorCookie(
  response: Response,
  visitorId: string
) {
  const nextResponse = response as Response & {
    cookies?: {
      set: (
        name: string,
        value: string,
        options?: Record<string, unknown>
      ) => void;
    };
  };

  nextResponse.cookies?.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}