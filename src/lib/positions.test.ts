import { describe, expect, it } from "vitest";
import type { Role } from "@/types/rbac";
import {
  ASSIGNABLE_ROLES,
  checkDeactivation,
  checkNewMember,
  checkRoleChange,
  isAssignableRole,
  isSingleHolderRole,
  isSingleHolderViolation,
  planSuperAdmin,
} from "@/lib/positions";

const member = (id: string, role: Role, name = `Member ${id}`) => ({ id, name, role });

describe("single-holder positions", () => {
  it("allows one Super Admin and one President", () => {
    expect(isSingleHolderRole("superAdmin")).toBe(true);
    expect(isSingleHolderRole("president")).toBe(true);
    expect(isSingleHolderRole("communications")).toBe(false);
  });

  it("never offers Super Admin in the backoffice", () => {
    expect(ASSIGNABLE_ROLES).not.toContain("superAdmin");
    expect(ASSIGNABLE_ROLES).toContain("president");
    expect(isAssignableRole("superAdmin")).toBe(false);
    expect(isAssignableRole("member")).toBe(true);
  });
});

describe("checkRoleChange", () => {
  it("allows an ordinary change", () => {
    expect(checkRoleChange({ actorId: "me", target: member("a", "member"), nextRole: "communications", holder: null })).toBeNull();
  });

  it("refuses to change your own position", () => {
    expect(checkRoleChange({ actorId: "a", target: member("a", "president"), nextRole: "member", holder: null })).toBe(
      "You can't change your own position.",
    );
  });

  it("protects the Super Admin from everyone in the backoffice", () => {
    expect(checkRoleChange({ actorId: "pres", target: member("sa", "superAdmin"), nextRole: "member", holder: null })).toBe(
      "The Super Admin's position can only be changed from the command line.",
    );
  });

  it("refuses to make anyone Super Admin from the backoffice", () => {
    expect(checkRoleChange({ actorId: "sa", target: member("a", "member"), nextRole: "superAdmin", holder: null })).toBe(
      "Super Admin can only be assigned from the command line.",
    );
  });

  it("refuses a second President and names who holds it", () => {
    const holder = member("p", "president", "Ana Reyes");
    expect(checkRoleChange({ actorId: "sa", target: member("a", "member"), nextRole: "president", holder })).toBe(
      "Ana Reyes is already President. Change their position first.",
    );
  });

  it("allows a President when the seat is empty", () => {
    expect(checkRoleChange({ actorId: "sa", target: member("a", "member"), nextRole: "president", holder: null })).toBeNull();
  });
});

describe("checkDeactivation", () => {
  it("allows deactivating an ordinary member", () => {
    expect(checkDeactivation({ actorId: "me", target: member("a", "bookkeeper") })).toBeNull();
  });

  it("refuses to deactivate your own account", () => {
    expect(checkDeactivation({ actorId: "a", target: member("a", "president") })).toBe("You can't deactivate your own account.");
  });

  it("refuses to deactivate the Super Admin", () => {
    expect(checkDeactivation({ actorId: "pres", target: member("sa", "superAdmin") })).toBe(
      "The Super Admin can't be deactivated from the backoffice.",
    );
  });
});

describe("checkNewMember", () => {
  it("allows an assignable position", () => {
    expect(checkNewMember({ role: "member", holder: null })).toBeNull();
  });

  it("refuses Super Admin", () => {
    expect(checkNewMember({ role: "superAdmin", holder: null })).toBe("Super Admin can only be assigned from the command line.");
  });

  it("refuses a second President", () => {
    expect(checkNewMember({ role: "president", holder: member("p", "president", "Ana Reyes") })).toBe(
      "Ana Reyes is already President. Pick a different position.",
    );
  });
});

describe("isSingleHolderViolation", () => {
  const violation = { code: "23505", constraint: "users_single_holder_idx" };

  it("spots the one-holder index rejecting a write", () => {
    expect(isSingleHolderViolation(violation)).toBe(true);
  });

  it("looks through Drizzle's wrapper to the driver error", () => {
    expect(isSingleHolderViolation({ message: "Failed query", cause: violation })).toBe(true);
  });

  it("ignores other unique violations and other errors", () => {
    expect(isSingleHolderViolation({ code: "23505", constraint: "users_email_idx" })).toBe(false);
    expect(isSingleHolderViolation(new Error("boom"))).toBe(false);
    expect(isSingleHolderViolation(null)).toBe(false);
  });
});

describe("planSuperAdmin", () => {
  it("promotes an active member when there is no Super Admin", () => {
    expect(planSuperAdmin({ target: { ...member("me", "president"), isActive: true }, current: null, replace: false })).toEqual({
      ok: true,
      demote: null,
    });
  });

  it("does nothing when the member already is the Super Admin", () => {
    const me = { ...member("me", "superAdmin"), isActive: true };
    expect(planSuperAdmin({ target: me, current: member("me", "superAdmin"), replace: false })).toEqual({
      ok: false,
      error: "Member me is already the Super Admin.",
    });
  });

  it("refuses to replace an existing Super Admin without --replace", () => {
    expect(
      planSuperAdmin({ target: { ...member("me", "president"), isActive: true }, current: member("old", "superAdmin", "Old Admin"), replace: false }),
    ).toEqual({ ok: false, error: "Old Admin is already the Super Admin. Run again with --replace to move them to Member." });
  });

  it("moves the old Super Admin to Member with --replace", () => {
    expect(
      planSuperAdmin({ target: { ...member("me", "president"), isActive: true }, current: member("old", "superAdmin"), replace: true }),
    ).toEqual({ ok: true, demote: "old" });
  });

  it("refuses an unknown or deactivated member", () => {
    expect(planSuperAdmin({ target: null, current: null, replace: false })).toEqual({
      ok: false,
      error: "No member has that email. Invite them first.",
    });
    expect(planSuperAdmin({ target: { ...member("me", "member"), isActive: false }, current: null, replace: false })).toEqual({
      ok: false,
      error: "Member me is deactivated. Reactivate them first.",
    });
  });
});
