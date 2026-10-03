import { ASSIGNABLE_ROLES, SINGLE_HOLDER_ROLES } from "@/config/roles";
import { roleLabel } from "@/lib/rbac";
import type { AssignableRole, Role } from "@/types/rbac";

/**
 * Who may hold, change, and lose which position. Pure checks: the server actions look up
 * the people involved, ask here, and write only when the answer is null.
 * Each check returns the message to show, or null when the change is allowed.
 */

export { ASSIGNABLE_ROLES };

type Member = { id: string; name: string; role: Role };
type Refusal = string | null;

/** The unique index in the database that allows one Super Admin and one President. */
export const SINGLE_HOLDER_INDEX = "users_single_holder_idx";

const COMMAND_LINE_ONLY = "Super Admin can only be assigned from the command line.";

export const isSingleHolderRole = (role: Role): boolean => (SINGLE_HOLDER_ROLES as readonly Role[]).includes(role);

export const isAssignableRole = (role: Role): role is AssignableRole => (ASSIGNABLE_ROLES as readonly Role[]).includes(role);

/** Changing someone's position from the Members list. `holder` is whoever else holds `nextRole`, if it's single-holder. */
export const checkRoleChange = ({
  actorId,
  target,
  nextRole,
  holder,
}: {
  actorId: string;
  target: Member;
  nextRole: Role;
  holder: Member | null;
}): Refusal => {
  if (target.id === actorId) return "You can't change your own position.";
  if (target.role === "superAdmin") return "The Super Admin's position can only be changed from the command line.";
  if (!isAssignableRole(nextRole)) return COMMAND_LINE_ONLY;
  if (holder && holder.id !== target.id) return `${holder.name} is already ${roleLabel(nextRole)}. Change their position first.`;
  return null;
};

export const checkDeactivation = ({ actorId, target }: { actorId: string; target: Member }): Refusal => {
  if (target.id === actorId) return "You can't deactivate your own account.";
  if (target.role === "superAdmin") return "The Super Admin can't be deactivated from the backoffice.";
  return null;
};

/** Adding someone, by invite or by approving their application. */
export const checkNewMember = ({ role, holder }: { role: Role; holder: Member | null }): Refusal => {
  if (!isAssignableRole(role)) return COMMAND_LINE_ONLY;
  if (holder) return `${holder.name} is already ${roleLabel(role)}. Pick a different position.`;
  return null;
};

/** Shown when two changes race past the checks and the database index turns the second one away. */
export const positionTakenMessage = (role: Role) => `Someone else just became ${roleLabel(role)}. Refresh the page and try again.`;

/** True when Postgres rejected a write because of the one-holder index. Drizzle wraps the driver error in `cause`. */
export const isSingleHolderViolation = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const { code, constraint, cause } = error as { code?: unknown; constraint?: unknown; cause?: unknown };
  if (code === "23505" && constraint === SINGLE_HOLDER_INDEX) return true;
  return cause ? isSingleHolderViolation(cause) : false;
};

type SuperAdminPlan = { ok: true; demote: string | null } | { ok: false; error: string };

/**
 * What `pnpm db:super-admin <email>` should do. `current` is the existing Super Admin, if any;
 * with `replace`, they move to Member so the seat is free.
 */
export const planSuperAdmin = ({
  target,
  current,
  replace,
}: {
  target: (Member & { isActive: boolean }) | null;
  current: Member | null;
  replace: boolean;
}): SuperAdminPlan => {
  if (!target) return { ok: false, error: "No member has that email. Invite them first." };
  if (!target.isActive) return { ok: false, error: `${target.name} is deactivated. Reactivate them first.` };
  if (current?.id === target.id) return { ok: false, error: `${target.name} is already the Super Admin.` };
  if (current && !replace) {
    return { ok: false, error: `${current.name} is already the Super Admin. Run again with --replace to move them to Member.` };
  }
  return { ok: true, demote: current?.id ?? null };
};
