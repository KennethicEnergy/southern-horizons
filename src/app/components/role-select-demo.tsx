"use client";

import { useState } from "react";
import { DEFAULT_ROLE } from "@/config/roles";
import { actionIcons } from "@/config/icons";
import type { AssignableRole } from "@/types/rbac";
import { RoleSelect } from "@/components/admin/role-select";
import { Button } from "@/components/ui/button";
import { Specimen } from "./showcase";

/** RoleSelect as the Applications row shows it: beside size="sm" buttons, which it should match in height. */
export const RoleSelectDemo = () => {
  const [role, setRole] = useState<AssignableRole>(DEFAULT_ROLE);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Specimen label="Beside sm buttons (Applications row)">
        <div className="flex flex-wrap items-center gap-2">
          <RoleSelect id="demo-role" label="Position for Ana" value={role} onChange={setRole} />
          <Button size="sm" icon={actionIcons.approve}>
            Approve
          </Button>
          <Button size="sm" variant="outline" icon={actionIcons.reject}>
            Reject
          </Button>
        </div>
      </Specimen>
      <Specimen label="Disabled">
        <RoleSelect id="demo-role-disabled" label="Position for Ben" value={role} onChange={setRole} disabled />
      </Specimen>
    </div>
  );
};
