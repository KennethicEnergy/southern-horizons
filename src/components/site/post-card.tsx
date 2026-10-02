import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, Location01Icon } from "@hugeicons/core-free-icons";
import type { Media, Post } from "@/db/schema";
import { eventPhase, formatDate } from "@/lib/dates";
import { postTypeLabel } from "@/config/posts";

const phaseLabel = { upcoming: "Upcoming", ongoing: "Happening now", past: "Past event" } as const;

export function PostCard({ post, featured = false }: { post: Post & { cover: Media | null }; featured?: boolean }) {
  const phase = post.type === "event" ? eventPhase(post.eventStartAt, post.eventEndAt) : null;
  return (
    <article className={`group relative flex flex-col ${featured ? "md:flex-row md:gap-8" : ""}`}>
      <div
        className={`relative aspect-[3/2] overflow-hidden rounded-xl bg-sky ${featured ? "md:w-3/5 md:shrink-0" : ""}`}
      >
        {post.cover ? (
          <Image
            src={post.cover.url}
            alt={post.cover.alt ?? ""}
            fill
            sizes={featured ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ objectPosition: `${post.coverFocusX}% ${post.coverFocusY}%` }}
          />
        ) : (
          <div className="flex h-full items-end p-5">
            <div className="horizon-line w-full opacity-20" />
          </div>
        )}
      </div>
      <div className={featured ? "mt-5 md:mt-0 md:self-center" : "mt-4"}>
        <p className="text-sm text-ink-soft">
          <span className={phase === "upcoming" || phase === "ongoing" ? "font-medium text-sea" : ""}>
            {phase ? phaseLabel[phase] : postTypeLabel[post.type]}
          </span>
          {post.publishedAt && !phase ? <span>, {formatDate(post.publishedAt)}</span> : null}
        </p>
        <h3 className={`mt-1.5 font-semibold ${featured ? "text-3xl md:text-4xl" : "text-xl"}`}>
          <Link href={`/news/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className={`mt-2 text-ink-soft ${featured ? "text-lg" : ""}`}>{post.excerpt}</p> : null}
        {post.type === "event" && post.eventStartAt ? (
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Date</dt>
              <HugeiconsIcon icon={Calendar03Icon} size={16} />
              <dd>{formatDate(post.eventStartAt)}</dd>
            </div>
            {post.location ? (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Location</dt>
                <HugeiconsIcon icon={Location01Icon} size={16} />
                <dd>{post.location}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    </article>
  );
}
