export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description ? <p className="mt-1.5 text-ink-soft">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
