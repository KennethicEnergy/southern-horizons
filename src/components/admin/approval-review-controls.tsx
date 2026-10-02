"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reviewApprovalRequest } from "@/actions/approvals";
import type { ApprovalReview } from "@/lib/validations/approval";
import { Button } from "@/components/ui/button";

/** Approve applies the change right away; reject asks for a reason the requester will see. */
export const ApprovalReviewControls = ({ requestId, title }: { requestId: string; title: string }) => {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const decide = (review: ApprovalReview) =>
    start(async () => {
      setError(null);
      const res = await reviewApprovalRequest(review);
      if (!res.ok) return setError(res.message);
      router.refresh();
    });

  if (rejecting) {
    return (
      <div className="grid w-full gap-2 md:w-72">
        <label htmlFor={`reason-${requestId}`} className="text-sm font-medium">
          Why reject “{title}”?
        </label>
        <textarea
          id={`reason-${requestId}`}
          rows={3}
          value={reason}
          onChange={({ target }) => setReason(target.value)}
          disabled={pending}
          className="rounded-lg border border-line bg-white px-3 py-2 text-[0.95rem] focus:border-sea focus:outline-none"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={pending} onClick={() => decide({ requestId, decision: "rejected", reason })}>
            {pending ? "Rejecting…" : "Reject"}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setRejecting(false)}>
            Cancel
          </Button>
        </div>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid justify-items-end gap-2">
      <div className="flex gap-2">
        <Button size="sm" disabled={pending} onClick={() => decide({ requestId, decision: "approved" })}>
          {pending ? "Approving…" : "Approve"}
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setRejecting(true)}>
          Reject
        </Button>
      </div>
      {error ? <p role="alert" className="max-w-72 text-right text-sm text-danger">{error}</p> : null}
    </div>
  );
};
