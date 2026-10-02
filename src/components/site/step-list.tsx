export type Step = { title: string; body: string };

/** Numbered steps joined by a thin line, each number on a sun disc. */
export const StepList = ({ steps, className = "" }: { steps: readonly Step[]; className?: string }) => (
  <ol className={className}>
    {steps.map(({ title, body }, index) => (
      <li key={title} className="group relative grid grid-cols-[2.5rem_1fr] gap-3 pb-6 last:pb-0">
        <span aria-hidden="true" className="absolute bottom-0 left-[1.125rem] top-10 w-px bg-line group-last:hidden" />
        <span className="relative flex size-9 items-center justify-center rounded-full bg-sun font-display font-semibold text-ink ring-1 ring-inset ring-sun-deep">
          {index + 1}
        </span>
        <div className="pt-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-0.5 text-ink-soft">{body}</p>
        </div>
      </li>
    ))}
  </ol>
);
