import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    const backendUrl =
      process.env.BACKEND_URL ?? "https://act-dev.onrender.com";
    if (backendUrl) {
      const url = new URL("/admin/reservations", backendUrl);
      if (status) url.searchParams.set("status", status);
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const res = await fetch(url.toString(), {
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
      reservations: [
        {
          id: "r_1",
          eventId: "e_1",
          eventName: "Dev Conference",
          userName: "Ada Lovelace",
          userEmail: "ada@example.com",
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
      ],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
