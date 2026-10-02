"use client";

import { ROLE_OPTIONS } from "@/config/roles";
import type { Role } from "@/types/rbac";

type RoleSelectProps = {
  id: string;
  /** Screen-reader label, e.g. "Position for Ana". */
  label: string;
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
};

export const RoleSelect = ({ id, label, value, onChange, disabled }: RoleSelectProps) => (
  <>
    <label className="sr-only" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={({ target }) => onChange(target.value as Role)}
      disabled={disabled}
      className="h-8 rounded-full border border-line bg-white px-3 text-sm text-ink focus:border-sea focus:outline-none"
    >
      {ROLE_OPTIONS.map(({ value: option, label: optionLabel }) => (
        <option key={option} value={option}>
          {optionLabel}
        </option>
      ))}
    </select>
  </>
);
