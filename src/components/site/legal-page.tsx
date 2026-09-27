import { PageHeader } from "./page-header";

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <>
      <PageHeader title={title} lead={`Last updated ${updated}`} />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-10 max-w-[68ch] rounded-lg bg-marigold-mist px-4 py-3 text-[0.95rem] text-ink">
          Draft template. Have a lawyer review this page before launch.
        </div>
        <div className="article space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-2xl font-semibold">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-3">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
