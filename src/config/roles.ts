/**
 * Positions, what they may do, and who approves their changes.
 * Imported by the Drizzle schema, so use relative imports only.
 */
import type { ApprovalRules, ContentAction, PermissionLevel, Role, RoleConfig } from "../types/rbac";

export const CONTENT_ACTIONS = ["add", "edit", "delete"] as const;

export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;

export const PERMISSIONS = [
  "admin:access",
  "media:upload:svg",
  "campaign:manage",
  "donation:view",
  "donation:review",
  "ledger:manage",
  "message:view",
  "user:manage",
  "audit:view",
] as const;

export const PERMISSION_LEVELS = {
  full: { canAdd: true, canEdit: true, canDelete: true, requiresApproval: false },
  managed: { canAdd: true, canEdit: true, canDelete: false, requiresApproval: true },
  managedWithDelete: { canAdd: true, canEdit: true, canDelete: true, requiresApproval: true },
  /** Members who aren't officers: they can sign in and look, but not change content. */
  viewOnly: { canAdd: false, canEdit: false, canDelete: false, requiresApproval: false },
} as const satisfies Record<string, PermissionLevel>;

/** Order here is the order positions appear in pickers. */
export const ROLE_KEYS = [
  "president",
  "vpExternal",
  "vpInternal",
  "communications",
  "creativesTeam",
  "orgDevelopment",
  "donorSponsorRelations",
  "bookkeeper",
  "member",
] as const;

const BASE = ["admin:access", "donation:view"] as const;

export const ROLES: Record<Role, RoleConfig> = {
  president: { label: "President", permissionLevel: "full", permissions: [...PERMISSIONS] },
  vpExternal: { label: "VP External", permissionLevel: "managed", permissions: [...BASE, "message:view"] },
  vpInternal: { label: "VP Internal", permissionLevel: "managed", permissions: [...BASE, "message:view"] },
  communications: { label: "Communications", permissionLevel: "managedWithDelete", permissions: [...BASE, "message:view"] },
  creativesTeam: { label: "Creatives Team", permissionLevel: "managedWithDelete", permissions: BASE },
  orgDevelopment: { label: "Org Development", permissionLevel: "managedWithDelete", permissions: BASE },
  donorSponsorRelations: { label: "Donor & Sponsor Relations", permissionLevel: "managed", permissions: [...BASE, "message:view"] },
  bookkeeper: { label: "Bookkeeper", permissionLevel: "managed", permissions: [...BASE, "donation:review", "ledger:manage"] },
  member: { label: "Member", permissionLevel: "viewOnly", permissions: BASE },
};

export const ROLE_OPTIONS = ROLE_KEYS.map((value) => ({ value, label: ROLES[value].label }));

/** New accounts start here until the President assigns a position. */
export const DEFAULT_ROLE: Role = "member";

/**
 * Who approves changes from positions whose level requires approval.
 * Add `post: { delete: { approvers: [...] } }` and so on to route specific actions elsewhere.
 */
export const APPROVAL_RULES: ApprovalRules = {
  default: { approvers: ["president"] },
};

export const CONTENT_ACTION_LABELS: Record<ContentAction, string> = { add: "Add", edit: "Edit", delete: "Delete" };
