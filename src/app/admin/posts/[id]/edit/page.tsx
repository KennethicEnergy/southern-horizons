import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { getPostAccess } from "@/lib/posts/access";
import { toPostFormValues } from "@/lib/posts/changes";
import { findPendingPayload, listRequestsForResource } from "@/lib/approvals/queries";
import { postFormSchema } from "@/lib/validations/post";
import { getEventsForSelect } from "@/lib/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ApprovalList } from "@/components/admin/approval-list";
import { PostForm } from "@/components/admin/post-form";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const post = await getDb().query.posts.findFirst({
    where: and(eq(schema.posts.id, id), isNull(schema.posts.deletedAt)),
    with: { cover: true, attachments: { with: { media: true }, orderBy: [asc(schema.postMedia.sortOrder)] } },
  });
  if (!post) notFound();

  const access = getPostAccess(user, post);
  const requests = await listRequestsForResource("post", post.id);
  const history = requests.length > 0 ? (
    <section className="mt-8 rounded-xl bg-white p-6">
      <h2 className="text-xl font-semibold">Approval requests</h2>
      <div className="mt-4">
        <ApprovalList items={requests} empty="" hideTitle />
      </div>
    </section>
  ) : null;

  if (access.edit === "denied") {
    const waiting = post.status === "in_review";
    return (
      <>
        <div className="rounded-xl bg-white p-8">
          <h1 className="text-2xl font-semibold">{waiting ? "Waiting for approval" : "You can't edit this post"}</h1>
          <p className="mt-2 text-ink-soft">
            {waiting
              ? "This post goes live once it's approved. If it's rejected, it returns to drafts so it can be fixed and sent again."
              : "Drafts belong to the person writing them. Your position can edit live posts, with approval."}
          </p>
          <Link href="/admin/posts" className="mt-4 inline-flex items-center gap-1.5 text-sea hover:underline">
            <span aria-hidden="true">←</span> Back to posts
          </Link>
        </div>
        {history}
      </>
    );
  }

  const events = (await getEventsForSelect()).filter((e) => e.id !== post.id);
  const attachments = post.attachments.map(({ media }) => media).filter(({ deletedAt }) => !deletedAt);

  // Reopen your own pending changes instead of the live version, so asking again doesn't lose them.
  const pendingEdit =
    access.edit === "approval"
      ? postFormSchema.safeParse(await findPendingPayload({ resourceType: "post", resourceId: post.id, action: "edit", userId: user.id }))
      : null;
  const proposed = pendingEdit?.success ? pendingEdit.data : null;
  const proposedMedia = proposed
    ? await getDb().query.media.findMany({
        where: and(inArray(schema.media.id, [proposed.coverMediaId, ...proposed.attachmentIds].filter(Boolean) as string[]), isNull(schema.media.deletedAt)),
      })
    : [];
  const mediaById = new Map(proposedMedia.map((m) => [m.id, m]));

  return (
    <>
      <AdminPageHeader
        title="Edit post"
        description={proposed ? "Showing the changes you already sent. Sending again replaces them." : undefined}
        back={{ href: "/admin/posts", label: "Posts" }}
      />
      <PostForm
        postId={post.id}
        currentStatus={post.status}
        initialValues={proposed ?? toPostFormValues(post, attachments.map(({ id: mediaId }) => mediaId))}
        initialCover={proposed ? (mediaById.get(proposed.coverMediaId ?? "") ?? null) : post.cover}
        initialAttachments={proposed ? proposed.attachmentIds.flatMap((mediaId) => mediaById.get(mediaId) ?? []) : attachments}
        events={events}
        access={access}
      />
      {history}
    </>
  );
}
