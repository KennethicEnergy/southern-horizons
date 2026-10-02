import { APPROVAL_RULES, PERMISSION_LEVELS, ROLE_KEYS, ROLES } from "@/config/roles";
import { roleLabel } from "@/lib/rbac";

const yesNo = (value: boolean) => (value ? "Yes" : "—");

/** The permission matrix, read straight from src/config/roles.ts so it never drifts from the rules. */
export const PermissionMatrix = () => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[36rem] text-left text-[0.95rem]">
      <thead className="border-b border-line text-sm text-ink-soft">
        <tr>
          <th scope="col" className="py-2 pr-4 font-medium">Position</th>
          <th scope="col" className="px-4 py-2 font-medium">Add</th>
          <th scope="col" className="px-4 py-2 font-medium">Edit</th>
          <th scope="col" className="px-4 py-2 font-medium">Delete</th>
          <th scope="col" className="px-4 py-2 font-medium">Approval</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {ROLE_KEYS.map((role) => {
          const { canAdd, canEdit, canDelete, requiresApproval } = PERMISSION_LEVELS[ROLES[role].permissionLevel];
          const acts = canAdd || canEdit || canDelete;
          return (
            <tr key={role}>
              <th scope="row" className="py-2 pr-4 font-medium">{roleLabel(role)}</th>
              <td className="px-4 py-2">{yesNo(canAdd)}</td>
              <td className="px-4 py-2">{yesNo(canEdit)}</td>
              <td className="px-4 py-2">{yesNo(canDelete)}</td>
              <td className="px-4 py-2 text-ink-soft">
                {!acts ? "View only" : requiresApproval ? `By ${APPROVAL_RULES.default.approvers.map((approver) => roleLabel(approver)).join(" or ")}` : "Not needed"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
