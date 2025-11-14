"use client";

import React from "react";
import dynamic from "next/dynamic";
const QrScanner = dynamic(() => import("@/components/qr-scanner").then((m) => m.QrScanner), { ssr: false });
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function extractNameFromPayload(responseText: string, scannedData: string): string {
  const tryExtract = (val: unknown) => {
    if (!val || typeof val !== "object") return null;
    const obj = val as any;
    const name = obj?.name ?? obj?.student?.name ?? obj?.participant?.name ?? obj?.user?.name ?? null;
    return typeof name === "string" && name.trim() ? name.trim() : null;
  };
  try {
    const json = JSON.parse(responseText);
    const n = tryExtract(json);
    if (n) return n;
  } catch {}
  try {
    const jd = JSON.parse(scannedData);
    const n = tryExtract(jd);
    if (n) return n;
  } catch {}
  return scannedData;
}

// Try to pull a studentId from the raw scanned string.
// Accepts: pure ID ("123"), JSON {"studentId":"123"}, JSON {"id":"123"}, or "studentId:123" pattern.
function extractStudentId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // pure numeric or UUID-like string
  if (/^[A-Za-z0-9_-]{3,}$/.test(trimmed) && !trimmed.includes("{") && !trimmed.includes(":")) {
    return trimmed;
  }
  // studentId:XYZ pattern
  const colonMatch = trimmed.match(/studentId\s*:?["']?([A-Za-z0-9_-]+)["']?/i);
  if (colonMatch) return colonMatch[1];
  // JSON
  try {
    const obj = JSON.parse(trimmed);
    if (typeof obj === "object" && obj) {
      if (typeof obj.studentId === "string") return obj.studentId;
      if (typeof obj.id === "string") return obj.id;
    }
  } catch {}
  return null;
}

export default function OrganizerScanPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<
    { kind: "idle" } | { kind: "scanned"; data: string } | { kind: "sending"; data: string } | { kind: "success"; message: string } | { kind: "error"; message: string; data?: string }
  >({ kind: "idle" });
  const [scanKey, setScanKey] = React.useState(0);
  const [participants, setParticipants] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("spinnerParticipants");
      if (saved) setParticipants(JSON.parse(saved));
    } catch {}
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem("spinnerParticipants", JSON.stringify(participants));
    } catch {}
  }, [participants]);

  const addParticipant = (name: string) => {
    setParticipants((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

  const resetScan = () => {
    setStatus({ kind: "idle" });
    setScanKey((k) => k + 1);
  };

  const handleDetected = async (data: string) => {
    setStatus({ kind: "sending", data });
    const studentId = extractStudentId(data);
    if (!studentId) {
      setStatus({ kind: "error", message: "studentId not found in QR", data });
      toast.error("studentId not found");
      return;
    }
    try {
      const res = await fetch("/organizer/record-general-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const text = await res.text();
      if (!res.ok) {
        toast.error(text || `Scan failed (${res.status})`);
        throw new Error(text || `Scan failed (${res.status})`);
      }
      let msg = "Submitted";
      try {
        const json = JSON.parse(text);
        msg = json?.message || msg;
      } catch {}
      const name = extractNameFromPayload(text, data);
      addParticipant(name);
      setStatus({ kind: "success", message: msg });
      toast.success(msg);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to submit";
      setStatus({ kind: "error", message, data });
      toast.error(message);
    }
  };

  return (
    <div className='container mx-auto max-w-2xl px-4 py-8'>
      <Card>
        <CardHeader>
          <CardTitle>Organizer QR Scan</CardTitle>
          <CardDescription>Scan a participant QR code. Sends studentId to backend.</CardDescription>
        </CardHeader>
        <CardContent>
          {status.kind === "idle" && (
            <QrScanner
              key={scanKey}
              onDetected={(data) => {
                if (status.kind !== "idle") return;
                setStatus({ kind: "scanned", data });
                handleDetected(data);
              }}
              onError={(msg) => setStatus({ kind: "error", message: msg })}
            />
          )}

          <div className='mt-4 space-y-3 text-sm'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-muted-foreground'>Participants collected: {participants.length}</p>
              <div className='flex gap-2'>
                <Button variant='secondary' onClick={() => router.push("/game/spin")}>
                  Go to spinner game ({participants.length})
                </Button>
                {participants.length > 0 && (
                  <Button
                    variant='ghost'
                    onClick={() => {
                      if (confirm("Clear collected participants?")) {
                        setParticipants([]);
                      }
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {status.kind === "idle" && <p>Waiting for a QR code…</p>}
            {status.kind === "scanned" && <p className='text-muted-foreground'>Scanned raw: {status.data}</p>}
            {status.kind === "sending" && <p className='text-muted-foreground'>Submitting…</p>}
            {status.kind === "success" && (
              <div>
                <p className='text-green-600'>{status.message}</p>
                <div className='mt-2 flex gap-2'>
                  <Button onClick={resetScan}>Scan again</Button>
                  <Button variant='secondary' onClick={() => router.push("/organizer/spinner")}>
                    Go to spinner game
                  </Button>
                </div>
              </div>
            )}
            {status.kind === "error" && (
              <div>
                <p className='text-red-600'>{status.message}</p>
                {status.data && (
                  <details className='mt-1'>
                    <summary className='cursor-pointer'>Show scanned data</summary>
                    <pre className='overflow-auto rounded bg-muted p-2 text-xs'>{status.data}</pre>
                  </details>
                )}
                <div className='mt-2 flex gap-2'>
                  <Button variant='outline' onClick={resetScan}>
                    Scan again
                  </Button>
                  <Button variant='secondary' onClick={() => router.push("/organizer/spinner")}>
                    Go to spinner game
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
