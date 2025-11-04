import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventDate } = body || {};
    if (!eventName || !eventDate) {
      return NextResponse.json(
        { error: "Missing eventName or eventDate" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL ?? "https://act-dev.onrender.com/api";
    const url = new URL("/admin/events", backendUrl).toString();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ eventName, eventDate }),
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
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
