import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, verifyAdminToken, verifyUserToken } from "./lib/auth";

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/discover",
  "/properties",
  "/agents",
  "/api/auth/login",
  "/api/auth/register",
  "/api/properties",
  "/api/agents",
  "/api/search",
  "/api/inquiries", // Public can submit inquiries
  // User auth
  "/user/login",
  "/user/register",
  "/api/users/auth/login",
  "/api/users/auth/register",
  // Admin auth
  "/admin/login",
  "/api/admin/auth/login",
];

// Check if path starts with any of the public paths
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle admin routes separately
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const adminToken = request.cookies.get("propi_admin_token")?.value;

    if (!adminToken) {
      if (!pathname.startsWith("/api")) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAdminToken(adminToken);

    if (!payload) {
      const response = pathname.startsWith("/api")
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/admin/login", request.url));

      response.cookies.delete("propi_admin_token");
      return response;
    }

    return NextResponse.next();
  }

  // Handle user routes (favorites, saved-searches)
  if (pathname.startsWith("/favorites") || pathname.startsWith("/saved-searches")) {
    const userToken = request.cookies.get("propi_user_token")?.value;

    if (!userToken) {
      return NextResponse.redirect(new URL("/user/login", request.url));
    }

    const payload = await verifyUserToken(userToken);

    if (!payload) {
      const response = NextResponse.redirect(new URL("/user/login", request.url));
      response.cookies.delete("propi_user_token");
      return response;
    }

    return NextResponse.next();
  }

  // Handle user API routes
  if (pathname.startsWith("/api/users") && !pathname.startsWith("/api/users/auth")) {
    const userToken = request.cookies.get("propi_user_token")?.value;

    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyUserToken(userToken);

    if (!payload) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      response.cookies.delete("propi_user_token");
      return response;
    }

    return NextResponse.next();
  }

  // Default: Check agent auth token for dashboard routes
  const token = request.cookies.get("propi_auth_token")?.value;

  if (!token) {
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = pathname.startsWith("/api")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("propi_auth_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
