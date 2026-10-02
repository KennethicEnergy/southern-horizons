import "server-only";
import { asc, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { ApprovalHandler, ApprovalSummary } from "@/types/approvals";
import { postFormSchema } from "@/lib/validations/post";
import { describePostChanges, toPostFormValues } from "@/lib/posts/changes";
import { checkParentEvent, findPost, persistPost, setPostStatus, softDeletePost } from "@/lib/posts/write";

const STALE = "Reject this request and ask for a fresh one.";

/**
 * add    → the post (waiting in review) goes live
 * edit   → the proposed form values replace the live post
 * delete → the post is soft-deleted
 */
export const postApprovalHandler: ApprovalHandler = {
  apply: async ({ resourceId, action, payload }) => {
    const post = await findPost(resourceId);
    if (!post) return { ok: false, message: `This post was deleted, so there's nothing to apply. ${STALE}` };

    if (action === "add") {
      await setPostStatus(post, "published");
      return { ok: true, message: `“${post.title}” is now live.` };
    }
    if (action === "delete") {
      await softDeletePost(post);
      return { ok: true, message: `“${post.title}” was deleted.` };
    }

    const parsed = postFormSchema.safeParse(payload);
    if (!parsed.success) return { ok: false, message: `These changes no longer pass the post checks. ${STALE}` };
    if (await checkParentEvent(parsed.data)) return { ok: false, message: `The event this update belongs to is gone. ${STALE}` };
    // Keep the post's current status: approving an edit never republishes a post the President took down.
    await persistPost({ data: parsed.data, status: post.status, existing: post, authorId: post.authorId });
    return { ok: true, message: `Changes to “${parsed.data.title}” are live.` };
  },

  reject: async ({ resourceId, action }) => {
    if (action !== "add") return;
    const post = await findPost(resourceId);
    // Back to the author's drafts so they can fix it and ask again.
    if (post?.status === "in_review") await setPostStatus(post, "draft");
  },

  summarize: async (requests) => {
    const ids = [...new Set(requests.map(({ resourceId }) => resourceId))];
    const posts = ids.length
      ? await getDb().query.posts.findMany({
          where: inArray(schema.posts.id, ids),
          with: { attachments: { columns: { mediaId: true }, orderBy: [asc(schema.postMedia.sortOrder)] } },
        })
      : [];
    const byId = new Map(posts.map((post) => [post.id, post]));

    return new Map(
      requests.map(({ id, resourceId, action, payload }): [string, ApprovalSummary] => {
        const post = byId.get(resourceId);
        if (!post) return [id, { title: "Unknown post", href: null, details: [] }];
        const live = !post.deletedAt;
        const proposed = action === "edit" ? postFormSchema.safeParse(payload) : null;
        const details = proposed?.success
          ? describePostChanges(toPostFormValues(post, post.attachments.map(({ mediaId }) => mediaId)), proposed.data)
          : [];
        return [id, { title: post.title, href: live ? `/admin/posts/${post.id}/edit` : null, details }];
      }),
    );
  },
};
