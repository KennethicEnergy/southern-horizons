import Link from "next/link";
import type { ReactNode } from "react";
import type { ApprovalListItem } from "@/types/approvals";
import { CONTENT_ACTION_LABELS } from "@/config/roles";
import { roleLabel } from "@/lib/rbac";
import { formatDateTime } from "@/lib/dates";
import { StatusBadge } from "./status-badge";

type ApprovalListProps = {
  items: ApprovalListItem[];
  empty: string;
  /** Hide the item title, e.g. on the page of the post the requests are about. */
  hideTitle?: boolean;
  /** Extra controls per request, e.g. approve and reject buttons. */
  renderActions?: (item: ApprovalListItem) => ReactNode;
};

/** Requests with their state: pending, approved, or rejected (with the reason). */
export const ApprovalList = ({ items, empty, hideTitle = false, renderActions }: ApprovalListProps) => {
  if (items.length === 0) return <p className="text-ink-soft">{empty}</p>;
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const { id, action, status, summary, requesterName, requestedRole, createdAt, reviewerName, reviewedAt, reason } = item;
        return (
          <li key={id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-start">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                <span className="text-sm font-medium uppercase tracking-wide text-ink-soft">{CONTENT_ACTION_LABELS[action]}</span>
                {hideTitle ? null : summary.href ? (
                  <Link href={summary.href} className="font-semibold hover:text-sea">
                    {summary.title}
                  </Link>
                ) : (
                  <span className="font-semibold">{summary.title}</span>
                )}
              </div>
              {summary.details.length > 0 ? <p className="text-[0.95rem]">Changes: {summary.details.join(", ")}</p> : null}
              <p className="text-sm text-ink-soft">
                Requested by {requesterName} ({roleLabel(requestedRole)}) · {formatDateTime(createdAt)}
              </p>
              {reviewedAt ? (
                <p className="text-sm text-ink-soft">
                  {status === "approved" ? "Approved" : "Rejected"} by {reviewerName ?? "someone"} · {formatDateTime(reviewedAt)}
                </p>
              ) : null}
              {reason ? <p className="whitespace-pre-line text-[0.95rem] text-danger">Reason: {reason}</p> : null}
            </div>
            {renderActions ? renderActions(item) : null}
          </li>
        );
      })}
    </ul>
  );
};
