import type { Metadata, Viewport } from "next";
import { site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — volunteers from ${site.city}`, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: { siteName: site.name, type: "website", locale: "en_PH" },
};

export const viewport: Viewport = { themeColor: "#0b5e7a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH">
      <body className="min-h-dvh bg-white">{children}</body>
    </html>
  );
}
