"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reviewApplication } from "@/actions/applications";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@/db/schema";
import { Button } from "@/components/ui/button";

export function ApplicationReviewButtons({ applicationId, name }: { applicationId: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [role, setRole] = useState<Role>("creator");

  const act = (decision: "approved" | "rejected") =>
    start(async () => {
      if (decision === "rejected" && !confirm(`Reject ${name}'s application?`)) return;
      const res = await reviewApplication(decision === "approved" ? { applicationId, decision, role } : { applicationId, decision });
      alert(res.message);
      router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <label className="sr-only" htmlFor={`role-${applicationId}`}>
        Role for {name}
      </label>
      <select
        id={`role-${applicationId}`}
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        disabled={pending}
        className="h-8 rounded-full border border-line bg-white px-3 text-sm text-ink focus:border-sea focus:outline-none"
      >
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <Button size="sm" disabled={pending} onClick={() => act("approved")}>
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("rejected")}>
        Reject
      </Button>
    </div>
  );
}
