import type { PostStatus } from "@/db/schema";
import type { AccessDecision, PostAccess, Role } from "@/types/rbac";
import { authorizeAction, canPerformAction } from "@/lib/rbac";

type Actor = { id: string; role: Role };
type PostRef = { authorId: string; status: PostStatus };

/**
 * Drafts aren't on the site, so their author shapes them freely; going live is the
 * "add" that needs approval. Once a post waits for approval it's locked, and changes
 * to a live post are queued for an approver.
 */
export const decidePostEdit = ({ id, role }: Actor, { authorId, status }: PostRef): AccessDecision => {
  const decision = authorizeAction(role, "edit");
  if (decision !== "approval") return decision;
  if (status === "draft") return authorId === id ? "immediate" : "denied";
  if (status === "in_review") return "denied";
  return "approval";
};

export const decidePostPublish = ({ role }: Pick<Actor, "role">): AccessDecision => authorizeAction(role, "add");

export const decidePostDelete = ({ role }: Pick<Actor, "role">): AccessDecision => authorizeAction(role, "delete");

/** Positions that edit without approval see every draft; others see live posts and their own drafts. */
export const seesAllPosts = (role: Role): boolean => authorizeAction(role, "edit") === "immediate";

/** All three decisions for the post form. Without a post, it's a new one: the author's own draft. */
export const getPostAccess = (actor: Actor, post?: PostRef): PostAccess => ({
  publish: decidePostPublish(actor),
  edit: post ? decidePostEdit(actor, post) : canPerformAction(actor.role, "add") ? "immediate" : "denied",
  delete: decidePostDelete(actor),
});
