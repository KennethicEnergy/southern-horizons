import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { PostStatus } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { can, canOnPost } from "@/lib/rbac";
import { formatDate } from "@/lib/dates";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { ButtonLink } from "@/components/ui/button";

const statuses: { value?: PostStatus; label: string }[] = [
  { label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "in_review", label: "In review" },
  { value: "published", label: "Published" },
];

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requirePermission("post:create");
  const { status: raw } = await searchParams;
  const status = statuses.find((s) => s.value === raw)?.value;
  const seesAll = can(user.role, "post:edit:any");

  const rows = await getDb().query.posts.findMany({
    where: and(
      isNull(schema.posts.deletedAt),
      seesAll ? undefined : eq(schema.posts.authorId, user.id),
      status ? eq(schema.posts.status, status) : undefined,
    ),
    orderBy: [desc(schema.posts.updatedAt)],
    limit: 100,
    with: { author: { columns: { name: true } } },
  });

  return (
    <>
      <AdminPageHeader
        title="Posts"
        description={seesAll ? "News, events, updates, and stories from every volunteer." : "Posts you've written."}
        actions={<ButtonLink href="/admin/posts/new">Write a post</ButtonLink>}
      />
      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s.label}
            href={s.value ? `/admin/posts?status=${s.value}` : "/admin/posts"}
            aria-current={s.value === status ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm ${s.value === status ? "bg-ink text-white" : "bg-white text-ink-soft hover:text-ink"}`}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center">
          <p className="text-lg">No posts here yet.</p>
          <ButtonLink href="/admin/posts/new" className="mt-4">
            Write your first post
          </ButtonLink>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full min-w-[44rem] text-left text-[0.95rem]">
            <thead className="border-b border-line text-sm text-ink-soft">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Title</th>
                <th scope="col" className="px-5 py-3 font-medium">Type</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                {seesAll ? <th scope="col" className="px-5 py-3 font-medium">Author</th> : null}
                <th scope="col" className="px-5 py-3 font-medium">Updated</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-xs px-5 py-3.5">
                    {canOnPost(user, "edit", p) ? (
                      <Link href={`/admin/posts/${p.id}/edit`} className="font-medium hover:text-sea">
                        {p.title}
                      </Link>
                    ) : (
                      <span className="font-medium">{p.title}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 capitalize text-ink-soft">{p.type}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                  {seesAll ? <td className="px-5 py-3.5 text-ink-soft">{p.author.name}</td> : null}
                  <td className="whitespace-nowrap px-5 py-3.5 text-ink-soft">{formatDate(p.updatedAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      {p.status === "published" ? (
                        <Link href={`/news/${p.slug}`} className="text-sm text-sea hover:underline" target="_blank">
                          View
                        </Link>
                      ) : null}
                      {canOnPost(user, "delete", p) ? <DeletePostButton postId={p.id} title={p.title} /> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
