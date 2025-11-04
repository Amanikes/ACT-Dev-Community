import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function middlewareImpl(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;

  // Allow login routes without auth
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/organizer/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  // Only guard admin/organizer areas and their APIs
  const isAdminPage = pathname.startsWith("/admin");
  const isOrganizerPage = pathname.startsWith("/organizer");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isOrganizerApi = pathname.startsWith("/api/organizer");

  if (!(isAdminPage || isOrganizerPage || isAdminApi || isOrganizerApi)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  // If no token, redirect pages and block APIs
  if (!token) {
    if (isAdminApi || isOrganizerApi) {
      return NextResponse.json(
        { error: "Unauthorized: login required" },
        { status: 401 }
      );
    }

    // Build redirect URL to appropriate login with next param
    const nextParam = encodeURIComponent(pathname + (search || ""));
    const loginPath = isOrganizerPage ? "/organizer/login" : "/admin/login";
    const url = new URL(loginPath, origin);
    url.searchParams.set("next", nextParam);
    return NextResponse.redirect(url);
  }

  // Token present, allow request to continue
  return NextResponse.next();
}

export function middleware(req: NextRequest) {
  return middlewareImpl(req);
}

export default middlewareImpl;

export const config = {
  matcher: [
    "/admin/:path*",
    "/organizer/:path*",
    "/api/admin/:path*",
    "/api/organizer/:path*",
  ],
};
