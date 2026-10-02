import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { ContactList } from "@/components/site/contact-list";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = { title: "Contact us" };

const ContactPage = async ({ searchParams }: { searchParams: Promise<{ subject?: string }> }) => {
  const { subject } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us"
        lead="Partnering on a drive, volunteering, or asking about a donation? Send a message and a volunteer will reply."
      />
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-14 md:grid-cols-[1.5fr_1fr]">
        <ContactForm defaultSubject={subject?.slice(0, 100)} />
        <aside className="md:pt-1">
          <div className="rounded-3xl bg-sky p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Other ways to reach us</h2>
            <ContactList className="mt-4" />
          </div>
        </aside>
      </div>
    </>
  );
};

export default ContactPage;
