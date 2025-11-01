import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      const url = new URL("/auth/admin/login", backendUrl).toString();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      if (!res.ok) {
        return NextResponse.json(
          { error: text || `Backend error ${res.status}` },
          { status: 401 }
        );
      }
      try {
        const json = JSON.parse(text);
        return NextResponse.json({ ok: true, ...json });
      } catch {
        return NextResponse.json({ ok: true, message: text });
      }
    }

    // Fallback: accept any credentials in dev if no backend configured.
    return NextResponse.json({ ok: true, user: { role: "admin", email } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
