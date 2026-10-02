import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, FavouriteIcon } from "@hugeicons/core-free-icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-fields";
import { HorizonMark } from "@/components/site/horizon-mark";
import { PageHeader } from "@/components/site/page-header";
import { PostCard } from "@/components/site/post-card";
import { ProgressHorizon } from "@/components/site/progress-horizon";
import { AttachmentList } from "@/components/site/attachment-list";
import { LegalPage } from "@/components/site/legal-page";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusBadge } from "@/components/admin/status-badge";
import { MediaThumb } from "@/components/admin/media-thumb";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FormFieldsDemo } from "./form-fields-demo";
import { Section, Specimen } from "./showcase";
import { documents, images, posts, video } from "./samples";

export const metadata: Metadata = {
  title: "Components",
  robots: { index: false, follow: false },
};

// Sample event dates are relative to today; re-render daily so the phases stay true.
export const revalidate = 86400;

const sections = [
  { id: "brand", title: "Brand" },
  { id: "button", title: "Button" },
  { id: "button-link", title: "ButtonLink" },
  { id: "form-fields", title: "Form fields" },
  { id: "form-alert", title: "FormAlert" },
  { id: "status-badge", title: "StatusBadge" },
  { id: "progress-horizon", title: "ProgressHorizon" },
  { id: "post-card", title: "PostCard" },
  { id: "attachment-list", title: "AttachmentList" },
  { id: "media-thumb", title: "MediaThumb" },
  { id: "page-header", title: "PageHeader" },
  { id: "admin-page-header", title: "AdminPageHeader" },
  { id: "site-header", title: "SiteHeader" },
  { id: "site-footer", title: "SiteFooter" },
  { id: "legal-page", title: "LegalPage" },
];

// Literal class names so Tailwind generates them.
const colors = [
  { name: "ink", className: "bg-ink", hex: "#023d54" },
  { name: "ink-soft", className: "bg-ink-soft", hex: "#4a6671" },
  { name: "sea", className: "bg-sea", hex: "#0c6980" },
  { name: "sea-mist", className: "bg-sea-mist", hex: "#d4eaef" },
  { name: "sky", className: "bg-sky", hex: "#eff7f8" },
  { name: "sun", className: "bg-sun", hex: "#fdfd68" },
  { name: "sun-deep", className: "bg-sun-deep", hex: "#ecea3f" },
  { name: "sun-ink", className: "bg-sun-ink", hex: "#5c5800" },
  { name: "sun-mist", className: "bg-sun-mist", hex: "#fefed8" },
  { name: "mint", className: "bg-mint", hex: "#94dfa7" },
  { name: "leaf", className: "bg-leaf", hex: "#1f7446" },
  { name: "leaf-mist", className: "bg-leaf-mist", hex: "#e1f6e7" },
  { name: "danger", className: "bg-danger", hex: "#b3261e" },
  { name: "danger-mist", className: "bg-danger-mist", hex: "#fbe4e2" },
  { name: "line", className: "bg-line", hex: "#d3e1e5" },
];

const variants = ["primary", "give", "outline", "ghost", "danger"] as const;
const sizes = ["sm", "md", "lg"] as const;
const statuses = ["draft", "in_review", "published", "archived", "pending", "confirmed", "rejected"];

