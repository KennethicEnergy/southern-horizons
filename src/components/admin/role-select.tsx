"use client";

import { ROLE_OPTIONS } from "@/config/roles";
import type { Role } from "@/types/rbac";
import { NativeSelect } from "@/components/ui/native-select";

type RoleSelectProps = {
  id: string;
  /** Screen-reader label, e.g. "Position for Ana". */
  label: string;
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
};

/** Compact pill select. h-9 matches the size="sm" buttons it sits beside on the Members and Applications rows. */
export const RoleSelect = ({ id, label, value, onChange, disabled }: RoleSelectProps) => (
  <>
    <label className="sr-only" htmlFor={id}>
      {label}
    </label>
    <NativeSelect
      id={id}
      value={value}
      onChange={({ target }) => onChange(target.value as Role)}
      disabled={disabled}
      className="h-9 rounded-full border border-line bg-white pl-3.5 text-sm text-ink transition-colors hover:border-ink/25 focus:border-sea focus:outline-none focus:ring-4 focus:ring-sea/15 disabled:opacity-50"
    >
      {ROLE_OPTIONS.map(({ value: option, label: optionLabel }) => (
        <option key={option} value={option}>
          {optionLabel}
        </option>
      ))}
    </NativeSelect>
  </>
);
