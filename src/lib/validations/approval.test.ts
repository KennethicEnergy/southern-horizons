import { describe, expect, it } from "vitest";
import { approvalReviewSchema } from "@/lib/validations/approval";

const requestId = "7f2c1a52-4d1e-4c8b-9a51-2b0f3c9d8e11";

describe("approvalReviewSchema", () => {
  it("accepts an approval without a reason", () => {
    expect(approvalReviewSchema.safeParse({ requestId, decision: "approved" }).success).toBe(true);
  });

  it("requires a reason to reject", () => {
    expect(approvalReviewSchema.safeParse({ requestId, decision: "rejected" }).success).toBe(false);
    expect(approvalReviewSchema.safeParse({ requestId, decision: "rejected", reason: "  " }).success).toBe(false);
    expect(approvalReviewSchema.safeParse({ requestId, decision: "rejected", reason: "Wrong date" }).success).toBe(true);
  });

  it("rejects unknown decisions and malformed ids", () => {
    expect(approvalReviewSchema.safeParse({ requestId, decision: "pending" }).success).toBe(false);
    expect(approvalReviewSchema.safeParse({ requestId: "x", decision: "approved" }).success).toBe(false);
  });
});
