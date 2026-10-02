"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { canApprove } from "@/lib/rbac";
import { ForbiddenError, type ActionResult } from "@/lib/errors";
import { approvalReviewSchema, type ApprovalReview } from "@/lib/validations/approval";
import { APPROVAL_HANDLERS, isApprovalResource } from "@/lib/approvals/handlers";
import { findApprovalRequest, reopenApprovalRequest, settleApprovalRequest } from "@/lib/approvals/requests";
import { audit } from "@/lib/audit";
import { runAction } from "./_helpers";

/** Approve applies the queued change; reject leaves things as they are and records why. */
export const reviewApprovalRequest = async (input: ApprovalReview): Promise<ActionResult> =>
  runAction(async () => {
    const reviewer = await requireUser();
    const data = approvalReviewSchema.parse(input);
    const reason = data.decision === "rejected" ? data.reason : null;

    const request = await findApprovalRequest(data.requestId);
    if (!request || !isApprovalResource(request.resourceType)) return { ok: false, message: "That request no longer exists." };
    if (request.status !== "pending") return { ok: false, message: "This request was already reviewed." };
    if (!canApprove(reviewer.role, request.resourceType, request.action)) throw new ForbiddenError("Your position can't approve this request.");
    if (request.requestedById === reviewer.id) throw new ForbiddenError("You can't review your own request.");

    // Claim it first so two approvers can't apply the same change twice.
    const claimed = await settleApprovalRequest({ id: request.id, status: data.decision, reviewerId: reviewer.id, reason });
    if (!claimed) return { ok: false, message: "This request was already reviewed." };

    const handler = APPROVAL_HANDLERS[request.resourceType];
    let result: ActionResult = { ok: true, message: "Request rejected. Nothing was changed." };
    try {
      if (data.decision === "approved") result = await handler.apply(request);
      else await handler.reject(request);
    } catch (err) {
      await reopenApprovalRequest(request.id);
      throw err;
    }
    if (!result.ok) {
      await reopenApprovalRequest(request.id);
      return result;
    }

    await audit({
      actorId: reviewer.id,
      action: `approval.${data.decision}`,
      entityType: "approval_request",
      entityId: request.id,
      changes: { resourceType: request.resourceType, resourceId: request.resourceId, action: request.action, requestedBy: request.requestedById, reason },
    });
    revalidatePath("/admin", "layout");
    return result;
  });
