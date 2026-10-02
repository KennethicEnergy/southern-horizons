import Link from "next/link";

export function AdminPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Link to the parent list, shown above the title, e.g. { href: "/admin/posts", label: "Posts" }. */
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back ? (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm text-sea hover:underline">
          <span aria-hidden="true">←</span> {back.label}
        </Link>
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
}
