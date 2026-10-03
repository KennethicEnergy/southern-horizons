import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { TextLink } from "@/components/ui/text-link";
import { FormAlert } from "@/components/ui/form-fields";
import { BrandOrbs } from "@/components/site/brand-orbs";
import { ContactList } from "@/components/site/contact-list";
import { Eyebrow } from "@/components/site/eyebrow";
import { HorizonMark } from "@/components/site/horizon-mark";
import { PageHeader } from "@/components/site/page-header";
import { PostCard } from "@/components/site/post-card";
import { ProgressHorizon } from "@/components/site/progress-horizon";
import { SectionHeading } from "@/components/site/section-heading";
import { StatGrid } from "@/components/site/stat-grid";
import { StepList } from "@/components/site/step-list";
import { AttachmentList } from "@/components/site/attachment-list";
import { LegalPage } from "@/components/site/legal-page";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusBadge } from "@/components/admin/status-badge";
import { MediaThumb } from "@/components/admin/media-thumb";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { actionIcons } from "@/config/icons";
import { FormFieldsDemo } from "./form-fields-demo";
import { ToastDemo } from "./toast-demo";
import { RoleSelectDemo } from "./role-select-demo";
import { Section, Specimen } from "./showcase";
import { avatarPhoto, documents, images, posts, video } from "./samples";

export const metadata: Metadata = {
  title: "Components",
  robots: { index: false, follow: false },
};

// Sample event dates are relative to today; re-render daily so the phases stay true.
export const revalidate = 86400;

