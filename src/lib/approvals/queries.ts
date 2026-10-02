import "server-only";
import { and, count, desc, eq, inArray, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, schema } from "@/db";
import type { ApprovalListItem, ApprovalSummary } from "@/types/approvals";
import type { ApprovalResource, ContentAction, Role } from "@/types/rbac";
import { canApprove, isApprover } from "@/lib/rbac";
import { APPROVAL_HANDLERS, isApprovalResource } from "@/lib/approvals/handlers";

const requests = schema.approvalRequests;
const UNKNOWN: ApprovalSummary = { title: "Unknown item", href: null, details: [] };

/** Newest first, with names and a summary of what each request is about. */
export const listApprovalRequests = async (where: SQL | undefined, limit = 50): Promise<ApprovalListItem[]> => {
  const requester = alias(schema.users, "requester");
  const reviewer = alias(schema.users, "reviewer");
  const rows = await getDb()
    .select({ request: requests, requesterName: requester.name, reviewerName: reviewer.name })
    .from(requests)
    .innerJoin(requester, eq(requester.id, requests.requestedById))
    .leftJoin(reviewer, eq(reviewer.id, requests.reviewedById))
    .where(where)
    .orderBy(desc(requests.createdAt))
    .limit(limit);

  const summaries = new Map<string, ApprovalSummary>();
  for (const resourceType of new Set(rows.map(({ request }) => request.resourceType))) {
    if (!isApprovalResource(resourceType)) continue;
    const group = rows.filter(({ request }) => request.resourceType === resourceType).map(({ request }) => request);
    const resolved = await APPROVAL_HANDLERS[resourceType].summarize(group);
    for (const [id, summary] of resolved) summaries.set(id, summary);
  }

  return rows.map(({ request, requesterName, reviewerName }) => ({
    id: request.id,
    action: request.action,
    status: request.status,
    resourceType: request.resourceType,
    requestedById: request.requestedById,
    requesterName,
    requestedRole: request.requestedRole,
    reviewerName,
    reviewedAt: request.reviewedAt,
    reason: request.reason,
    createdAt: request.createdAt,
    summary: summaries.get(request.id) ?? UNKNOWN,
  }));
};

/** Pending requests this role may decide. */
export const listPendingFor = async (role: Role): Promise<ApprovalListItem[]> => {
  if (!isApprover(role)) return [];
  const pending = await listApprovalRequests(eq(requests.status, "pending"), 200);
  return pending.filter(({ resourceType, action }) => isApprovalResource(resourceType) && canApprove(role, resourceType, action));
};

export const countPendingFor = async (role: Role): Promise<number> => {
  if (!isApprover(role)) return 0;
  const groups = await getDb()
    .select({ resourceType: requests.resourceType, action: requests.action, n: count() })
    .from(requests)
    .where(eq(requests.status, "pending"))
    .groupBy(requests.resourceType, requests.action);
  return groups
    .filter(({ resourceType, action }) => isApprovalResource(resourceType) && canApprove(role, resourceType, action))
    .reduce((total, { n }) => total + n, 0);
};

export const countPendingBy = async (userId: string): Promise<number> => {
  const [row] = await getDb()
    .select({ n: count() })
    .from(requests)
    .where(and(eq(requests.requestedById, userId), eq(requests.status, "pending")));
  return row?.n ?? 0;
};

/** Which actions are waiting for approval on each of these resources, for status chips in lists. */
export const pendingActionsFor = async (resourceType: ApprovalResource, resourceIds: string[]): Promise<Map<string, ContentAction[]>> => {
  if (resourceIds.length === 0) return new Map();
  const rows = await getDb()
    .selectDistinct({ resourceId: requests.resourceId, action: requests.action })
    .from(requests)
    .where(and(eq(requests.resourceType, resourceType), inArray(requests.resourceId, resourceIds), eq(requests.status, "pending")));
  const out = new Map<string, ContentAction[]>();
  for (const { resourceId, action } of rows) out.set(resourceId, [...(out.get(resourceId) ?? []), action]);
  return out;
};

export const listRequestsForResource = (resourceType: ApprovalResource, resourceId: string, limit = 10) =>
  listApprovalRequests(and(eq(requests.resourceType, resourceType), eq(requests.resourceId, resourceId)), limit);

/** The payload of this user's pending request, so they can keep working on what they proposed. */
export const findPendingPayload = async ({
  resourceType,
  resourceId,
  action,
  userId,
}: {
  resourceType: ApprovalResource;
  resourceId: string;
  action: ContentAction;
  userId: string;
}): Promise<unknown> => {
  const [row] = await getDb()
    .select({ payload: requests.payload })
    .from(requests)
    .where(
      and(
        eq(requests.resourceType, resourceType),
        eq(requests.resourceId, resourceId),
        eq(requests.action, action),
        eq(requests.requestedById, userId),
        eq(requests.status, "pending"),
      ),
    )
    .limit(1);
  return row?.payload ?? null;
};
