import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { baseOpenGraph } from "@/config/og";
import { site } from "@/config/site";
import { DARK_QUERY, themeColors } from "@/config/theme";
import { topLoaderProps } from "@/config/top-loader";
import { themeInitScript } from "@/lib/theme";
import { InlineScript } from "@/components/ui/inline-script";
import { ThemeSync } from "@/components/ui/theme-sync";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Rising Together, Giving Back With Purpose`, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: baseOpenGraph,
};

// The toolbar colour follows the device setting; a manual choice on the site doesn't change it.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themeColors.light },
    { media: DARK_QUERY, color: themeColors.dark },
  ],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  // data-scroll-behavior lets Next.js turn smooth scrolling off during route changes, so pages still open at the top instantly.
  // suppressHydrationWarning: the theme script sets data-theme on <html> before React hydrates.
  <html lang="en-PH" data-scroll-behavior="smooth" suppressHydrationWarning>
    <head>
      {/* Reads the theme cookie and sets data-theme before the first paint, so the page never flashes light. */}
      <InlineScript html={themeInitScript} />
    </head>
    <body className="min-h-dvh bg-canvas">
      <ThemeSync />
      <NextTopLoader {...topLoaderProps} />
      {children}
      <Toaster />
    </body>
  </html>
);

export default RootLayout;
