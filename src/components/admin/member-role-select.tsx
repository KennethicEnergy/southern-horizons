"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setUserRole } from "@/actions/users";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@/db/schema";
import { Button } from "@/components/ui/button";

export function MemberRoleSelect({ userId, name, role }: { userId: string; name: string; role: Role }) {
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
      <label className="sr-only" htmlFor={`member-role-${userId}`}>
        Role for {name}
      </label>
      <select
        id={`member-role-${userId}`}
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value as Role);
          setNotice(null);
        }}
        disabled={pending}
        className="h-8 rounded-full border border-line bg-white px-3 text-sm text-ink focus:border-sea focus:outline-none"
      >
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
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
}
