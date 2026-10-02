import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { actionIcons } from "@/config/icons";
import { site } from "@/config/site";
import { initials } from "@/lib/initials";

export const metadata: Metadata = { title: "About us" };

// TODO: replace with your real story, officers, and photos.
// Each value takes one logo color for its accent bar (literal class names so Tailwind generates them).
const values = [
  { title: "Show up", body: "We'd rather do one drive well than announce ten. Every project has names and dates attached.", accent: "bg-sea" },
  { title: "Show the receipts", body: "Money in and money out are published. If we can't account for it, we don't ask for it.", accent: "bg-mint" },
  { title: "Ask the community first", body: "Schools and barangays tell us what they need. We don't guess.", accent: "bg-sun" },
];

const officers = [
  { name: "Lorem Ipsum", role: "President" },
  { name: "Dolor Sit Amet", role: "Treasurer" },
  { name: "Consectetur Elit", role: "Secretary" },
  { name: "Adipiscing Sed", role: "Projects lead" },
];

const AboutPage = () => (
  <>
    <PageHeader
      eyebrow="About us"
      title="A few friends from one city, then a few dozen"
      lead={`${site.name} started in ${site.city}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`}
    />
    <div className="mx-auto max-w-6xl px-5 py-16">
      <section className="grid gap-5 md:grid-cols-3">
        {values.map(({ title, body, accent }) => (
          <div key={title} className="reveal rounded-3xl bg-white p-6 ring-1 ring-line">
            <div className={`h-1.5 w-12 rounded-full ${accent}`} />
            <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-ink-soft">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-24">
        <SectionHeading eyebrow="Officers" title="The people accountable this year" lead="For our projects and our funds." className="reveal" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {officers.map(({ name, role }) => (
            <li key={name} className="reveal flex items-center gap-4 rounded-2xl bg-sky p-5">
              <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sea font-display font-semibold text-white">
                {initials(name)}
              </span>
              <div>
                <p className="font-display text-lg font-semibold">{name}</p>
                <p className="text-ink-soft">{role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24 flex flex-col items-start gap-6 rounded-3xl bg-sky p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
        <h2 className="max-w-xl text-3xl font-semibold">Want to help with the next one?</h2>
        <ButtonLink href="/contact?subject=Volunteering" size="lg" icon={actionIcons.volunteer} className="w-full md:w-auto">
          Volunteer with us
        </ButtonLink>
      </section>
    </div>
  </>
);

export default AboutPage;
