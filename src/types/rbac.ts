import type { APPROVAL_STATUSES, CONTENT_ACTIONS, PERMISSION_LEVELS, PERMISSIONS, ROLE_KEYS } from "../config/roles";

/** An organisational position. Stored in the `role` column of `users`. */
export type Role = (typeof ROLE_KEYS)[number];

/** A position the backoffice can hand out; Super Admin is set only from the command line. */
export type AssignableRole = Exclude<Role, "superAdmin">;

/** Content changes that go through permission levels (and approval, where required). */
export type ContentAction = (typeof CONTENT_ACTIONS)[number];

/** Capabilities outside add/edit/delete, e.g. managing members or confirming donations. */
export type Permission = (typeof PERMISSIONS)[number];

export type PermissionLevel = {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  requiresApproval: boolean;
};

export type PermissionLevelKey = keyof typeof PERMISSION_LEVELS;

export type RoleConfig = {
  label: string;
  permissionLevel: PermissionLevelKey;
  permissions: readonly Permission[];
};

/** What a user's attempt at an action turns into: refused, applied now, or queued for an approver. */
export type AccessDecision = "denied" | "immediate" | "approval";

/** Things whose changes can wait for approval. Add a resource here and give it a handler in src/lib/approvals/handlers.ts. */
export type ApprovalResource = "post";

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type ApprovalRule = { approvers: readonly Role[] };

/** `default` applies unless a rule exists for the resource and action. */
export type ApprovalRules = {
  default: ApprovalRule;
} & Partial<Record<ApprovalResource, Partial<Record<ContentAction, ApprovalRule>>>>;

/** What saving, publishing, and deleting a particular post turns into for the current user. */
export type PostAccess = { publish: AccessDecision; edit: AccessDecision; delete: AccessDecision };
