import type { Role } from "@/db/schema";

/**
 * Every protected action in the app is a permission string.
 * Code checks permissions, never role names, so roles can be reshaped
 * without hunting through components and actions.
 */
export const PERMISSIONS = [
  "admin:access",
  "post:create",
  "post:edit:own",
  "post:edit:any",
  "post:submit",
  "post:publish",
  "post:delete:own",
  "post:delete:any",
  "media:upload",
  "media:upload:svg",
  "media:delete",
  "campaign:manage",
  "donation:view",
  "donation:review",
  "ledger:manage",
  "message:view",
  "user:manage",
  "audit:view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: PERMISSIONS,
  editor: [
    "admin:access",
    "post:create",
    "post:edit:own",
    "post:edit:any",
    "post:submit",
    "post:publish",
    "post:delete:own",
    "post:delete:any",
    "media:upload",
    "media:delete",
    "campaign:manage",
    "donation:view",
    "message:view",
  ],
  creator: ["admin:access", "post:create", "post:edit:own", "post:submit", "post:delete:own", "media:upload"],
  treasurer: ["admin:access", "donation:view", "donation:review", "ledger:manage", "media:upload"],
  member: ["admin:access", "donation:view"],
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  editor: "Editor",
  creator: "Content creator",
  treasurer: "Treasurer",
  member: "Member",
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Ownership-aware check for editing/deleting a specific post. */
export function canOnPost(
  user: { id: string; role: Role } | null | undefined,
  action: "edit" | "delete",
  post: { authorId: string; status: string },
): boolean {
  if (!user) return false;
  if (can(user.role, `post:${action}:any`)) return true;
  const isOwner = post.authorId === user.id;
  if (!isOwner || !can(user.role, `post:${action}:own`)) return false;
  // Creators can only change their own work before it goes live.
  return post.status === "draft" || post.status === "in_review";
}
