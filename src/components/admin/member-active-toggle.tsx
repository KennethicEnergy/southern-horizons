"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setUserActive } from "@/actions/users";
import { toastResult } from "@/stores/toast-store";
import { Button } from "@/components/ui/button";

export const MemberActiveToggle = ({ userId, name, active }: { userId: string; name: string; active: boolean }) => {
  const router = useRouter();
  const [pending, start] = useTransition();

  const toggle = () =>
    start(async () => {
      if (active && !confirm(`Remove ${name}'s access? They'll be signed out within 5 minutes.`)) return;
      const res = await setUserActive({ userId, active: !active });
      toastResult(res, active ? `${name} can no longer sign in.` : `${name} can sign in again.`);
      router.refresh();
    });

  return (
    <Button size="sm" variant={active ? "outline" : "primary"} disabled={pending} onClick={toggle}>
      {active ? "Deactivate" : "Reactivate"}
    </Button>
  );
};
