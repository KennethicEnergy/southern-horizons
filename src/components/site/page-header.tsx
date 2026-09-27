export function PageHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-14 md:pt-20">
        <h1 className="max-w-3xl text-4xl font-semibold md:text-6xl">{title}</h1>
        {lead ? <p className="mt-5 max-w-2xl text-lg text-ink-soft">{lead}</p> : null}
      </div>
    </header>
  );
}
