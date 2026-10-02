import { Location01Icon } from "@hugeicons/core-free-icons";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TextLink } from "@/components/ui/text-link";
import { BrandOrbs } from "@/components/site/brand-orbs";
import { Eyebrow } from "@/components/site/eyebrow";
import { PostCard } from "@/components/site/post-card";
import { ProgressHorizon } from "@/components/site/progress-horizon";
import { SectionHeading } from "@/components/site/section-heading";
import { StatGrid } from "@/components/site/stat-grid";
import { StepList } from "@/components/site/step-list";
import { getFeaturedCampaign, getPublishedPosts, getTransparencyReport, getUpcomingEvents } from "@/lib/queries";
import { formatPeso } from "@/lib/money";
import { actionIcons } from "@/config/icons";
import { site } from "@/config/site";

export const revalidate = 300;

const givingSteps = [
  { title: "Pick what to give", body: "Choose an item, like one school bag, and how many." },
  { title: "Scan and pay", body: "Use any bank or e-wallet app that supports QR Ph." },
  { title: "Send your reference number", body: "Enter it on the campaign page so we can match your payment." },
  { title: "See it on the ledger", body: "Our treasurer confirms it and it appears on the transparency page." },
];

const HomePage = async () => {
  const [campaign, { posts }, upcoming, report] = await Promise.all([
    getFeaturedCampaign(),
    getPublishedPosts(),
    getUpcomingEvents(3),
    getTransparencyReport(),
  ]);

  const [lead, ...rest] = posts;
  const totals = report.reduce(
    (acc, { received, spent, donors }) => ({ received: acc.received + received, spent: acc.spent + spent, donors: acc.donors + donors }),
    { received: 0, spent: 0, donors: 0 },
  );
  const [item] = campaign?.items ?? [];
  const campaignHref = campaign ? `/campaigns/${campaign.slug}` : "/transparency";

  return (
    <>
      {/* Hero: the logo's circles rising from the horizon, each drifting at its own depth as you scroll. */}
      <section className="bg-horizon relative overflow-clip">
        <div className="mx-auto grid max-w-6xl items-end gap-6 px-5 pt-10 md:grid-cols-[1.2fr_1fr] md:gap-10 md:pt-20">
          <div className="pb-4 md:pb-24">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-sea-deep shadow-soft ring-1 ring-line backdrop-blur">
              <Icon icon={Location01Icon} size={16} className="text-sea" />
              Volunteers from {site.city}
            </p>
            <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.04] [text-wrap:pretty] sm:text-6xl md:text-7xl">
              Rising Together, <span className="highlight-sun">Giving Back</span> With Purpose.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              A Batangas-based volunteer group uplifting underserved communities through heart-led outreach, compassion, and unity.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href={campaignHref} variant="give" size="lg" icon={actionIcons.donate} className="w-full sm:w-auto">
                {campaign ? "Sponsor a learner" : "See where donations go"}
              </ButtonLink>
              <ButtonLink href="/news" variant="outline" size="lg" icon={actionIcons.read} className="w-full sm:w-auto">
                Read our updates
              </ButtonLink>
            </div>
          </div>
          <div className="animate-sunrise relative mx-auto -mb-[14%] w-full max-w-[22rem] md:max-w-none">
            <BrandOrbs />
          </div>
        </div>
        <div aria-hidden="true" className="horizon-line absolute inset-x-0 bottom-0" />
      </section>

      {/* Current campaign */}
      {campaign && item ? (
        <section className="bg-sky">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.2fr_1fr] md:items-center md:py-20">
            <div className="reveal">
              <Eyebrow>Current campaign</Eyebrow>
              <h2 className="mt-3 text-4xl font-semibold">{campaign.title}</h2>
              <p className="mt-4 max-w-prose text-lg text-ink-soft">{campaign.summary}</p>
              <div className="mt-8 max-w-lg">
                <ProgressHorizon given={item.given} goal={item.goalQuantity} unit={item.name.toLowerCase()} />
              </div>
            </div>
            <div className="reveal rounded-3xl bg-white p-6 shadow-lift ring-1 ring-line sm:p-8">
              <p className="font-display text-5xl font-semibold tracking-tight">{formatPeso(item.unitAmount)}</p>
              <p className="mt-1 text-lg">gives one {item.name.toLowerCase()}</p>
              {item.contents.length > 0 ? (
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.95rem] text-ink-soft">
                  {item.contents.map((content) => (
                    <li key={content} className="flex items-start gap-2">
                      <Icon icon={actionIcons.approve} size={16} className="mt-1 shrink-0 text-leaf" />
                      {content}
                    </li>
                  ))}
                </ul>
              ) : null}
              <ButtonLink href={campaignHref} variant="give" size="lg" icon={actionIcons.donate} className="mt-7 w-full">
                Give {formatPeso(item.unitAmount)}
              </ButtonLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* Latest */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          eyebrow="Latest"
          title="From the field"
          action={<TextLink href="/news">All news and events</TextLink>}
          className="reveal"
        />
        {lead ? (
          <div className="mt-10 space-y-14">
            <PostCard post={lead} featured />
            {rest.length > 0 ? (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {rest.slice(0, 6).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-8 text-ink-soft">Our first stories are on the way. Follow us on Facebook in the meantime.</p>
        )}
      </section>

      {/* Upcoming events */}
      {upcoming.length > 0 ? (
        <section className="border-y border-line bg-sky/60">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <SectionHeading eyebrow="Join us" title="Coming up" className="reveal" />
            <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Transparency + how giving works */}
      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-2">
        <div className="reveal">
          <SectionHeading
            eyebrow="Transparency"
            title="Every peso, accounted for"
            lead="Donations are confirmed by our treasurer against bank records. Spending is posted with receipts."
          />
          <StatGrid
            className="mt-8"
            stats={[
              { label: "Received", value: formatPeso(totals.received) },
              { label: "Spent on programs", value: formatPeso(totals.spent) },
            ]}
          />
          <ButtonLink href="/transparency" variant="outline" icon={actionIcons.ledger} className="mt-8 w-full sm:w-auto">
            Open the ledger
          </ButtonLink>
        </div>
        <div className="reveal">
          <h2 className="text-2xl font-semibold">How giving works</h2>
          <StepList steps={givingSteps} className="mt-6" />
        </div>
      </section>

      {/* Volunteer */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="bg-tide reveal relative overflow-clip rounded-3xl px-6 py-12 text-white sm:px-10 md:px-14 md:py-16">
          <BrandOrbs className="absolute -bottom-24 -right-20 w-72 opacity-35 sm:w-96 md:-right-10 md:opacity-60" />
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-semibold md:text-4xl">Give a Saturday instead of a peso</h2>
            <p className="mt-4 text-lg text-white/80">
              We need people to pack bags, take photos, drive, and teach. Tell us what you&apos;re good at.
            </p>
            <ButtonLink href="/contact?subject=Volunteering" variant="give" size="lg" icon={actionIcons.volunteer} className="mt-8 w-full sm:w-auto">
              Volunteer with us
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
