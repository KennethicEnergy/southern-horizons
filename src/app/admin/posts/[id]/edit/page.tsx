import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { can, canOnPost } from "@/lib/rbac";
import { getEventsForSelect } from "@/lib/queries";
import { toManilaInputValue } from "@/lib/dates";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const post = await getDb().query.posts.findFirst({
    where: and(eq(schema.posts.id, id), isNull(schema.posts.deletedAt)),
    with: { cover: true, attachments: { with: { media: true }, orderBy: [asc(schema.postMedia.sortOrder)] } },
  });
  if (!post) notFound();

  if (!canOnPost(user, "edit", post)) {
    return (
      <div className="rounded-xl bg-white p-8">
        <h1 className="text-2xl font-semibold">You can&apos;t edit this post</h1>
        <p className="mt-2 text-ink-soft">
          Content creators can edit their own drafts and posts in review. Ask an editor or admin to change a published post.
        </p>
        <Link href="/admin/posts" className="mt-4 inline-flex items-center gap-1.5 text-sea hover:underline">
          <span aria-hidden="true">←</span> Back to posts
        </Link>
      </div>
    );
  }

  const events = (await getEventsForSelect()).filter((e) => e.id !== post.id);
  const attachments = post.attachments.map((a) => a.media).filter((m) => !m.deletedAt);

  return (
    <>
      <AdminPageHeader title="Edit post" back={{ href: "/admin/posts", label: "Posts" }} />
      <PostForm
        postId={post.id}
        currentStatus={post.status}
        initialValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          type: post.type,
          content: post.content,
          coverMediaId: post.coverMediaId ?? "",
          coverFocusX: post.coverFocusX,
          coverFocusY: post.coverFocusY,
          parentId: post.parentId ?? "",
          eventStartAt: toManilaInputValue(post.eventStartAt),
          eventEndAt: toManilaInputValue(post.eventEndAt),
          location: post.location ?? "",
          attachmentIds: attachments.map((m) => m.id),
          intent: "save_draft",
        }}
        initialCover={post.cover}
        initialAttachments={attachments}
        events={events}
        permissions={{
          canPublish: can(user.role, "post:publish"),
          canSubmit: can(user.role, "post:submit"),
          canDelete: canOnPost(user, "delete", post),
        }}
      />
    </>
  );
}
