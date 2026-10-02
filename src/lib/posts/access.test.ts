import { describe, expect, it } from "vitest";
import type { PostStatus } from "@/db/schema";
import type { Role } from "@/types/rbac";
import { decidePostDelete, decidePostEdit, decidePostPublish, getPostAccess, seesAllPosts } from "@/lib/posts/access";

const actor = (role: Role) => ({ id: "me", role });
const post = (status: PostStatus, authorId = "me") => ({ status, authorId });

describe("decidePostEdit", () => {
  it("lets the President edit any post immediately", () => {
    expect(decidePostEdit(actor("president"), post("published", "someone"))).toBe("immediate");
    expect(decidePostEdit(actor("president"), post("draft", "someone"))).toBe("immediate");
  });

  it("lets a managed position work on its own draft without approval", () => {
    expect(decidePostEdit(actor("creativesTeam"), post("draft"))).toBe("immediate");
  });

  it("keeps other people's drafts private", () => {
    expect(decidePostEdit(actor("creativesTeam"), post("draft", "someone"))).toBe("denied");
  });

  it("locks a post while it waits for approval to go live", () => {
    expect(decidePostEdit(actor("vpExternal"), post("in_review"))).toBe("denied");
  });

  it("sends changes to a live post for approval", () => {
    expect(decidePostEdit(actor("vpExternal"), post("published", "someone"))).toBe("approval");
  });

  it("denies members", () => {
    expect(decidePostEdit(actor("member"), post("draft"))).toBe("denied");
  });
});

describe("decidePostPublish and decidePostDelete", () => {
  it("follow the position's permission level", () => {
    expect(decidePostPublish(actor("president"))).toBe("immediate");
    expect(decidePostPublish(actor("bookkeeper"))).toBe("approval");
    expect(decidePostPublish(actor("member"))).toBe("denied");
    expect(decidePostDelete(actor("communications"))).toBe("approval");
    expect(decidePostDelete(actor("vpInternal"))).toBe("denied");
  });
});

describe("seesAllPosts", () => {
  it("is true only for positions that edit without approval", () => {
    expect(seesAllPosts("president")).toBe(true);
    expect(seesAllPosts("communications")).toBe(false);
  });
});

describe("getPostAccess", () => {
  it("treats a new post as the author's own draft", () => {
    expect(getPostAccess(actor("vpExternal"))).toEqual({ publish: "approval", edit: "immediate", delete: "denied" });
  });

  it("combines the decisions for an existing post", () => {
    expect(getPostAccess(actor("creativesTeam"), post("published", "someone"))).toEqual({
      publish: "approval",
      edit: "approval",
      delete: "approval",
    });
    expect(getPostAccess(actor("president"), post("draft", "someone"))).toEqual({
      publish: "immediate",
      edit: "immediate",
      delete: "immediate",
    });
  });
});
