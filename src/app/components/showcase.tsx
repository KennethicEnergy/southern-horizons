import type { ReactNode } from "react";

type SectionProps = { id: string; title: string; source: string; description?: ReactNode; children: ReactNode };

export const Section = ({ id, title, source, description, children }: SectionProps) => (
  <section id={id} className="scroll-mt-24 border-t border-line pt-10">
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <code className="break-all text-sm text-ink-soft">{source}</code>
    </div>
    {description ? <p className="mt-2 max-w-2xl text-ink-soft">{description}</p> : null}
    <div className="mt-6 space-y-6">{children}</div>
  </section>
);

type SpecimenProps = {
  label: string;
  className?: string;
  /** Drop the inner padding for full-width components like headers and footers. */
  bleed?: boolean;
  children: ReactNode;
};

/** One labelled state of a component. Clips with overflow-clip so scroll-driven motion inside still follows the page. */
export const Specimen = ({ label, className = "", bleed = false, children }: SpecimenProps) => (
  <figure className="min-w-0">
    <figcaption className="mb-2 text-sm font-medium text-ink-soft">{label}</figcaption>
    <div className={`overflow-clip rounded-2xl border border-line bg-white ${bleed ? "" : "p-5"} ${className}`}>{children}</div>
  </figure>
);
