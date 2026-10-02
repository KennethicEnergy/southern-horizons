import Image from "next/image";
import Link from "next/link";
import { Calendar03Icon, Location01Icon } from "@hugeicons/core-free-icons";
import type { Media, Post } from "@/db/schema";
import { eventPhase, formatDate } from "@/lib/dates";
import { postTypeLabel } from "@/config/posts";
import { Icon } from "@/components/ui/icon";
import { BrandOrbs } from "./brand-orbs";

const phaseLabel = { upcoming: "Upcoming", ongoing: "Happening now", past: "Past event" } as const;

type PostCardProps = { post: Post & { cover: Media | null }; featured?: boolean };

export const PostCard = ({ post, featured = false }: PostCardProps) => {
  const { type, cover, coverFocusX, coverFocusY, publishedAt, slug, title, excerpt, eventStartAt, eventEndAt, location } = post;
  const phase = type === "event" ? eventPhase(eventStartAt, eventEndAt) : null;
  const live = phase === "upcoming" || phase === "ongoing";

  return (
    <article className={`reveal group relative flex flex-col ${featured ? "md:flex-row md:gap-10" : ""}`}>
      <div
        className={`relative aspect-[3/2] overflow-clip rounded-2xl bg-sky ring-1 ring-ink/5 transition-shadow duration-300 ease-out-soft group-hover:shadow-lift ${
          featured ? "md:w-3/5 md:shrink-0" : ""
        }`}
      >
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? ""}
            fill
            sizes={featured ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
            style={{ objectPosition: `${coverFocusX}% ${coverFocusY}%` }}
          />
        ) : (
          <div className="bg-horizon flex h-full items-center justify-center">
            <BrandOrbs className="w-2/5 transition-transform duration-700 ease-out-soft group-hover:scale-105" />
          </div>
        )}
      </div>
      <div className={featured ? "mt-5 md:mt-0 md:self-center" : "mt-4"}>
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sea-mist px-2.5 py-0.5 font-medium text-sea-deep">
              <span aria-hidden="true" className={`size-1.5 rounded-full bg-sea ${phase === "ongoing" ? "motion-safe:animate-pulse" : ""}`} />
              {phaseLabel[phase]}
            </span>
          ) : (
            <span>{phase ? phaseLabel[phase] : postTypeLabel[type]}</span>
          )}
          {publishedAt && !phase ? <span>· {formatDate(publishedAt)}</span> : null}
        </p>
        <h3 className={`mt-2 font-semibold transition-colors group-hover:text-sea-deep ${featured ? "text-3xl md:text-4xl" : "text-xl"}`}>
          <Link href={`/news/${slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
            {title}
          </Link>
        </h3>
        {excerpt ? <p className={`mt-2 text-ink-soft ${featured ? "text-lg" : ""}`}>{excerpt}</p> : null}
        {type === "event" && eventStartAt ? (
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Date</dt>
              <Icon icon={Calendar03Icon} size={16} className="text-sea" />
              <dd>{formatDate(eventStartAt)}</dd>
            </div>
            {location ? (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Location</dt>
                <Icon icon={Location01Icon} size={16} className="text-sea" />
                <dd>{location}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    </article>
  );
};
