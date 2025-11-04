import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const data = body?.data as string | undefined;
    if (!data || typeof data !== "string") {
      return NextResponse.json(
        { error: "Missing 'data' in request body" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL ?? "https://act-dev.onrender.com";
    if (backendUrl) {
      // Forward to mark attendance according to Swagger
      // Try to coerce a studentId from the scanned data
      const parsedId = Number(String(data).trim());
      const body = Number.isFinite(parsedId)
        ? { studentId: parsedId }
        : { studentId: String(data) };
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const res = await fetch(
        new URL("/organizer/mark-attendance", backendUrl).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        }
      );
      const text = await res.text();
      if (!res.ok) {
        return NextResponse.json(
          { error: text || `Backend error ${res.status}` },
          { status: 502 }
        );
      }
      try {
        const json = JSON.parse(text);
        return NextResponse.json({ ok: true, ...json });
      } catch {
        return NextResponse.json({ ok: true, message: text });
      }
    }

    // No backend configured; accept and echo for now.
    return NextResponse.json({ ok: true, message: "Received", data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
