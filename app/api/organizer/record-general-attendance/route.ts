import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json();
    if (!studentId || typeof studentId !== "string") {
      return NextResponse.json({ message: "studentId is required" }, { status: 400 });
    }

    // TODO: upsert attendance (idempotent per eventId+studentId)
    // await prisma.attendance.upsert(...)

    return NextResponse.json({ message: "Attendance recorded", studentId }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Invalid request" }, { status: 400 });
  }
}

// Optional: make other methods explicit 405
export function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
