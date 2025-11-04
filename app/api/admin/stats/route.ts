import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const backendUrl =
      process.env.BACKEND_URL ?? "https://act-dev.onrender.com/api";
    if (backendUrl) {
      const url = new URL("/admin/dashboard-stats", backendUrl).toString();
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const res = await fetch(url, {
        next: { revalidate: 0 },
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const text = await res.text();
      if (!res.ok) {
        return NextResponse.json(
          { error: text || `Backend error ${res.status}` },
          { status: 502 }
        );
      }
      try {
        const json = JSON.parse(text);
        return NextResponse.json(json);
      } catch {
        return NextResponse.json({ message: text });
      }
    }
    // Dev fallback
    return NextResponse.json({
      todayRegistrations: 12,
      upcomingEvents: 3,
      activeReservations: 27,
      totalRegisteredUsers: 542,
      allUsers: 612,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
