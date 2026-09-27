import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "About us" };

// TODO: replace with your real story, officers, and photos.
const values = [
  { title: "Show up", body: "We'd rather do one drive well than announce ten. Every project has names and dates attached." },
  { title: "Show the receipts", body: "Money in and money out are published. If we can't account for it, we don't ask for it." },
  { title: "Ask the community first", body: "Schools and barangays tell us what they need. We don't guess." },
];

const officers = [
  { name: "Lorem Ipsum", role: "President" },
  { name: "Dolor Sit Amet", role: "Treasurer" },
  { name: "Consectetur Elit", role: "Secretary" },
  { name: "Adipiscing Sed", role: "Projects lead" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="A few friends from one city, then a few dozen"
        lead={`${site.name} started in ${site.city}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`}
      />
      <div className="mx-auto max-w-6xl px-5 py-16">
        <section className="grid gap-10 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title}>
              <div className="h-1 w-12 rounded-full bg-sea" />
              <h2 className="mt-5 text-2xl font-semibold">{v.title}</h2>
              <p className="mt-2 text-ink-soft">{v.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-24">
          <h2 className="text-3xl font-semibold">Officers</h2>
          <p className="mt-3 max-w-prose text-ink-soft">The people accountable for our projects and funds this year.</p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {officers.map((o, i) => (
              <li key={i} className="rounded-xl bg-sky p-5">
                <p className="font-display text-lg font-semibold">{o.name}</p>
                <p className="text-ink-soft">{o.role}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24 flex flex-col items-start gap-6 border-t border-line pt-12 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-3xl font-semibold">Want to help with the next one?</h2>
          <ButtonLink href="/contact?subject=Volunteering" size="lg">
            Volunteer with us
          </ButtonLink>
        </section>
      </div>
    </>
  );
}
