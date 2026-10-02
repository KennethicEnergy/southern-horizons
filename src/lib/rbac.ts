import { APPROVAL_RULES, PERMISSION_LEVELS, ROLE_KEYS, ROLES } from "@/config/roles";
import type {
  AccessDecision,
  ApprovalResource,
  ApprovalRules,
  ContentAction,
  Permission,
  PermissionLevel,
  Role,
} from "@/types/rbac";

/**
 * Two separate questions, answered separately:
 * - Permission: may this position do the action at all? (`canPerformAction`, `can`)
 * - Approval: does the action wait for an approver before it takes effect? (`requiresApproval`)
 * Code checks these, never role names, so positions can be reshaped in src/config/roles.ts.
 */

type MaybeRole = Role | null | undefined;

export const isRole = (value: unknown): value is Role => (ROLE_KEYS as readonly unknown[]).includes(value);

/** Unknown roles (e.g. a session issued before positions were renamed) get no access. */
export const getPermissionLevel = (role: MaybeRole): PermissionLevel =>
  isRole(role) ? PERMISSION_LEVELS[ROLES[role].permissionLevel] : PERMISSION_LEVELS.viewOnly;

const ACTION_FLAGS = { add: "canAdd", edit: "canEdit", delete: "canDelete" } as const satisfies Record<ContentAction, keyof PermissionLevel>;

export const canPerformAction = (role: MaybeRole, action: ContentAction): boolean => getPermissionLevel(role)[ACTION_FLAGS[action]];

export const requiresApproval = (role: MaybeRole): boolean => getPermissionLevel(role).requiresApproval;

export const authorizeAction = (role: MaybeRole, action: ContentAction): AccessDecision => {
  if (!canPerformAction(role, action)) return "denied";
  return requiresApproval(role) ? "approval" : "immediate";
};

export const can = (role: MaybeRole, permission: Permission): boolean => isRole(role) && ROLES[role].permissions.includes(permission);

export const roleLabel = (role: MaybeRole): string => (isRole(role) ? ROLES[role].label : "Unknown role");

export const getApprovers = (resource: ApprovalResource, action: ContentAction, rules: ApprovalRules = APPROVAL_RULES): readonly Role[] =>
  (rules[resource]?.[action] ?? rules.default).approvers;

export const canApprove = (role: MaybeRole, resource: ApprovalResource, action: ContentAction, rules: ApprovalRules = APPROVAL_RULES): boolean =>
  isRole(role) && getApprovers(resource, action, rules).includes(role);

/** True when any rule names this role, i.e. they should see the approvals queue. */
export const isApprover = (role: MaybeRole, rules: ApprovalRules = APPROVAL_RULES): boolean => {
  if (!isRole(role)) return false;
  const { default: fallback, ...byResource } = rules;
  const all = [fallback, ...Object.values(byResource).flatMap((byAction) => Object.values(byAction ?? {}))];
  return all.some((rule) => rule?.approvers.includes(role));
};
