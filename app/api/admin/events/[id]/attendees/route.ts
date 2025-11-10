import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // ✅ Await params

    const backendUrl = process.env.BACKEND_URL ?? "https://act-dev.onrender.com";

    const url = new URL(`/admin/events/${id}/attendees`, backendUrl).toString();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(url, {
      next: { revalidate: 0 },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json({ error: text || `Backend error ${res.status}` }, { status: 502 });
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
