import type { ReactNode } from "react";
import { TextLink } from "@/components/ui/text-link";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Link to the parent list, shown above the title, e.g. { href: "/admin/posts", label: "Posts" }. */
  back?: { href: string; label: string };
};

export const AdminPageHeader = ({ title, description, actions, back }: AdminPageHeaderProps) => (
  <div className="mb-8">
    {back ? (
      <TextLink href={back.href} direction="back" className="mb-3 text-sm">
        {back.label}
      </TextLink>
    ) : null}
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description ? <p className="mt-1.5 text-ink-soft">{description}</p> : null}
      </div>
      {actions}
    </div>
  </div>
);
