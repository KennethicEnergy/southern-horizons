import type { Media, Post } from "@/db/schema";
import { OG_COVER_MIME_TYPES, SITE_SHARE_CARD, baseOpenGraph } from "@/config/og";
import { postTypeLabel } from "@/config/posts";
import { formatDate } from "@/lib/dates";

type OgCoverCandidate = Pick<Media, "url" | "mimeType" | "verified" | "deletedAt">;

export const getOgCoverUrl = (media: OgCoverCandidate | null) => {
  if (!media) return null;
  const { url, mimeType, verified, deletedAt } = media;
  return verified && !deletedAt && OG_COVER_MIME_TYPES.includes(mimeType) ? url : null;
};

/**
 * A page's `openGraph`, with its own `og:url`. `path` is relative; the root layout's metadataBase makes it absolute.
 * Every public page sets this: the root layout can't, or every page would claim the home page's address.
 * Setting `openGraph` drops the inherited share card, so the site-wide card comes back here, unless the page
 * has its own opengraph-image.tsx (`hasOwnCard`), which an `images` key would replace.
 */
export const pageOpenGraph = (path: string, { hasOwnCard = false }: { hasOwnCard?: boolean } = {}) =>
  hasOwnCard ? { ...baseOpenGraph, url: path } : { ...baseOpenGraph, url: path, images: [SITE_SHARE_CARD] };

export const getOgPostEyebrow = ({ type, eventStartAt }: Pick<Post, "type" | "eventStartAt">) => {
  const label = postTypeLabel[type];
  return type === "event" && eventStartAt ? `${label} · ${formatDate(eventStartAt)}` : label;
};
