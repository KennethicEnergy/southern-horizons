"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reviewApplication } from "@/actions/applications";
import { DEFAULT_ROLE } from "@/config/roles";
import type { Role } from "@/types/rbac";
import { Button } from "@/components/ui/button";
import { RoleSelect } from "./role-select";

export const ApplicationReviewButtons = ({ applicationId, name }: { applicationId: string; name: string }) => {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);

  const act = (decision: "approved" | "rejected") =>
    start(async () => {
      if (decision === "rejected" && !confirm(`Reject ${name}'s application?`)) return;
      const res = await reviewApplication(decision === "approved" ? { applicationId, decision, role } : { applicationId, decision });
      alert(res.message);
      router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <RoleSelect id={`role-${applicationId}`} label={`Position for ${name}`} value={role} onChange={setRole} disabled={pending} />
      <Button size="sm" disabled={pending} onClick={() => act("approved")}>
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("rejected")}>
        Reject
      </Button>
    </div>
  );
};
