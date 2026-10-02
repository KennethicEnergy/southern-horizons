import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { actionIcons } from "@/config/icons";

export const metadata: Metadata = { title: "FAQs" };

// TODO: review every answer with your officers before launch.
const faqs = [
  {
    q: "How do I know my donation was received?",
    a: "After you pay, enter your reference number on the campaign page. Our treasurer matches it against our bank records, usually within a few days. Confirmed donations are counted on the campaign's progress bar and the transparency page.",
  },
  {
    q: "Which apps can I use to pay?",
    a: "Any bank or e-wallet app that can scan QR Ph codes, including GCash, Maya, and most bank apps.",
  },
  {
    q: "Can I donate items instead of money?",
    a: "Yes. Send us a message through the contact page and we'll arrange a drop-off.",
  },
  {
    q: "Can I give anonymously?",
    a: "Yes. Tick “Give anonymously” on the donation form and your name won't appear anywhere on the site.",
  },
  {
    q: "What happens if a campaign raises more than its goal?",
    a: "Extra funds roll into the next campaign or buy more supplies for the same school. Either way it's posted on the transparency page.",
  },
  {
    q: "How can I volunteer?",
    a: "Use the contact form and tell us your availability and what you're good at. We need packers, photographers, drivers, and teachers.",
  },
];

const FaqsPage = () => (
  <>
    <PageHeader eyebrow="FAQs" title="Questions people ask us" />
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="space-y-3">
        {faqs.map(({ q, a }) => (
          <details key={q} className="group rounded-2xl bg-white ring-1 ring-line transition-shadow duration-300 open:shadow-soft">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 font-display text-lg font-semibold sm:text-xl [&::-webkit-details-marker]:hidden">
              {q}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sea-mist text-sea transition-transform duration-300 ease-out-soft group-open:rotate-45">
                <Icon icon={actionIcons.add} size={18} />
              </span>
            </summary>
            <p className="max-w-prose px-5 pb-5 text-lg text-ink-soft">{a}</p>
          </details>
        ))}
      </div>
      <div className="mt-12 flex flex-col items-start gap-4 rounded-3xl bg-sky p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <p className="text-lg font-semibold">Still wondering about something?</p>
        <ButtonLink href="/contact" icon={actionIcons.email} className="w-full sm:w-auto">
          Ask us directly
        </ButtonLink>
      </div>
    </div>
  </>
);

export default FaqsPage;
