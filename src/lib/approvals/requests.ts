import "server-only";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { ApprovalRequest } from "@/db/schema";
import type { ApprovalResource, ApprovalStatus, ContentAction } from "@/types/rbac";
import type { SessionUser } from "@/lib/session";
import { getApprovers } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const requests = schema.approvalRequests;

/**
 * Queues a change for an approver instead of applying it. A requester has at most one pending
 * request per resource and action: asking again replaces the earlier payload.
 */
export const submitApprovalRequest = async ({
  requester: { id: requestedById, role: requestedRole },
  resourceType,
  resourceId,
  action,
  payload = null,
}: {
  requester: SessionUser;
  resourceType: ApprovalResource;
  resourceId: string;
  action: ContentAction;
  payload?: Record<string, unknown> | null;
}): Promise<{ id: string; updated: boolean }> => {
  const db = getDb();
  const [existing] = await db
    .select({ id: requests.id })
    .from(requests)
    .where(
      and(
        eq(requests.resourceType, resourceType),
        eq(requests.resourceId, resourceId),
        eq(requests.action, action),
        eq(requests.requestedById, requestedById),
        eq(requests.status, "pending"),
      ),
    )
    .limit(1);

  let id: string;
  if (existing) {
    id = existing.id;
    await db.update(requests).set({ payload }).where(eq(requests.id, id));
  } else {
    const [created] = await db
      .insert(requests)
      .values({ resourceType, resourceId, action, payload, requestedById, requestedRole, approverRoles: [...getApprovers(resourceType, action)] })
      .returning({ id: requests.id });
    id = created!.id;
  }

  await audit({
    actorId: requestedById,
    action: existing ? "approval.update" : `approval.request.${action}`,
    entityType: "approval_request",
    entityId: id,
    changes: { resourceType, resourceId },
  });
  revalidatePath("/admin", "layout");
  return { id, updated: Boolean(existing) };
};

export const findApprovalRequest = async (id: string): Promise<ApprovalRequest | undefined> => {
  const [request] = await getDb().select().from(requests).where(eq(requests.id, id)).limit(1);
  return request;
};

/** Records the decision on a pending request. False when someone else decided it first. */
export const settleApprovalRequest = async ({
  id,
  status,
  reviewerId,
  reason = null,
}: {
  id: string;
  status: Exclude<ApprovalStatus, "pending">;
  reviewerId: string;
  reason?: string | null;
}): Promise<boolean> => {
  const [row] = await getDb()
    .update(requests)
    .set({ status, reviewedById: reviewerId, reviewedAt: new Date(), reason })
    .where(and(eq(requests.id, id), eq(requests.status, "pending")))
    .returning({ id: requests.id });
  return Boolean(row);
};

/** Undoes a settle when the change couldn't be applied, so the request can be reviewed again. */
export const reopenApprovalRequest = async (id: string): Promise<void> => {
  await getDb()
    .update(requests)
    .set({ status: "pending", reviewedById: null, reviewedAt: null, reason: null })
    .where(eq(requests.id, id));
};
