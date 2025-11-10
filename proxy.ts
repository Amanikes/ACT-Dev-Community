import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Mirrors previous middleware-based auth protection for admin/organizer areas.
export function proxy(request: NextRequest) {
  const { pathname, origin, search } = request.nextUrl;

  // Allow public/login and static paths quickly
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/organizer/login")
  ) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isOrganizerPage = pathname.startsWith("/organizer");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isOrganizerApi = pathname.startsWith("/api/organizer");

  if (!(isAdminPage || isOrganizerPage || isAdminApi || isOrganizerApi)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    // Block API routes with JSON 401
    if (isAdminApi || isOrganizerApi) {
      return NextResponse.json({ error: "Unauthorized: login required" }, { status: 401 });
    }
    // Redirect pages to login with next param
    const nextParam = encodeURIComponent(pathname + (search || ""));
    const loginPath = isOrganizerPage ? "/organizer/login" : "/admin/login";
    const url = new URL(loginPath, origin);
    url.searchParams.set("next", nextParam);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/organizer/:path*", "/api/admin/:path*", "/api/organizer/:path*"],
};

export default proxy;
