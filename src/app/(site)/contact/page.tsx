import type { Metadata } from "next";
import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon, Facebook01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { PageHeader } from "@/components/site/page-header";
import { ContactForm } from "@/components/forms/contact-form";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Contact us" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  return (
    <>
      <PageHeader
        title="Talk to us"
        lead="Partnering on a drive, volunteering, or asking about a donation? Send a message and a volunteer will reply."
      />
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-14 md:grid-cols-[1.5fr_1fr]">
        <ContactForm defaultSubject={subject?.slice(0, 100)} />
        <aside className="space-y-6">
          <h2 className="text-xl font-semibold">Other ways to reach us</h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={Mail01Icon} size={20} className="text-sea" />
              <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
            </li>
            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={Call02Icon} size={20} className="text-sea" />
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:underline">{site.phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={Facebook01Icon} size={20} className="text-sea" />
              <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">Message us on Facebook</a>
            </li>
          </ul>
        </aside>
      </div>
    </>
  );
}
