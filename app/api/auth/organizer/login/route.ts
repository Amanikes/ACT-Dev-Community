import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const email = raw?.email as string | undefined;
    const username = (raw?.username as string | undefined) ?? email;
    const password = raw?.password as string | undefined;
    // Require a username; allow any password string (including empty)
    if (!username || typeof password === "undefined") {
      return NextResponse.json(
        { error: "Missing username/email or password" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL ?? "https://act-dev.onrender.com";
    if (backendUrl) {
      const url = new URL("/organizer/login", backendUrl).toString();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
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
        const token: string | undefined = (json &&
          (json.accessToken || json.token)) as string | undefined;
        const response = NextResponse.json({ ok: true, ...json });
        if (token) {
          response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            path: "/",
            maxAge: 60 * 60 * 8, // 8h
          });
        }
        return response;
      } catch {
        const response = NextResponse.json({ ok: true, message: text });
        return response;
      }
    }

    // Fallback: accept any credentials in dev if no backend configured.
    return NextResponse.json({ ok: true, user: { role: "organizer", email } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
