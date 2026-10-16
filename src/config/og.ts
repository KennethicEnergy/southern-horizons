import { site } from "@/config/site";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

/** Satori (next/og) can only decode these raster formats; WebP and SVG covers fall back to the brand card. */
export const OG_COVER_MIME_TYPES: readonly string[] = ["image/jpeg", "image/png"];

/**
 * Spread into every page-level `openGraph`: Next replaces the whole object per segment,
 * so anything not repeated here is lost. Never set `images` alongside it unless the page
 * has a real image, or it suppresses the generated opengraph-image.
 */
export const baseOpenGraph = { siteName: site.name, type: "website", locale: "en_PH" } as const;

/**
 * The site-wide card drawn by src/app/opengraph-image.tsx. A page that sets its own `openGraph` loses the
 * inherited card, so pageOpenGraph adds this one back for pages without an opengraph-image of their own.
 */
export const SITE_SHARE_CARD = {
  url: "/opengraph-image",
  ...OG_IMAGE_SIZE,
  type: OG_IMAGE_CONTENT_TYPE,
  alt: `${site.name}: ${site.tagline}`,
} as const;
