import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getFeaturedCampaign } from "@/lib/queries";

export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const campaign = await getFeaturedCampaign();
  const donateHref = campaign ? `/campaigns/${campaign.slug}` : "/transparency";
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <SiteHeader donateHref={donateHref} />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
