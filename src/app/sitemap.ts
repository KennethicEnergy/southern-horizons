import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/queries";
import { site } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/news", "/transparency", "/about", "/contact", "/faqs", "/privacy", "/terms"].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "weekly" as const,
  }));
  const { posts } = await getPublishedPosts();
  return [
    ...staticPages,
    ...posts.map((p) => ({ url: `${site.url}/news/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
