import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="[date]"
      sections={[
        {
          heading: "Who we are",
          body: [
            `${site.name} is a volunteer group based in ${site.city}. We handle personal information in line with the Data Privacy Act of 2012 (Republic Act No. 10173). Contact our data protection officer at ${site.email}.`,
          ],
        },
        {
          heading: "What we collect",
          body: [
            "Donors: your name (unless you give anonymously), optional email, the payment reference number, amount, and any message you send.",
            "Contact form: your name, email, and message.",
            "Volunteers with accounts: name, email, and a record of the changes you make on the site.",
          ],
        },
        {
          heading: "Children and beneficiaries",
          body: [
            "We photograph our programs only with written consent from a parent, guardian, or the school. We don't publish children's full names alongside their photos, and we remove any photo on request.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To confirm donations, publish anonymised totals on our transparency page, reply to messages, and keep an audit trail of changes to the site. We don't sell or share your information for marketing.",
          ],
        },
        {
          heading: "Where it's stored and for how long",
          body: [
            "Data is stored with our hosting and database providers, which may be outside the Philippines. Donation records are kept for [number] years for accounting purposes. Contact messages are deleted after [number] months.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You can ask to see, correct, or delete your information, or object to how we use it. Email us and we'll respond within [number] days. You can also file a complaint with the National Privacy Commission.",
          ],
        },
      ]}
    />
  );
}