export default function ComponentsPage() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <HorizonMark />
            <span className="font-display text-lg font-semibold tracking-tight">Components</span>
          </Link>
          <p className="hidden text-sm text-ink-soft sm:block">Shared building blocks and their states</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <nav aria-label="Components" className="lg:sticky lg:top-8 lg:self-start">
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm lg:flex-col">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-ink-soft hover:text-ink">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 space-y-14">
          <Section id="brand" title="Brand" source="components/site/horizon-mark.tsx · app/globals.css">
            <Specimen label="HorizonMark — sizes">
              <div className="flex flex-wrap items-end gap-6">
                <HorizonMark className="size-6" />
                <HorizonMark />
                <HorizonMark className="size-14" />
                <HorizonMark className="size-24" />
              </div>
            </Specimen>
            <Specimen label="HorizonMark — on ink" className="bg-ink!">
              <div className="flex items-center gap-2.5 text-white">
                <HorizonMark />
                <span className="font-display text-lg font-semibold">Southern Horizons</span>
              </div>
            </Specimen>
            <Specimen label="Color tokens">
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {colors.map((c) => (
                  <li key={c.name}>
                    <div className={`h-14 rounded-lg ring-1 ring-inset ring-ink/10 ${c.className}`} />
                    <p className="mt-1.5 text-sm font-medium">{c.name}</p>
                    <p className="text-xs tabular-nums text-ink-soft">{c.hex}</p>
                  </li>
                ))}
              </ul>
            </Specimen>
          </Section>

          <Section
            id="button"
            title="Button"
            source="components/ui/button.tsx"
            description={
              <>
                Five variants in three sizes. <code>give</code> is reserved for donating. Hover a button to see its
                hover state.
              </>
            }
          >
            <Specimen label="Variants × sizes">
              <div className="space-y-4">
                {sizes.map((size) => (
                  <div key={size} className="flex flex-wrap items-center gap-3">
                    <span className="w-8 text-sm text-ink-soft">{size}</span>
                    {variants.map((variant) => (
                      <Button key={variant} variant={variant} size={size}>
                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </Specimen>
            <Specimen label="Disabled">
              <div className="flex flex-wrap items-center gap-3">
                {variants.map((variant) => (
                  <Button key={variant} variant={variant} disabled>
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </Button>
                ))}
              </div>
            </Specimen>
            <Specimen label="With icon / full width">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button>
                    <HugeiconsIcon icon={Add01Icon} size={18} />
                    New post
                  </Button>
                  <Button variant="give">
                    <HugeiconsIcon icon={FavouriteIcon} size={18} />
                    Donate
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Add">
                    <HugeiconsIcon icon={Add01Icon} size={16} />
                  </Button>
                </div>
                <Button variant="give" size="lg" className="w-full">
                  Donate to this campaign
                </Button>
              </div>
            </Specimen>
          </Section>

          <Section
            id="button-link"
            title="ButtonLink"
            source="components/ui/button.tsx"
            description="Same variants and sizes as Button, rendered as a Next.js Link. Use buttonClass() to style anything else like a button."
          >
            <Specimen label="Variants">
              <div className="flex flex-wrap items-center gap-3">
                {variants.map((variant) => (
                  <ButtonLink key={variant} href="#button-link" variant={variant}>
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </ButtonLink>
                ))}
              </div>
            </Specimen>
          </Section>

          <Section
            id="form-fields"
            title="Form fields"
            source="components/ui/form-fields.tsx"
            description="TextField, TextArea, SelectField and CheckboxField. They read from Formik, so they must sit inside a <Formik> form. Errors show only after a field is touched."
          >
            <FormFieldsDemo />
          </Section>

          <Section id="form-alert" title="FormAlert" source="components/ui/form-fields.tsx">
            <div className="grid gap-6 md:grid-cols-2">
              <Specimen label="tone=&quot;error&quot;">
                <FormAlert tone="error">We couldn&apos;t send your message. Please try again.</FormAlert>
              </Specimen>
              <Specimen label="tone=&quot;success&quot;">
                <FormAlert tone="success">Thanks! We&apos;ll check your reference number within a few days.</FormAlert>
              </Specimen>
            </div>
          </Section>

          <Section id="status-badge" title="StatusBadge" source="components/admin/status-badge.tsx">
            <Specimen label="Post statuses / donation statuses / unknown value">
              <div className="flex flex-wrap items-center gap-2">
                {statuses.map((s) => (
                  <StatusBadge key={s} status={s} />
                ))}
                <StatusBadge status="unknown_status" />
              </div>
            </Specimen>
          </Section>

          <Section
            id="progress-horizon"
            title="ProgressHorizon"
            source="components/site/progress-horizon.tsx"
            description="Caps at 100% when a campaign goes over its goal; shows 0% when the goal is 0."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Specimen label="Not started">
                <ProgressHorizon given={0} goal={120} unit="bags" />
              </Specimen>
              <Specimen label="In progress">
                <ProgressHorizon given={46_500} goal={150_000} unit="pesos" />
              </Specimen>
              <Specimen label="Goal reached">
                <ProgressHorizon given={120} goal={120} unit="bags" />
              </Specimen>
              <Specimen label="Over goal">
                <ProgressHorizon given={172_300} goal={150_000} unit="pesos" />
              </Specimen>
            </div>
          </Section>

          <Section
            id="post-card"
            title="PostCard"
            source="components/site/post-card.tsx"
            description="Events show their phase (computed from dates) instead of the publish date, plus date and location."
          >
            <div className="grid gap-6 md:grid-cols-3">
              <Specimen label="News, with cover">
                <PostCard post={posts.news} />
              </Specimen>
              <Specimen label="Story, no cover">
                <PostCard post={posts.noCover} />
              </Specimen>
              <Specimen label="Event — upcoming">
                <PostCard post={posts.upcoming} />
              </Specimen>
              <Specimen label="Event — happening now">
                <PostCard post={posts.ongoing} />
              </Specimen>
              <Specimen label="Event — past, no cover">
                <PostCard post={posts.past} />
              </Specimen>
            </div>
            <Specimen label="featured">
              <PostCard post={posts.news} featured />
            </Specimen>
          </Section>

          <Section
            id="attachment-list"
            title="AttachmentList"
            source="components/site/attachment-list.tsx"
            description="Groups attachments into an image grid, video players and a document list. Renders nothing when empty."
          >
            <Specimen label="Images">
              <AttachmentList items={[images.dawn, images.field, images.dusk]} />
            </Specimen>
            <Specimen label="Documents (PDF and Word)">
              <AttachmentList items={[documents.pdf, documents.docx]} />
            </Specimen>
            <Specimen label="Empty">
              <AttachmentList items={[]} />
              <p className="text-sm text-ink-soft">(renders nothing)</p>
            </Specimen>
          </Section>

          <Section id="media-thumb" title="MediaThumb" source="components/admin/media-thumb.tsx">
            <Specimen label="Image / video / PDF / Word — default and size-24">
              <div className="flex flex-wrap items-end gap-4">
                <MediaThumb media={images.dawn} />
                <MediaThumb media={video} />
                <MediaThumb media={documents.pdf} />
                <MediaThumb media={documents.docx} />
                <MediaThumb media={images.field} className="size-24" />
              </div>
            </Specimen>
          </Section>

          <Section id="page-header" title="PageHeader" source="components/site/page-header.tsx">
            <Specimen label="Title only" bleed>
              <PageHeader title="Questions people ask us" />
            </Specimen>
            <Specimen label="With lead" bleed>
              <PageHeader
                title="News & events"
                lead="Drives, clean-ups, and updates from the field, with receipts for every one."
              />
            </Specimen>
          </Section>

          <Section id="admin-page-header" title="AdminPageHeader" source="components/admin/admin-page-header.tsx">
            <Specimen label="Title only" className="[&>div]:mb-0">
              <AdminPageHeader title="Media" />
            </Specimen>
            <Specimen label="With description and actions" className="[&>div]:mb-0">
              <AdminPageHeader
                title="Posts"
                description="News, events, and stories on the public site."
                actions={
                  <Button>
                    <HugeiconsIcon icon={Add01Icon} size={18} />
                    New post
                  </Button>
                }
              />
            </Specimen>
          </Section>

          <Section
            id="site-header"
            title="SiteHeader"
            source="components/site/site-header.tsx"
            description="The active link follows the current URL, so none is highlighted here. Narrow the window below 768px to see the menu button."
          >
            <Specimen label="Default" bleed>
              <SiteHeader donateHref="#site-header" />
            </Specimen>
          </Section>

          <Section id="site-footer" title="SiteFooter" source="components/site/site-footer.tsx">
            <Specimen label="Default" bleed className="[&>footer]:mt-0">
              <SiteFooter />
            </Specimen>
          </Section>

          <Section
            id="legal-page"
            title="LegalPage"
            source="components/site/legal-page.tsx"
            description="Page template for the privacy policy and terms."
          >
            <Specimen label="One section" bleed>
              <LegalPage
                title="Privacy policy"
                updated="October 3, 2026"
                sections={[
                  {
                    heading: "What we collect",
                    body: [
                      "When you donate, we collect your name (unless you give anonymously), your email, and your payment reference number.",
                    ],
                  },
                ]}
              />
            </Specimen>
          </Section>
        </main>
      </div>
    </>
  );
}
