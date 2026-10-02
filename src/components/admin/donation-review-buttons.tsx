"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { reviewDonation } from "@/actions/donations";
import { actionIcons } from "@/config/icons";
import { toastResult } from "@/stores/toast-store";
import { Button } from "@/components/ui/button";

export const DonationReviewButtons = ({ donationId }: { donationId: string }) => {
  const router = useRouter();
  const [pending, start] = useTransition();

  const act = (decision: "confirmed" | "rejected") =>
    start(async () => {
      const note = decision === "rejected" ? (prompt("Why is this being rejected? (Visible to officers only)") ?? undefined) : undefined;
      if (decision === "rejected" && note === undefined) return;
      const res = await reviewDonation({ donationId, decision, note });
      toastResult(res);
      router.refresh();
    });

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="primary" icon={actionIcons.approve} disabled={pending} onClick={() => act("confirmed")}>
        Confirm
      </Button>
      <Button size="sm" variant="outline" icon={actionIcons.reject} disabled={pending} onClick={() => act("rejected")}>
        Reject
      </Button>
    </div>
  );
};
