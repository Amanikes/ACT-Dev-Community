import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ACT DEV Community",
    template: "%s | ACT DEV Community",
  },
  description: "ACT DEV Community Portal",
  // Favicon / tab icons
  icons: {
    // Preferred site logo (place your logo at public/act-dev-logo.png)
    icon: [
      { url: "/act-dev-logo.png?v=2", type: "image/png", sizes: "any" },
      // Fallback to an existing asset so the tab icon always shows
      { url: "/globe.svg?v=2", type: "image/svg+xml" },
    ],
    apple: [{ url: "/act-dev-logo.png?v=2" }],
    shortcut: ["/act-dev-logo.png?v=2"],
  },
  applicationName: "ACT DEV Community",
  // themeColor moved to viewport for Next.js compatibility
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "ACT DEV Community",
    description: "ACT DEV Community Portal",
    images: [
      {
        url: "/act-dev-logo.png?v=2",
        width: 1200,
        height: 630,
        alt: "ACT DEV Community Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ACT DEV Community",
    description: "ACT DEV Community Portal",
    images: ["/act-dev-logo.png?v=2"],
  },
};

// Provide viewport (including themeColor) per Next.js recommendation
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
