"use client";

import React from "react";
import dynamic from "next/dynamic";
const QrScanner = dynamic(() => import("@/components/qr-scanner").then((m) => m.QrScanner), { ssr: false });
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OrganizerScanPage() {
  const [status, setStatus] = React.useState<
    { kind: "idle" } | { kind: "scanned"; data: string } | { kind: "sending"; data: string } | { kind: "success"; message: string } | { kind: "error"; message: string; data?: string }
  >({ kind: "idle" });

  const handleDetected = async (data: string) => {
    setStatus({ kind: "sending", data });
    try {
      const res = await fetch("/api/organizer/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
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
          <CardDescription>Scan a participant QR code. We’ll send the scanned data to the backend.</CardDescription>
        </CardHeader>
        <CardContent>
          <QrScanner
            onDetected={(data) => {
              setStatus({ kind: "scanned", data });
              handleDetected(data);
            }}
            onError={(msg) => setStatus({ kind: "error", message: msg })}
          />

          <div className='mt-4 space-y-2 text-sm'>
            {status.kind === "idle" && <p>Waiting for a QR code…</p>}
            {status.kind === "scanned" && <p className='text-muted-foreground'>Scanned: {status.data}</p>}
            {status.kind === "sending" && <p className='text-muted-foreground'>Submitting…</p>}
            {status.kind === "success" && <p className='text-green-600'>{status.message}</p>}
            {status.kind === "error" && (
              <div>
                <p className='text-red-600'>{status.message}</p>
                {status.data && (
                  <details className='mt-1'>
                    <summary className='cursor-pointer'>Show scanned data</summary>
                    <pre className='overflow-auto rounded bg-muted p-2 text-xs'>{status.data}</pre>
                  </details>
                )}
                <div className='mt-2'>
                  <Button variant='outline' onClick={() => setStatus({ kind: "idle" })}>
                    Try again
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
