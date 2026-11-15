import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(max-width: 759px)", color: "#050e31" },
    { media: "(min-width: 760px)", color: "#040e48" },
  ],
};

export const metadata: Metadata = {
  title: "Thiệp mời tốt nghiệp · HCMUT 2026",
  description: "A clean starting point for building your site.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head><link rel="preload" href="/fonts/be-vietnam-pro-400.ttf" as="font" type="font/ttf" crossOrigin="anonymous" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
