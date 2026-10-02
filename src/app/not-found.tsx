import { BrandOrbs } from "@/components/site/brand-orbs";
import { ButtonLink } from "@/components/ui/button";
import { actionIcons } from "@/config/icons";

const NotFound = () => (
  <div className="bg-horizon flex min-h-dvh flex-col items-center justify-center px-5 text-center">
    <BrandOrbs className="w-40" />
    <h1 className="mt-8 text-4xl font-semibold">This page doesn&apos;t exist</h1>
    <p className="mt-3 text-ink-soft">It may have been moved or unpublished.</p>
    <ButtonLink href="/" icon={actionIcons.home} className="mt-8">
      Go to the home page
    </ButtonLink>
  </div>
);

export default NotFound;
