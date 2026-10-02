"use client";

import { useField } from "formik";
import type { ComponentProps, ReactNode } from "react";
import { toastIcons } from "@/config/icons";
import { useFieldState } from "@/hooks/useFieldState";
import { Icon } from "./icon";

// min-h-11 keeps every field a comfortable 44px tap target on phones.
const inputClass =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base text-ink shadow-[inset_0_1px_2px_rgb(2_61_84/0.04)] transition-[border-color,box-shadow] duration-200 placeholder:text-ink-soft/60 hover:border-ink/25 focus:border-sea focus:outline-none focus:ring-4 focus:ring-sea/15 disabled:cursor-not-allowed disabled:bg-sky disabled:text-ink-soft aria-invalid:border-danger aria-invalid:focus:ring-danger/15 sm:text-[0.95rem]";

type FieldShellProps = { id: string; label: string; hint?: ReactNode; error?: string; children: ReactNode };

const FieldShell = ({ id, label, hint, error, children }: FieldShellProps) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-ink">
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-danger">
        <Icon icon={toastIcons.error} size={16} className="mt-0.5 shrink-0" />
        {error}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="text-sm text-ink-soft">
        {hint}
      </p>
    ) : null}
  </div>
);

type Common = { name: string; label: string; hint?: ReactNode };

export const TextField = ({ name, label, hint, ...props }: Common & Omit<ComponentProps<"input">, "name">) => {
  const { field, error } = useFieldState(name);
  return (
    <FieldShell id={name} label={label} hint={hint} error={error}>
      <input
        id={name}
        className={inputClass}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...field}
        value={field.value ?? ""}
        {...props}
      />
    </FieldShell>
  );
};

export const TextArea = ({ name, label, hint, ...props }: Common & Omit<ComponentProps<"textarea">, "name">) => {
  const { field, error } = useFieldState(name);
  return (
    <FieldShell id={name} label={label} hint={hint} error={error}>
      <textarea
        id={name}
        rows={5}
        className={inputClass}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...field}
        value={field.value ?? ""}
        {...props}
      />
    </FieldShell>
  );
};

type SelectFieldProps = Common &
  Omit<ComponentProps<"select">, "name"> & { options: { value: string; label: string }[]; placeholder?: string };

export const SelectField = ({ name, label, hint, options, placeholder, ...props }: SelectFieldProps) => {
  const { field, error } = useFieldState(name);
  return (
    <FieldShell id={name} label={label} hint={hint} error={error}>
      <select
        id={name}
        className={inputClass}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...field}
        value={field.value ?? ""}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </FieldShell>
  );
};

export const CheckboxField = ({ name, label }: { name: string; label: string }) => {
  const [field] = useField({ name, type: "checkbox" });
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.95rem] text-ink">
      <input type="checkbox" className="size-5 shrink-0 accent-sea" {...field} />
      {label}
    </label>
  );
};

const alertTones = {
  error: { styles: "bg-danger-mist text-danger", icon: toastIcons.error },
  success: { styles: "bg-leaf-mist text-leaf", icon: toastIcons.success },
};

export const FormAlert = ({ tone, children }: { tone: keyof typeof alertTones; children: ReactNode }) => {
  const { styles, icon } = alertTones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${styles}`}>
      <Icon icon={icon} size={18} className="mt-px shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
};
