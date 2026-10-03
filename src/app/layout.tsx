import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { brandColors } from "@/config/brand";
import { baseOpenGraph } from "@/config/og";
import { site } from "@/config/site";
import { topLoaderProps } from "@/config/top-loader";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Rising Together, Giving Back With Purpose`, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: baseOpenGraph,
};

export const viewport: Viewport = { themeColor: brandColors.ink };

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  // data-scroll-behavior lets Next.js turn smooth scrolling off during route changes, so pages still open at the top instantly.
  <html lang="en-PH" data-scroll-behavior="smooth">
    <body className="min-h-dvh bg-white">
      <NextTopLoader {...topLoaderProps} />
      {children}
      <Toaster />
    </body>
  </html>
);

export default RootLayout;
