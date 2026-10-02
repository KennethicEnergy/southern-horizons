import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { PostCard } from "@/components/site/post-card";
import { ButtonLink } from "@/components/ui/button";
import { getPublishedPosts } from "@/lib/queries";
import type { PostType } from "@/db/schema";
import { newsPage } from "@/config/news";
import { actionIcons } from "@/config/icons";

export const metadata: Metadata = {
  title: newsPage.title,
  description: newsPage.lead,
};

const filters: { value?: PostType; label: string }[] = [
  { label: "Everything" },
  { value: "event", label: "Events" },
  { value: "news", label: "News" },
  { value: "story", label: "Stories" },
];

const NewsPage = async ({ searchParams }: { searchParams: Promise<{ type?: string; page?: string }> }) => {
  const { type: typeParam, page: pageParam } = await searchParams;
  const type = filters.find(({ value }) => value === typeParam)?.value;
  const page = Math.max(1, Number(pageParam) || 1);
  const { posts, totalPages } = await getPublishedPosts({ type, page });

  const href = ({ type, page }: { type?: PostType; page?: number }) => {
    const query = new URLSearchParams();
    if (type) query.set("type", type);
    if (page && page > 1) query.set("page", String(page));
    const search = query.toString();
    return search ? `/news?${search}` : "/news";
  };

  return (
    <>
      <PageHeader eyebrow="From the field" title={newsPage.title} lead={newsPage.lead} />
      <div className="mx-auto max-w-6xl px-5 py-12">
        {/* On phones the chips scroll sideways instead of wrapping. */}
        <nav aria-label="Filter posts" className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none]">
          <ul className="flex w-max gap-2">
            {filters.map(({ value, label }) => {
              const active = value === type;
              return (
                <li key={label}>
                  <Link
                    href={href({ type: value })}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex h-10 items-center rounded-full border px-4 text-[0.95rem] transition-colors duration-200 ${
                      active ? "border-sea bg-sea text-white shadow-soft" : "border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {posts.length > 0 ? (
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-ink-soft">Nothing here yet. Check back after our next event.</p>
        )}

        {totalPages > 1 ? (
          <nav aria-label="Pagination" className="mt-14 flex items-center justify-between gap-3 border-t border-line pt-6">
            {page > 1 ? (
              <ButtonLink href={href({ type, page: page - 1 })} variant="outline" icon={actionIcons.back}>
                Newer
              </ButtonLink>
            ) : (
              <span />
            )}
            <span className="text-sm tabular-nums text-ink-soft">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <ButtonLink href={href({ type, page: page + 1 })} variant="outline" iconEnd={actionIcons.next}>
                Older
              </ButtonLink>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
    </>
  );
};

export default NewsPage;
