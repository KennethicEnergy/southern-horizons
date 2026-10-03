"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setUserRole } from "@/actions/users";
import type { AssignableRole } from "@/types/rbac";
import { actionIcons } from "@/config/icons";
import { toastResult } from "@/stores/toast-store";
import { Button } from "@/components/ui/button";
import { RoleSelect } from "./role-select";

export const MemberRoleSelect = ({ userId, name, role }: { userId: string; name: string; role: AssignableRole }) => {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<AssignableRole>(role);
  const changed = selected !== role;

  const save = () =>
    start(async () => {
      const res = await setUserRole({ userId, role: selected });
      if (!toastResult(res, "Saved")) return setSelected(role);
      router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <RoleSelect id={`member-role-${userId}`} label={`Position for ${name}`} value={selected} disabled={pending} onChange={setSelected} />
      {changed ? (
        <>
          <Button size="sm" icon={actionIcons.save} disabled={pending} onClick={save}>
            {pending ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setSelected(role)}>
            Cancel
          </Button>
        </>
      ) : null}
    </div>
  );
};
