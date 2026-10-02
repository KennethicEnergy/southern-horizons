import type { Metadata, Viewport } from "next";
import { brandColors } from "@/config/brand";
import { baseOpenGraph } from "@/config/og";
import { site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Rising Together, Giving Back With Purpose`, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: baseOpenGraph,
};

export const viewport: Viewport = { themeColor: brandColors.ink };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH">
      <body className="min-h-dvh bg-white">{children}</body>
    </html>
  );
}
