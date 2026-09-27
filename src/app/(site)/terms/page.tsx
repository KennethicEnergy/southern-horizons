import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      updated="[date]"
      sections={[
        {
          heading: "Using this site",
          body: [`By using this site you agree to these terms. ${site.name} may update them; changes take effect when posted here.`],
        },
        {
          heading: "Donations",
          body: [
            "Donations are voluntary and go to the campaign you select. If a campaign exceeds its goal or can't proceed, funds go to a similar program, and we post this on the transparency page.",
            "Refunds for mistaken payments are handled case by case. Contact us within [number] days with your reference number.",
            "[State whether donations are tax-deductible and whether official receipts are issued.]",
          ],
        },
        {
          heading: "Content",
          body: [
            "Photos, videos, and posts on this site belong to their creators and to us. You may share links to them. Ask us before reusing them elsewhere.",
          ],
        },
        {
          heading: "Liability",
          body: ["We work to keep information accurate but can't guarantee it's always complete or current."],
        },
        {
          heading: "Contact",
          body: [`Questions about these terms: ${site.email}.`],
        },
      ]}
    />
  );
}
