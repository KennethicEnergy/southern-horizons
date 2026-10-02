import type { Media, Post } from "@/db/schema";
import { OG_COVER_MIME_TYPES } from "@/config/og";
import { postTypeLabel } from "@/config/posts";
import { formatDate } from "@/lib/dates";

type OgCoverCandidate = Pick<Media, "url" | "mimeType" | "verified" | "deletedAt">;

export const getOgCoverUrl = (media: OgCoverCandidate | null) => {
  if (!media) return null;
  const { url, mimeType, verified, deletedAt } = media;
  return verified && !deletedAt && OG_COVER_MIME_TYPES.includes(mimeType) ? url : null;
};

export const getOgPostEyebrow = ({ type, eventStartAt }: Pick<Post, "type" | "eventStartAt">) => {
  const label = postTypeLabel[type];
  return type === "event" && eventStartAt ? `${label} · ${formatDate(eventStartAt)}` : label;
};
