import type { ReactNode } from "react";
import { Eyebrow } from "./eyebrow";

type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  lead?: string;
  /** Usually a TextLink to the full list. Sits beside the title on wide screens, under it on phones. */
  action?: ReactNode;
  className?: string;
};

export const SectionHeading = ({ title, eyebrow, lead, action, className = "" }: SectionHeadingProps) => (
  <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
    <div className="max-w-2xl">
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
      {lead ? <p className="mt-3 text-lg text-ink-soft">{lead}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
