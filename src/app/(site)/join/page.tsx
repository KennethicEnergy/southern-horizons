import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { ApplicationForm } from "@/components/forms/application-form";

export const metadata: Metadata = { title: "Become a member" };

const steps = [
  { title: "Apply", body: "Tell us who you are and how you'd like to help." },
  { title: "We review it", body: "An admin reads every application, usually within a week." },
  { title: "Sign in with Google", body: "Once approved, choose Continue with Google on the sign-in page." },
];

export default function JoinPage() {
  return (
    <>
      <PageHeader
        title="Become a member"
        lead="Members write our stories, run drives, and keep the donation ledger honest. Apply below and an admin will get back to you."
      />
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-14 md:grid-cols-[1.5fr_1fr]">
        <ApplicationForm />
        <aside>
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="mt-6 space-y-6">
            {steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-sun font-display font-semibold text-ink">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-ink-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-ink-soft">
            Already approved?{" "}
            <Link href="/login" className="text-sea hover:underline">
              Sign in
            </Link>
          </p>
        </aside>
      </div>
    </>
  );
}
