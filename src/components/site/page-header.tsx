import { BrandOrbs } from "./brand-orbs";
import { Eyebrow } from "./eyebrow";

type PageHeaderProps = { title: string; lead?: string; eyebrow?: string };

/**
 * Top of an inner page: a morning-sky wash. On large screens the logo circles drift beside the title;
 * the text column is capped there so the two never overlap.
 */
export const PageHeader = ({ title, lead, eyebrow }: PageHeaderProps) => (
  <header className="bg-horizon relative overflow-clip border-b border-line">
    <BrandOrbs className="absolute right-[4%] top-1/2 hidden w-72 -translate-y-1/2 lg:block" />
    <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-12 md:pb-16 md:pt-20">
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <h1 className="max-w-3xl text-4xl font-semibold md:text-6xl lg:max-w-2xl">{title}</h1>
      {lead ? <p className="mt-5 max-w-2xl text-lg text-ink-soft lg:max-w-xl">{lead}</p> : null}
    </div>
  </header>
);
