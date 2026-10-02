import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Calendar03Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { getPostBySlug } from "@/lib/queries";
import { renderContent } from "@/lib/content/render";
import { eventPhase, formatDate, formatDateTime } from "@/lib/dates";
import { AttachmentList } from "@/components/site/attachment-list";
import { newsPage } from "@/config/news";
import { baseOpenGraph } from "@/config/og";

export const revalidate = 300;
export const generateStaticParams = async () => [];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    // No `images` key: it would suppress the share card from the sibling opengraph-image.tsx.
    openGraph: {
      ...baseOpenGraph,
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

const phaseText = { upcoming: "Upcoming event", ongoing: "Happening now", past: "Past event" } as const;

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();

  const phase = post.type === "event" ? eventPhase(post.eventStartAt, post.eventEndAt) : null;
  const attachments = post.attachments.map((a) => a.media).filter((m) => m.verified && !m.deletedAt);

  return (
    <article>
      <header className="mx-auto max-w-4xl px-5 pt-10 md:pt-16">
        <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          {newsPage.title}
        </Link>
        {post.parent ? (
          <p className="mt-6 text-sea">
            Update on <Link href={`/news/${post.parent.slug}`} className="underline">{post.parent.title}</Link>
          </p>
        ) : phase ? (
          <p className="mt-6 font-medium text-sea">{phaseText[phase]}</p>
        ) : null}
        <h1 className="mt-3 text-4xl font-semibold md:text-6xl">{post.title}</h1>
        {post.excerpt ? <p className="mt-5 text-xl text-ink-soft">{post.excerpt}</p> : null}

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem] text-ink-soft">
          {post.type === "event" && post.eventStartAt ? (
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Calendar03Icon} size={18} />
              {formatDateTime(post.eventStartAt)}
              {post.eventEndAt ? ` to ${formatDateTime(post.eventEndAt)}` : ""}
            </span>
          ) : null}
          {post.location ? (
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Location01Icon} size={18} />
              {post.location}
            </span>
          ) : null}
          {post.publishedAt ? (
            <span>
              Posted {formatDate(post.publishedAt)} by {post.author.name}
            </span>
          ) : null}
        </div>
      </header>

      {post.cover ? (
        <div className="mx-auto mt-10 max-w-6xl px-5">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-sky">
            <Image src={post.cover.url} alt={post.cover.alt ?? ""} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-4xl px-5 py-12">
        <div
          className="article prose prose-lg prose-a:text-sea prose-headings:font-semibold"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />
        {attachments.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold">Files and media</h2>
            <div className="mt-6">
              <AttachmentList items={attachments} />
            </div>
          </section>
        ) : null}
      </div>

      {post.updates.length > 0 ? (
        <section className="border-t border-line bg-sky" aria-labelledby="updates-heading">
          <div className="mx-auto max-w-4xl px-5 py-14">
            <h2 id="updates-heading" className="text-3xl font-semibold">
              Updates
            </h2>
            <ol className="mt-10 space-y-12 border-l-2 border-sea-mist pl-8">
              {post.updates.map((u) => (
                <li key={u.id} className="relative">
                  <span className="absolute -left-[2.45rem] top-1.5 size-3.5 rounded-full border-2 border-sky bg-sea" aria-hidden="true" />
                  <time className="text-sm text-ink-soft" dateTime={u.publishedAt?.toISOString()}>
                    {u.publishedAt ? formatDateTime(u.publishedAt) : ""}
                  </time>
                  <h3 className="mt-1 text-2xl font-semibold">
                    <Link href={`/news/${u.slug}`} className="hover:text-sea">
                      {u.title}
                    </Link>
                  </h3>
                  <div
                    className="article prose mt-3 prose-a:text-sea"
                    dangerouslySetInnerHTML={{ __html: renderContent(u.content) }}
                  />
                  <div className="mt-5">
                    <AttachmentList items={u.attachments.map((a) => a.media).filter((m) => m.verified && !m.deletedAt)} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </article>
  );
}
