import type { ReactNode } from "react";

/** Small label above a heading, marked with a mint dot from the logo. */
export const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`inline-flex items-center gap-2 text-sm font-semibold text-sea ${className}`}>
    <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-mint ring-4 ring-mint/25" />
    {children}
  </p>
);
