import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0, authConfigured } from "@/lib/auth0";

const PROTECTED_PREFIXES = ["/god", "/checkin"];

export async function proxy(request: NextRequest) {
  // Without Auth0 the guest pages still work; admin routes are refused by requireAdmin().
  if (!authConfigured) return NextResponse.next();

  // Mounts /auth/* (login, callback, logout) and keeps the session rolling.
  const authResponse = await auth0.middleware(request);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/auth/")) return authResponse;

  // First line of defence only. Every admin page, action and route still calls requireAdmin(),
  // which also checks the email allow-list.
  if (
    PROTECTED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )
  ) {
    const session = await auth0.getSession(request);
    if (!session) {
      const login = new URL("/auth/login", request.nextUrl.origin);
      login.searchParams.set("returnTo", pathname + search);
      return NextResponse.redirect(login);
    }
  }
  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)",
  ],
};
