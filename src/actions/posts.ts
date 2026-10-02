"use server";

import type { PostStatus } from "@/db/schema";
import { requireAction, requireUser } from "@/lib/session";
import { ForbiddenError, type ActionResult } from "@/lib/errors";
import { postFormSchema, type PostFormValues } from "@/lib/validations/post";
import { decidePostDelete, decidePostEdit, decidePostPublish } from "@/lib/posts/access";
import { checkParentEvent, findPost, persistPost, softDeletePost } from "@/lib/posts/write";
import { submitApprovalRequest } from "@/lib/approvals/requests";
import { audit } from "@/lib/audit";
import { runAction } from "./_helpers";

type SavedPost = { id: string; slug: string; status: PostStatus };

const SAVED_MESSAGES: Record<PostStatus, string> = {
  draft: "Draft saved.",
  in_review: "Sent for approval. It goes live once approved.",
  published: "Published.",
  archived: "Archived.",
};

/**
 * Permission first, approval second:
 * 1. May this position touch this post at all? If not, refuse.
 * 2. Does the change wait for an approver? Then queue it; otherwise apply it now.
 */
export const savePost = async (values: PostFormValues, postId?: string): Promise<ActionResult<SavedPost>> =>
  runAction<SavedPost>(async () => {
    const user = postId ? await requireUser() : await requireAction("add");
    const data = postFormSchema.parse(values);

    const existing = postId ? await findPost(postId) : undefined;
    if (postId && !existing) return { ok: false, message: "This post no longer exists." };

    const editDecision = existing ? decidePostEdit(user, existing) : "immediate";
    if (editDecision === "denied") {
      throw new ForbiddenError(
        existing?.status === "in_review" ? "This post is waiting for approval, so it can't be changed right now." : "You can't edit this post.",
      );
    }

    const parentError = await checkParentEvent(data);
    if (parentError) return parentError;

    // A live post stays as it is until an approver accepts the proposed changes.
    if (existing && editDecision === "approval") {
      const { updated } = await submitApprovalRequest({
        requester: user,
        resourceType: "post",
        resourceId: existing.id,
        action: "edit",
        payload: data,
      });
      return {
        ok: true,
        message: updated ? "Your pending changes were updated. They go live once approved." : "Changes sent for approval. They go live once approved.",
        data: { id: existing.id, slug: existing.slug, status: existing.status },
      };
    }

    const publishDecision = data.intent === "publish" ? decidePostPublish(user) : null;
    if (publishDecision === "denied") throw new ForbiddenError("Your position can't publish posts.");
    const status: PostStatus = publishDecision === "immediate" ? "published" : publishDecision === "approval" ? "in_review" : "draft";

    const { id, slug } = await persistPost({ data, status, existing, authorId: user.id });
    if (publishDecision === "approval") {
      await submitApprovalRequest({ requester: user, resourceType: "post", resourceId: id, action: "add" });
    }

    await audit({
      actorId: user.id,
      action: existing ? `post.update.${status}` : `post.create.${status}`,
      entityType: "post",
      entityId: id,
      changes: existing ? { from: { status: existing.status, title: existing.title }, to: { status, title: data.title } } : undefined,
    });

    const message = status === "published" && existing?.status === "published" ? "Changes are live." : SAVED_MESSAGES[status];
    return { ok: true, message, data: { id, slug, status } };
  });

/** `requested` is true when the delete waits for approval, so the post is still there. */
export const deletePost = async (postId: string): Promise<ActionResult<{ requested: boolean }>> =>
  runAction<{ requested: boolean }>(async () => {
    const user = await requireUser();
    const post = await findPost(postId);
    if (!post) return { ok: false, message: "This post no longer exists." };

    const decision = decidePostDelete(user);
    if (decision === "denied") throw new ForbiddenError("Your position can't delete posts.");

    if (decision === "approval") {
      const { updated } = await submitApprovalRequest({ requester: user, resourceType: "post", resourceId: post.id, action: "delete" });
      return {
        ok: true,
        message: updated ? "You already asked to delete this post. It's still waiting for approval." : "Delete request sent for approval.",
        data: { requested: true },
      };
    }

    await softDeletePost(post);
    await audit({ actorId: user.id, action: "post.delete", entityType: "post", entityId: post.id, changes: { title: post.title } });
    return { ok: true, message: "Post deleted.", data: { requested: false } };
  });