const sections = [
  { id: "brand", title: "Brand" },
  { id: "icons", title: "Icons" },
  { id: "button", title: "Button" },
  { id: "icon-button", title: "IconButton" },
  { id: "button-link", title: "ButtonLink" },
  { id: "text-link", title: "TextLink" },
  { id: "avatar", title: "Avatar" },
  { id: "toast", title: "Toast" },
  { id: "motion", title: "Motion" },
  { id: "form-fields", title: "Form fields" },
  { id: "form-alert", title: "FormAlert" },
  { id: "status-badge", title: "StatusBadge" },
  { id: "role-select", title: "RoleSelect" },
  { id: "section-heading", title: "SectionHeading" },
  { id: "step-list", title: "StepList" },
  { id: "stat-grid", title: "StatGrid" },
  { id: "contact-list", title: "ContactList" },
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

const surfaces = [
  { name: "shadow-soft", className: "bg-white shadow-soft" },
  { name: "shadow-lift", className: "bg-white shadow-lift" },
  { name: "bg-horizon", className: "bg-horizon ring-1 ring-inset ring-ink/10" },
  { name: "bg-tide", className: "bg-tide" },
  { name: "bg-brand-stripe", className: "bg-brand-stripe" },
];

const variantLabels: Record<ButtonVariant, string> = {
  primary: "Primary",
  give: "Give",
  outline: "Outline",
  ghost: "Ghost",
  danger: "Danger",
};
const variants = Object.keys(variantLabels) as ButtonVariant[];
const sizes: ButtonSize[] = ["sm", "md", "lg"];
const statuses = ["draft", "in_review", "published", "archived", "pending", "confirmed", "rejected"];

const sampleSteps = [
  { title: "Pick what to give", body: "Choose an item, like one school bag, and how many." },
  { title: "Scan and pay", body: "Use any bank or e-wallet app that supports QR Ph." },
  { title: "See it on the ledger", body: "Our treasurer confirms it and it appears on the transparency page." },
];

const ComponentsPage = () => (
  <>
    <header className="header-elevate sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <HorizonMark />
          <span className="font-display text-lg font-semibold tracking-tight">Components</span>
        </Link>
        <p className="hidden text-sm text-ink-soft sm:block">Shared building blocks and their states</p>
      </div>
    </header>

    {/* grid-cols-1 (minmax(0,1fr)) stops the sideways-scrolling nav row from stretching the page on phones. */}
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-10 lg:grid-cols-[11rem_minmax(0,1fr)]">
      <nav aria-label="Components" className="lg:sticky lg:top-24 lg:self-start">
        {/* Phones: one sideways-scrolling row. Desktop: a sticky column. */}
        <ul className="-mx-5 flex gap-x-4 gap-y-1.5 overflow-x-auto px-5 pb-2 text-sm [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {sections.map(({ id, title }) => (
            <li key={id} className="shrink-0">
              <a href={`#${id}`} className="text-ink-soft transition-colors hover:text-ink">
                {title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="min-w-0 space-y-14">
        <Section id="brand" title="Brand" source="components/site/horizon-mark.tsx · components/site/brand-orbs.tsx · app/globals.css">
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
              {colors.map(({ name, className, hex }) => (
                <li key={name}>
                  <div className={`h-14 rounded-xl ring-1 ring-inset ring-ink/10 ${className}`} />
                  <p className="mt-1.5 text-sm font-medium">{name}</p>
                  <p className="text-xs tabular-nums text-ink-soft">{hex}</p>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen label="Shadows and surfaces" className="bg-sky!">
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
              {surfaces.map(({ name, className }) => (
                <li key={name}>
                  <div className={`h-16 rounded-2xl ${className}`} />
                  <p className="mt-2 text-sm font-medium">{name}</p>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen label="Text marker: highlight-sun">
            <p className="text-3xl font-semibold">
              Rising Together, <span className="highlight-sun">Giving Back</span> With Purpose.
            </p>
          </Specimen>
        </Section>

        <Section
          id="icons"
          title="Icons"
          source="config/icons.ts · components/ui/icon.tsx"
          description="One icon per action, used everywhere, so people on phones can read an action from its icon. Pick from actionIcons rather than importing a new Hugeicon for an existing action. Icon is decorative: always pair it with a visible label or an aria-label."
        >
          <Specimen label="actionIcons">
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
              {Object.entries(actionIcons).map(([name, icon]) => (
                <li key={name} className="flex flex-col items-center gap-2 rounded-xl bg-sky px-2 py-3 text-center">
                  <Icon icon={icon} size={24} className="text-sea" />
                  <code className="text-xs text-ink-soft">{name}</code>
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
              Five variants in three sizes, with optional <code>icon</code> and <code>iconEnd</code>. <code>give</code> is reserved
              for donating. Buttons press in slightly when tapped.
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
                      {variantLabels[variant]}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen label="With icons">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="give" icon={actionIcons.donate}>
                Donate
              </Button>
              <Button icon={actionIcons.send}>Send message</Button>
              <Button variant="outline" icon={actionIcons.save}>
                Save draft
              </Button>
              <Button variant="outline" iconEnd={actionIcons.next}>
                Older
              </Button>
              <Button variant="danger" icon={actionIcons.delete}>
                Delete
              </Button>
            </div>
          </Specimen>
          <Specimen label="Disabled">
            <div className="flex flex-wrap items-center gap-3">
              {variants.map((variant) => (
                <Button key={variant} variant={variant} disabled>
                  {variantLabels[variant]}
                </Button>
              ))}
            </div>
          </Specimen>
          <Specimen label="Full width (mobile-first primary action)">
            <Button variant="give" size="lg" icon={actionIcons.donate} className="w-full">
              Donate to this campaign
            </Button>
          </Specimen>
        </Section>

        <Section
          id="icon-button"
          title="IconButton"
          source="components/ui/icon-button.tsx"
          description="Icon-only, for tight spots like the mobile header and toasts. label is required: it becomes the aria-label and the desktop tooltip."
        >
          <Specimen label="Variants × sizes">
            <div className="space-y-4">
              {sizes.map((size) => (
                <div key={size} className="flex flex-wrap items-center gap-3">
                  <span className="w-8 text-sm text-ink-soft">{size}</span>
                  <IconButton icon={actionIcons.menu} label="Open menu" size={size} />
                  <IconButton icon={actionIcons.edit} label="Edit" variant="outline" size={size} />
                  <IconButton icon={actionIcons.add} label="Add" variant="primary" size={size} />
                  <IconButton icon={actionIcons.donate} label="Donate" variant="give" size={size} />
                  <IconButton icon={actionIcons.delete} label="Delete" variant="danger" size={size} />
                </div>
              ))}
            </div>
          </Specimen>
        </Section>

        <Section
          id="button-link"
          title="ButtonLink"
          source="components/ui/button.tsx"
          description="Same variants, sizes, and icon props as Button, rendered as a Next.js Link. Use buttonClass() or iconButtonClass() to style anything else like a button."
        >
          <Specimen label="Variants">
            <div className="flex flex-wrap items-center gap-3">
              {variants.map((variant) => (
                <ButtonLink key={variant} href="#button-link" variant={variant}>
                  {variantLabels[variant]}
                </ButtonLink>
              ))}
              <ButtonLink href="#button-link" variant="outline" icon={actionIcons.ledger}>
                Open the ledger
              </ButtonLink>
            </div>
          </Specimen>
        </Section>

        <Section
          id="text-link"
          title="TextLink"
          source="components/ui/text-link.tsx"
          description="An inline link whose arrow says where it goes, and nudges that way on hover."
        >
          <Specimen label="forward (default) / back">
            <div className="flex flex-wrap items-center gap-8">
              <TextLink href="#text-link">All news and events</TextLink>
              <TextLink href="#text-link" direction="back">
                News & events
              </TextLink>
            </div>
          </Specimen>
        </Section>

        <Section
          id="avatar"
          title="Avatar"
          source="components/ui/avatar.tsx"
          description="The signed-in member's Google photo in the backoffice sidebar and the phone menu button. Password accounts, and photos that fail to load, fall back to initials; no name shows a person icon."
        >
          <Specimen label="Photo — sm / md / lg">
            <div className="flex items-end gap-4">
              <Avatar name="Maria Santos" src={avatarPhoto} size="sm" />
              <Avatar name="Maria Santos" src={avatarPhoto} />
              <Avatar name="Maria Santos" src={avatarPhoto} size="lg" />
            </div>
          </Specimen>
          <div className="grid gap-6 md:grid-cols-3">
            <Specimen label="No photo (password account)">
              <Avatar name="Juan dela Cruz" />
            </Specimen>
            <Specimen label="Photo fails to load">
              <Avatar name="Ana Reyes" src="https://invalid.example/avatar.jpg" />
            </Specimen>
            <Specimen label="No name">
              <Avatar />
            </Specimen>
          </div>
          <Specimen label="As the sidebar shows it">
            <div className="flex items-center gap-3">
              <Avatar name="Maria Santos" src={avatarPhoto} />
              <div className="min-w-0">
                <p className="truncate font-medium">Maria Santos</p>
                <p className="truncate text-sm text-ink-soft">President</p>
              </div>
            </div>
          </Specimen>
        </Section>

        <Section
          id="toast"
          title="Toast"
          source="components/ui/toaster.tsx · stores/toast-store.ts"
          description={
            <>
              Call <code>toast.success()</code>, <code>toast.error()</code> or <code>toast.info()</code> from any client component, or{" "}
              <code>toastResult(res)</code> with a server action&apos;s result. Toasts drop in at the top centre, newest first, three at
              most. Each one closes itself after 5 seconds (8 for errors), pauses while hovered or focused, and has a close button.
              Form validation errors stay inline instead.
            </>
          }
        >
          <ToastDemo />
        </Section>

        <Section
          id="motion"
          title="Motion"
          source="app/globals.css · components/site/brand-orbs.tsx"
          description={
            <>
              Scroll-driven, so it runs off the main thread. <code>.parallax-scope</code> + <code>.parallax</code> drift layers as a block
              scrolls past; <code>.reveal</code> fades a block up as it enters. Nothing moves when reduced motion is on or the browser
              lacks scroll timelines. Clip ancestors with <code>overflow-clip</code>, never <code>overflow-hidden</code>.
            </>
          }
        >
          <Specimen label="BrandOrbs — scroll the page to see each circle drift at its own depth" bleed>
            <div className="bg-horizon flex items-center justify-center px-5 py-10">
              <BrandOrbs className="w-64" />
            </div>
          </Specimen>
          <Specimen label=".reveal — fades up on entry">
            <div className="grid gap-4 sm:grid-cols-3">
              {["Show up", "Show the receipts", "Ask first"].map((title) => (
                <div key={title} className="reveal rounded-2xl bg-sky p-5 font-display text-lg font-semibold">
                  {title}
                </div>
              ))}
            </div>
          </Specimen>
        </Section>

        <Section
          id="form-fields"
          title="Form fields"
          source="components/ui/form-fields.tsx"
          description="TextField, TextArea, SelectField and CheckboxField. They read from Formik, so they must sit inside a <Formik> form. Errors show only after a field is touched. Every field is at least 44px tall for thumbs."
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
              {statuses.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
              <StatusBadge status="unknown_status" />
            </div>
          </Specimen>
        </Section>

        <Section
          id="role-select"
          title="RoleSelect"
          source="components/admin/role-select.tsx · components/ui/native-select.tsx"
          description="Both selects (this and SelectField) use NativeSelect: the browser's arrow is turned off and a chevron is drawn with room reserved on the right, so text never runs under it."
        >
          <RoleSelectDemo />
        </Section>

        <Section id="section-heading" title="SectionHeading" source="components/site/section-heading.tsx · components/site/eyebrow.tsx">
          <Specimen label="Eyebrow">
            <Eyebrow>Current campaign</Eyebrow>
          </Specimen>
          <Specimen label="Title only">
            <SectionHeading title="Coming up" />
          </Specimen>
          <Specimen label="Eyebrow, lead, and action">
            <SectionHeading
              eyebrow="Latest"
              title="From the field"
              lead="Drives, clean-ups, and updates, with receipts for every one."
              action={<TextLink href="#section-heading">All news and events</TextLink>}
            />
          </Specimen>
        </Section>

        <Section id="step-list" title="StepList" source="components/site/step-list.tsx" description="Used for How giving works and the Join page.">
          <Specimen label="Three steps">
            <StepList steps={sampleSteps} />
          </Specimen>
        </Section>

        <Section
          id="stat-grid"
          title="StatGrid"
          source="components/site/stat-grid.tsx"
          description="Two columns on phones; widen with a class like md:grid-cols-4. An odd last tile spans the row."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Specimen label="Two stats">
              <StatGrid
                stats={[
                  { label: "Received", value: "₱172,300.00" },
                  { label: "Spent on programs", value: "₱98,450.00" },
                ]}
              />
            </Specimen>
            <Specimen label="Three stats (last spans the row)">
              <StatGrid
                stats={[
                  { label: "Received", value: "₱172,300.00" },
                  { label: "Spent", value: "₱98,450.00" },
                  { label: "Confirmed donations", value: "214" },
                ]}
              />
            </Specimen>
          </div>
          <Specimen label="Four stats, className=&quot;md:grid-cols-4&quot;">
            <StatGrid
              className="md:grid-cols-4"
              stats={[
                { label: "Received", value: "₱172,300.00" },
                { label: "Spent", value: "₱98,450.00" },
                { label: "Balance on hand", value: "₱73,850.00" },
                { label: "Confirmed donations", value: "214" },
              ]}
            />
          </Specimen>
        </Section>

        <Section id="contact-list" title="ContactList" source="components/site/contact-list.tsx">
          <div className="grid gap-6 md:grid-cols-2">
            <Specimen label="tone=&quot;light&quot;">
              <ContactList />
            </Specimen>
            <Specimen label="tone=&quot;dark&quot;" className="bg-ink!">
              <ContactList tone="dark" />
            </Specimen>
          </div>
        </Section>

        <Section
          id="progress-horizon"
          title="ProgressHorizon"
          source="components/site/progress-horizon.tsx"
          description="Sea into mint, with the sun at the leading edge. Caps at 100% when a campaign goes over its goal; shows 0% when the goal is 0."
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
          description="Events show their phase (computed from dates) instead of the publish date, plus date and location. Posts without a cover get the logo circles on a morning-sky wash."
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

        <Section
          id="page-header"
          title="PageHeader"
          source="components/site/page-header.tsx"
          description="Morning-sky wash. On screens 1024px and wider, the logo circles drift beside the title."
        >
          <Specimen label="Title only" bleed>
            <PageHeader title="Questions people ask us" />
          </Specimen>
          <Specimen label="With eyebrow and lead" bleed>
            <PageHeader eyebrow="From the field" title="News & events" lead="Drives, clean-ups, and updates from the field, with receipts for every one." />
          </Specimen>
        </Section>

        <Section id="admin-page-header" title="AdminPageHeader" source="components/admin/admin-page-header.tsx">
          <Specimen label="Title only" className="[&>div]:mb-0">
            <AdminPageHeader title="Media" />
          </Specimen>
          <Specimen label="With back link, description and actions" className="[&>div]:mb-0">
            <AdminPageHeader
              title="Posts"
              back={{ href: "#admin-page-header", label: "Dashboard" }}
              description="News, events, and stories on the public site."
              actions={<Button icon={actionIcons.add}>New post</Button>}
            />
          </Specimen>
        </Section>

        <Section
          id="site-header"
          title="SiteHeader"
          source="components/site/site-header.tsx"
          description="The active link follows the current URL, so none is highlighted here. Below 768px, Donate stays in the bar beside the menu button, and the menu lists each page with its icon."
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

        <Section id="legal-page" title="LegalPage" source="components/site/legal-page.tsx" description="Page template for the privacy policy and terms.">
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

export default ComponentsPage;
