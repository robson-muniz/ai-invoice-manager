import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Proxy (formerly Middleware) — Next.js 16
 * Protects all dashboard and API routes by verifying the NextAuth JWT token.
 * Renamed from middleware.ts → proxy.ts per Next.js 16 breaking change.
 */
export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/invoices/:path*",
    "/api/customers/:path*",
    "/api/products/:path*",
    "/api/payments/:path*",
  ],
};
