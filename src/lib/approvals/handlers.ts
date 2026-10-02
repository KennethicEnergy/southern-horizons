import "server-only";
import type { ApprovalHandler } from "@/types/approvals";
import type { ApprovalResource } from "@/types/rbac";
import { postApprovalHandler } from "@/lib/posts/approval-handler";

/** One handler per resource that can wait for approval. */
export const APPROVAL_HANDLERS: Record<ApprovalResource, ApprovalHandler> = {
  post: postApprovalHandler,
};

export const isApprovalResource = (value: string): value is ApprovalResource => Object.hasOwn(APPROVAL_HANDLERS, value);
