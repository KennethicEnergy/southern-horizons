import { newsPage } from "@/config/news";
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/config/og";
import { site } from "@/config/site";
import { renderOgImage } from "@/lib/og-image";

export const alt = `${newsPage.title} from ${site.name}`;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

const Image = () => renderOgImage({ title: newsPage.lead, eyebrow: newsPage.title });

export default Image;
