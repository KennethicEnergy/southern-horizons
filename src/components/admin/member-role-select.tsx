"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setUserRole } from "@/actions/users";
import type { Role } from "@/types/rbac";
import { Button } from "@/components/ui/button";
import { RoleSelect } from "./role-select";

export const MemberRoleSelect = ({ userId, name, role }: { userId: string; name: string; role: Role }) => {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<Role>(role);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const changed = selected !== role;

  const save = () =>
    start(async () => {
      setNotice(null);
      const res = await setUserRole({ userId, role: selected });
      if (!res.ok) {
        setSelected(role);
        setNotice({ tone: "error", text: res.message });
        return;
      }
      setNotice({ tone: "success", text: "Saved" });
      router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <RoleSelect
        id={`member-role-${userId}`}
        label={`Position for ${name}`}
        value={selected}
        disabled={pending}
        onChange={(next) => {
          setSelected(next);
          setNotice(null);
        }}
      />
      {changed ? (
        <>
          <Button size="sm" disabled={pending} onClick={save}>
            {pending ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setSelected(role)}>
            Cancel
          </Button>
        </>
      ) : null}
      {notice ? (
        <span role="status" className={`text-sm ${notice.tone === "error" ? "text-danger" : "text-leaf"}`}>
          {notice.text}
        </span>
      ) : null}
    </div>
  );
};
