import { newsPage } from "@/config/news";
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/config/og";
import { site } from "@/config/site";
import { getPostBySlug } from "@/lib/queries";
import { getOgCoverUrl, getOgPostEyebrow } from "@/lib/og";
import { renderOgImage } from "@/lib/og-image";

export const revalidate = 300;
export const generateStaticParams = async () => [];
export const alt = `${newsPage.title} from ${site.name}`;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type Props = { params: Promise<{ slug: string }> };

const Image = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return renderOgImage({ title: newsPage.lead, eyebrow: newsPage.title });
  const { title, cover } = post;
  return renderOgImage({ title, eyebrow: getOgPostEyebrow(post), imageUrl: getOgCoverUrl(cover) });
};

export default Image;
