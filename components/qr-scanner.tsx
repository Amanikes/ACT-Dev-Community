"use client";

import React from "react";

// Minimal type shims for the Barcode Detector API to keep TS happy.
declare global {
  // eslint-disable-next-line no-var
  var BarcodeDetector: any | undefined;
}

type QrScannerProps = {
  onDetected: (data: string) => void;
  onError?: (message: string) => void;
  className?: string;
};

export function QrScanner({ onDetected, onError, className }: QrScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [permissionState, setPermissionState] = React.useState<
    "prompt" | "granted" | "denied" | "unknown"
  >("unknown");
  const [isScanning, setIsScanning] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const detectorRef = React.useRef<any | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Check camera permission state if available
        if (navigator.permissions && (navigator as any).permissions.query) {
          try {
            const status = await (navigator as any).permissions.query({
              name: "camera" as PermissionName,
            });
            if (!cancelled) {
              setPermissionState(status.state as any);
              status.onchange = () => setPermissionState(status.state as any);
            }
          } catch {
            // ignore if not supported
          }
        }

        // Request camera stream (prefer environment/back camera on mobile)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        if (typeof window !== "undefined" && (window as any).BarcodeDetector) {
          detectorRef.current = new (window as any).BarcodeDetector({
            formats: ["qr_code"],
          });
          startLoop();
        } else {
          const msg =
            "BarcodeDetector API not supported in this browser. Try Chrome/Edge or update your browser.";
          setError(msg);
          onError?.(msg);
        }
      } catch (err: any) {
        const msg = err?.message || "Failed to access camera";
        setError(msg);
        onError?.(msg);
      }
    }

    function startLoop() {
      if (!videoRef.current || !detectorRef.current) return;
      const loop = async () => {
        if (!isScanning || !videoRef.current || !detectorRef.current) return;
        try {
          // The detect() method accepts an ImageBitmapSource. Video element is valid input.
          const codes = await detectorRef.current.detect(videoRef.current);
          const qr = (codes || []).find((c: any) => c.format === "qr_code");
          if (qr && typeof qr.rawValue === "string" && qr.rawValue.length > 0) {
            setIsScanning(false);
            onDetected(qr.rawValue);
            return; // stop loop after detection
          }
        } catch (e) {
          // Soft-fail; keep scanning
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      detectorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      <div className='mb-3 text-sm text-muted-foreground'>
        Camera permission: {permissionState}
      </div>
      <div className='relative w-full overflow-hidden rounded-lg border bg-black'>
        <video
          ref={videoRef}
          className='block h-[320px] w-full object-contain'
          playsInline
          muted
          autoPlay
        />
      </div>
      {error ? (
        <p className='mt-3 text-sm text-red-600'>{error}</p>
      ) : (
        <p className='mt-3 text-sm text-muted-foreground'>
          Point your camera at a QR code to scan.
        </p>
      )}
    </div>
  );
}
