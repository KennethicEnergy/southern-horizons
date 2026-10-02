import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { StepList } from "@/components/site/step-list";
import { ApplicationForm } from "@/components/forms/application-form";
import { TextLink } from "@/components/ui/text-link";

export const metadata: Metadata = { title: "Become a member" };

const steps = [
  { title: "Apply", body: "Tell us who you are and how you'd like to help." },
  { title: "We review it", body: "The President reads every application, usually within a week." },
  { title: "Sign in with Google", body: "Once approved, choose Continue with Google on the sign-in page." },
];

const JoinPage = () => (
  <>
    <PageHeader
      eyebrow="Membership"
      title="Become a member"
      lead="Members write our stories, run drives, and keep the donation ledger honest. Apply below and the President will get back to you."
    />
    <div className="mx-auto grid max-w-6xl gap-14 px-5 py-14 md:grid-cols-[1.5fr_1fr]">
      <ApplicationForm />
      <aside className="md:pt-1">
        <div className="rounded-3xl bg-sky p-6 sm:p-7">
          <h2 className="text-xl font-semibold">How it works</h2>
          <StepList steps={steps} className="mt-6" />
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-x-2 text-ink-soft">
          Already approved? <TextLink href="/login">Sign in</TextLink>
        </p>
      </aside>
    </div>
  </>
);

export default JoinPage;
