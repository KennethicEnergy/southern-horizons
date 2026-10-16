import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const revalidate = 300;

const SiteLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-4 focus:py-2">
      Skip to content
    </a>
    <SiteHeader />
    <main id="main">{children}</main>
    <SiteFooter />
  </>
);

export default SiteLayout;
