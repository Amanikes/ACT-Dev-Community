"use client";

import React from "react";

// Minimal type shims for the Barcode Detector API to keep TS happy.
type BarcodeResult = { rawValue: string; format: string };
type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<BarcodeResult[]>;
};
declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike;
  }
}

type QrScannerProps = {
  onDetected: (data: string) => void;
  onError?: (message: string) => void;
  className?: string;
};

export function QrScanner({ onDetected, onError, className }: QrScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [permissionState, setPermissionState] = React.useState<"prompt" | "granted" | "denied" | "unknown">("unknown");
  const [isScanning, setIsScanning] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cameraAvailable, setCameraAvailable] = React.useState<boolean>(true);
  const detectorRef = React.useRef<BarcodeDetectorLike | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const videoElAtMount = videoRef.current;

    async function init() {
      try {
        // Require secure context for camera on mobile browsers.
        if (!window.isSecureContext && location.hostname !== "localhost") {
          setCameraAvailable(false);
          const msg = "Camera access requires HTTPS on mobile. Open this page over HTTPS or use localhost during development.";
          setError(msg);
          onError?.(msg);
          // Don't attempt getUserMedia; still allow image upload fallback below.
        }

        // Check camera permission state if available
        const permNavigator = navigator as Navigator & {
          permissions?: {
            query: (opts: { name: PermissionName }) => Promise<PermissionStatus>;
          };
        };
        if (permNavigator.permissions?.query) {
          try {
            const status = await permNavigator.permissions.query({
              name: "camera" as PermissionName,
            });
            if (!cancelled) {
              setPermissionState(status.state as typeof permissionState);
              status.onchange = () => setPermissionState(status.state as typeof permissionState);
            }
          } catch {
            // ignore if not supported
          }
        }

        // Request camera stream (prefer environment/back camera on mobile)
        if (cameraAvailable) {
          if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
            // mediaDevices not available (likely due to insecure context or unsupported browser)
            setCameraAvailable(false);
          } else {
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
          }
        }

        if (typeof window !== "undefined" && window.BarcodeDetector) {
          detectorRef.current = new window.BarcodeDetector({
            formats: ["qr_code"],
          });
          if (cameraAvailable) {
            startLoop();
          }
        } else {
          const msg = "BarcodeDetector API not supported in this browser. Try Chrome/Edge or update your browser.";
          setError(msg);
          onError?.(msg);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to access camera";
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
          const codes: BarcodeResult[] = await detectorRef.current.detect(videoRef.current);
          const qr = (codes || []).find((c: BarcodeResult) => c.format === "qr_code");
          if (qr && typeof qr.rawValue === "string" && qr.rawValue.length > 0) {
            setIsScanning(false);
            onDetected(qr.rawValue);
            return; // stop loop after detection
          }
        } catch {
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
      if (videoElAtMount) {
        try {
          videoElAtMount.pause();
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

  const secureContext = typeof window !== "undefined" ? window.isSecureContext : false;

  return (
    <div className={className}>
      <div className='mb-3 text-sm text-muted-foreground'>Camera permission: {permissionState}</div>
      {cameraAvailable ? (
        <div className='relative w-full overflow-hidden rounded-lg border bg-black'>
          <video ref={videoRef} className='block h-[320px] w-full object-contain' playsInline muted autoPlay />
        </div>
      ) : (
        <div className='rounded-lg border p-4'>
          <p className='mb-2 text-sm text-muted-foreground'>Live camera is unavailable in this context. You can still scan by taking or uploading a photo of the QR code.</p>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            capture='environment'
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0];
              if (!file) return;
              try {
                if (!detectorRef.current) {
                  const msg = "BarcodeDetector not supported for image scanning.";
                  setError(msg);
                  onError?.(msg);
                  return;
                }
                const bitmap = await createImageBitmap(file);
                const codes: BarcodeResult[] = await detectorRef.current.detect(bitmap);
                const qr = (codes || []).find((c: BarcodeResult) => c.format === "qr_code");
                if (qr && typeof qr.rawValue === "string" && qr.rawValue.length > 0) {
                  setIsScanning(false);
                  onDetected(qr.rawValue);
                } else {
                  setError("No QR code found in the image. Try a clearer photo.");
                }
              } catch (ex: unknown) {
                const msg = ex instanceof Error ? ex.message : "Failed to scan image.";
                setError(msg);
                onError?.(msg);
              } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }}
            className='block w-full text-sm'
          />
        </div>
      )}
      {error ? <p className='mt-3 text-sm text-red-600'>{error}</p> : <p className='mt-3 text-sm text-muted-foreground'>Point your camera at a QR code to scan.</p>}
      {!secureContext && <p className='mt-2 text-xs text-muted-foreground'>Tip: Use HTTPS on your phone (or connect via localhost) to enable live camera access.</p>}
    </div>
  );
}
