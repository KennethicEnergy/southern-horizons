import { describe, expect, it } from "vitest";
import type { ApprovalRules, Role } from "@/types/rbac";
import { PERMISSIONS } from "@/config/roles";
import {
  authorizeAction,
  can,
  canApprove,
  canPerformAction,
  getApprovers,
  isApprover,
  isRole,
  requiresApproval,
  roleLabel,
} from "@/lib/rbac";

const OFFICERS: Role[] = [
  "superAdmin",
  "president",
  "vpExternal",
  "vpInternal",
  "communications",
  "creativesTeam",
  "orgDevelopment",
  "donorSponsorRelations",
  "bookkeeper",
];

describe("permission matrix", () => {
  // [role, add, edit, delete, approval required]
  const matrix: [Role, boolean, boolean, boolean, boolean][] = [
    ["superAdmin", true, true, true, false],
    ["president", true, true, true, false],
    ["vpExternal", true, true, false, true],
    ["vpInternal", true, true, false, true],
    ["communications", true, true, true, true],
    ["creativesTeam", true, true, true, true],
    ["orgDevelopment", true, true, true, true],
    ["donorSponsorRelations", true, true, false, true],
    ["bookkeeper", true, true, false, true],
    ["member", false, false, false, false],
  ];

  it.each(matrix)("%s: add %s, edit %s, delete %s, approval %s", (role, add, edit, del, approval) => {
    expect(canPerformAction(role, "add")).toBe(add);
    expect(canPerformAction(role, "edit")).toBe(edit);
    expect(canPerformAction(role, "delete")).toBe(del);
    expect(requiresApproval(role)).toBe(approval);
  });
});

describe("authorizeAction", () => {
  it("lets the President act immediately", () => {
    expect(authorizeAction("president", "add")).toBe("immediate");
    expect(authorizeAction("president", "edit")).toBe("immediate");
    expect(authorizeAction("president", "delete")).toBe("immediate");
  });

  it("sends allowed actions of managed positions for approval", () => {
    expect(authorizeAction("creativesTeam", "delete")).toBe("approval");
    expect(authorizeAction("vpExternal", "edit")).toBe("approval");
  });

  it("denies actions the position isn't allowed, before looking at approval", () => {
    expect(authorizeAction("vpExternal", "delete")).toBe("denied");
    expect(authorizeAction("member", "add")).toBe("denied");
  });

  it("denies everything for a missing or unknown role", () => {
    expect(authorizeAction(null, "add")).toBe("denied");
    expect(authorizeAction("admin" as Role, "edit")).toBe("denied");
  });
});

describe("can", () => {
  it("gives every position backoffice access", () => {
    for (const role of [...OFFICERS, "member" as const]) expect(can(role, "admin:access")).toBe(true);
  });

  it("keeps member management with the Super Admin and the President", () => {
    expect(can("superAdmin", "user:manage")).toBe(true);
    expect(can("president", "user:manage")).toBe(true);
    for (const role of OFFICERS.filter((r) => r !== "president" && r !== "superAdmin")) expect(can(role, "user:manage")).toBe(false);
  });

  it("gives the Super Admin every permission", () => {
    for (const permission of PERMISSIONS) expect(can("superAdmin", permission)).toBe(true);
  });

  it("lets the Bookkeeper confirm donations", () => {
    expect(can("bookkeeper", "donation:review")).toBe(true);
    expect(can("creativesTeam", "donation:review")).toBe(false);
  });

  it("returns false for a missing or unknown role", () => {
    expect(can(undefined, "admin:access")).toBe(false);
    expect(can("admin" as Role, "admin:access")).toBe(false);
  });
});

describe("approval rules", () => {
  it("defaults to the Super Admin and the President as approvers", () => {
    expect(getApprovers("post", "edit")).toEqual(["superAdmin", "president"]);
    expect(canApprove("superAdmin", "post", "delete")).toBe(true);
    expect(canApprove("president", "post", "delete")).toBe(true);
    expect(canApprove("vpInternal", "post", "delete")).toBe(false);
    expect(isApprover("superAdmin")).toBe(true);
  });

  it("uses a per-resource, per-action rule when one is configured", () => {
    const rules: ApprovalRules = {
      default: { approvers: ["president"] },
      post: { add: { approvers: ["vpInternal", "president"] } },
    };
    expect(getApprovers("post", "add", rules)).toEqual(["vpInternal", "president"]);
    expect(getApprovers("post", "delete", rules)).toEqual(["president"]);
    expect(canApprove("vpInternal", "post", "add", rules)).toBe(true);
    expect(canApprove("vpInternal", "post", "delete", rules)).toBe(false);
  });

  it("knows who approves anything at all", () => {
    const rules: ApprovalRules = { default: { approvers: ["president"] }, post: { edit: { approvers: ["vpInternal"] } } };
    expect(isApprover("president", rules)).toBe(true);
    expect(isApprover("vpInternal", rules)).toBe(true);
    expect(isApprover("bookkeeper", rules)).toBe(false);
    expect(isApprover(null, rules)).toBe(false);
  });
});

describe("isRole and roleLabel", () => {
  it("recognises only configured roles", () => {
    expect(isRole("donorSponsorRelations")).toBe(true);
    expect(isRole("admin")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });

  it("labels roles for display", () => {
    expect(roleLabel("superAdmin")).toBe("Super Admin");
    expect(roleLabel("donorSponsorRelations")).toBe("Donor & Sponsor Relations");
    expect(roleLabel("vpExternal")).toBe("VP External");
    expect(roleLabel("admin" as Role)).toBe("Unknown role");
  });
});
