import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { PostCard } from "@/components/site/post-card";
import { getPublishedPosts } from "@/lib/queries";
import type { PostType } from "@/db/schema";
import { newsPage } from "@/config/news";

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

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ type?: string; page?: string }> }) {
  const params = await searchParams;
  const type = filters.find((f) => f.value === params.type)?.value;
  const page = Math.max(1, Number(params.page) || 1);
  const { posts, totalPages } = await getPublishedPosts({ type, page });

  const href = (p: { type?: PostType; page?: number }) => {
    const q = new URLSearchParams();
    if (p.type) q.set("type", p.type);
    if (p.page && p.page > 1) q.set("page", String(p.page));
    const s = q.toString();
    return s ? `/news?${s}` : "/news";
  };

  return (
    <>
      <PageHeader title={newsPage.title} lead={newsPage.lead} />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <nav aria-label="Filter posts" className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = f.value === type;
            return (
              <Link
                key={f.label}
                href={href({ type: f.value })}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-4 py-1.5 text-[0.95rem] ${
                  active ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>

        {posts.length > 0 ? (
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-ink-soft">Nothing here yet. Check back after our next event.</p>
        )}

        {totalPages > 1 ? (
          <nav aria-label="Pagination" className="mt-14 flex items-center justify-between border-t border-line pt-6">
            {page > 1 ? <Link href={href({ type, page: page - 1 })} className="text-sea hover:underline">Newer posts</Link> : <span />}
            <span className="text-sm text-ink-soft">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? <Link href={href({ type, page: page + 1 })} className="text-sea hover:underline">Older posts</Link> : <span />}
          </nav>
        ) : null}
      </div>
    </>
  );
}
