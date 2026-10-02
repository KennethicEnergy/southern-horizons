import { z } from "zod";

export const approvalReviewSchema = z.discriminatedUnion("decision", [
  z.object({ requestId: z.uuid(), decision: z.literal("approved") }),
  z.object({
    requestId: z.uuid(),
    decision: z.literal("rejected"),
    reason: z.string().trim().min(3, "Say why, so they know what to fix.").max(500),
  }),
]);

export type ApprovalReview = z.infer<typeof approvalReviewSchema>;
