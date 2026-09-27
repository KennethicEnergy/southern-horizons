"use client";

import { useField } from "formik";
import type { ComponentProps, ReactNode } from "react";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-sea focus:outline-none focus:ring-2 focus:ring-sea/20 aria-invalid:border-danger";

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Common = { name: string; label: string; hint?: ReactNode };

export function TextField({ name, label, hint, ...props }: Common & Omit<ComponentProps<"input">, "name">) {
  const [field, meta] = useField(name);
  const error = meta.touched ? meta.error : undefined;
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
}

export function TextArea({ name, label, hint, ...props }: Common & Omit<ComponentProps<"textarea">, "name">) {
  const [field, meta] = useField(name);
  const error = meta.touched ? meta.error : undefined;
  return (
    <FieldShell id={name} label={label} hint={hint} error={error}>
      <textarea
        id={name}
        rows={5}
        className={inputClass}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...field}
        value={field.value ?? ""}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  hint,
  options,
  placeholder,
  ...props
}: Common & Omit<ComponentProps<"select">, "name"> & { options: { value: string; label: string }[]; placeholder?: string }) {
  const [field, meta] = useField(name);
  const error = meta.touched ? meta.error : undefined;
  return (
    <FieldShell id={name} label={label} hint={hint} error={error}>
      <select id={name} className={inputClass} aria-invalid={Boolean(error)} {...field} value={field.value ?? ""} {...props}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({ name, label }: { name: string; label: string }) {
  const [field] = useField({ name, type: "checkbox" });
  return (
    <label className="flex items-center gap-2.5 text-[0.95rem] text-ink">
      <input type="checkbox" className="size-4 accent-sea" {...field} />
      {label}
    </label>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const styles = tone === "error" ? "bg-danger-mist text-danger" : "bg-leaf-mist text-leaf";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}
