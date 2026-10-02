import type { ApprovalRequest } from "@/db/schema";
import type { ActionResult } from "@/lib/errors";
import type { ApprovalStatus, ContentAction, Role } from "@/types/rbac";

/** How a request is shown in lists: what it's about, where to look, and what would change. */
export type ApprovalSummary = { title: string; href: string | null; details: string[] };

/**
 * Applies approved requests for one kind of resource. Register it in src/lib/approvals/handlers.ts.
 * `apply` returns a failure (instead of throwing) when the change can no longer be made.
 */
export type ApprovalHandler = {
  apply: (request: ApprovalRequest) => Promise<ActionResult>;
  reject: (request: ApprovalRequest) => Promise<void>;
  summarize: (requests: ApprovalRequest[]) => Promise<Map<string, ApprovalSummary>>;
};

export type ApprovalListItem = {
  id: string;
  action: ContentAction;
  status: ApprovalStatus;
  resourceType: string;
  requestedById: string;
  requesterName: string;
  requestedRole: Role;
  reviewerName: string | null;
  reviewedAt: Date | null;
  reason: string | null;
  createdAt: Date;
  summary: ApprovalSummary;
};
