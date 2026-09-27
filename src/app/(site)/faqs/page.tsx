import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";

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

export default function FaqsPage() {
  return (
    <>
      <PageHeader title="Questions people ask us" />
      <div className="mx-auto max-w-3xl px-5 py-14">
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl font-semibold">
                {f.q}
                <span aria-hidden="true" className="text-2xl font-normal text-sea transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-prose text-lg text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
