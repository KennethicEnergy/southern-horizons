import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/config/og";
import { site } from "@/config/site";
import { renderOgImage } from "@/lib/og-image";

export const alt = `${site.name}: ${site.tagline}`;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

const Image = () => renderOgImage({ title: `${site.tagline}.`, eyebrow: site.city });

export default Image;
