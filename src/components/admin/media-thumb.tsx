import { HugeiconsIcon } from "@hugeicons/react";
import { Doc01Icon, Pdf01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import type { Media } from "@/db/schema";

export function MediaThumb({ media, className = "size-16" }: { media: Pick<Media, "kind" | "url" | "mimeType" | "alt" | "filename">; className?: string }) {
  if (media.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element -- thumbnails in the backoffice don't need optimization
    return <img src={media.url} alt={media.alt ?? ""} className={`${className} rounded-md bg-sky object-cover`} />;
  }
  const icon = media.kind === "video" ? Video01Icon : media.mimeType === "application/pdf" ? Pdf01Icon : Doc01Icon;
  return (
    <span className={`${className} flex items-center justify-center rounded-md bg-sky text-sea`}>
      <HugeiconsIcon icon={icon} size={24} />
    </span>
  );
}
