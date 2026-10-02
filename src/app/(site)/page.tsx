import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PostCard } from "@/components/site/post-card";
import { ProgressHorizon } from "@/components/site/progress-horizon";
import { getFeaturedCampaign, getPublishedPosts, getTransparencyReport, getUpcomingEvents } from "@/lib/queries";
import { formatPeso } from "@/lib/money";
import { site } from "@/config/site";

export const revalidate = 300;

const givingSteps = [
  { title: "Pick what to give", body: "Choose an item, like one school bag, and how many." },
  { title: "Scan and pay", body: "Use any bank or e-wallet app that supports QR Ph." },
  { title: "Send your reference number", body: "Enter it on the campaign page so we can match your payment." },
  { title: "See it on the ledger", body: "Our treasurer confirms it and it appears on the transparency page." },
];

export default async function HomePage() {
  const [campaign, { posts }, upcoming, report] = await Promise.all([
    getFeaturedCampaign(),
    getPublishedPosts(),
    getUpcomingEvents(3),
    getTransparencyReport(),
  ]);

  const [lead, ...rest] = posts;
  const totals = report.reduce(
    (acc, r) => ({ received: acc.received + r.received, spent: acc.spent + r.spent, donors: acc.donors + r.donors }),
    { received: 0, spent: 0, donors: 0 },
  );
  const item = campaign?.items[0];

  return (
    <>
      {/* Hero: the horizon */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-0 pt-16 md:pt-24">
          <h1 className="mt-4 max-w-5xl text-5xl font-semibold [text-wrap:pretty] md:text-7xl">
            Rising Together, Giving Back With Purpose.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            We run drives for kids and communities, and we publish every peso that comes in and every peso that goes
            out.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={campaign ? `/campaigns/${campaign.slug}` : "/transparency"} variant="give" size="lg">
              {campaign ? "Sponsor a learner" : "See where donations go"}
            </ButtonLink>
            <ButtonLink href="/news" variant="outline" size="lg">
              Read our updates
            </ButtonLink>
          </div>
        </div>
        <div className="relative mt-10 h-28 md:mt-6 md:h-52" aria-hidden="true">
          {/* Overlapping translucent circles, as in the logo */}
          <div className="animate-sunrise absolute bottom-0 right-[8%] h-24 w-48 md:h-48 md:w-96">
            <div className="absolute -left-[30%] bottom-0 h-[80%] w-[80%] rounded-t-full bg-sea/80" />
            <div className="absolute -right-[20%] bottom-0 h-[60%] w-[60%] rounded-t-full bg-mint/80" />
            <div className="absolute inset-0 rounded-t-full bg-sun/85" />
          </div>
          <div className="horizon-line absolute inset-x-0 bottom-0" />
        </div>
      </section>

      {/* Current campaign */}
      {campaign && item ? (
        <section className="bg-sky">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="text-sm font-medium text-sea">Current campaign</p>
              <h2 className="mt-2 text-4xl font-semibold">{campaign.title}</h2>
              <p className="mt-4 max-w-prose text-lg text-ink-soft">{campaign.summary}</p>
              <div className="mt-8 max-w-lg">
                <ProgressHorizon given={item.given} goal={item.goalQuantity} unit={item.name.toLowerCase()} />
              </div>
            </div>
            <div className="rounded-2xl bg-white p-7 shadow-[0_1px_0_var(--color-line)]">
              <p className="font-display text-5xl font-semibold tracking-tight">{formatPeso(item.unitAmount)}</p>
              <p className="mt-1 text-lg">gives one {item.name.toLowerCase()}</p>
              {item.contents.length > 0 ? (
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.95rem] text-ink-soft">
                  {item.contents.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : null}
              <ButtonLink href={`/campaigns/${campaign.slug}`} variant="give" size="lg" className="mt-7 w-full">
                Give {formatPeso(item.unitAmount)}
              </ButtonLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* Latest */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold md:text-4xl">From the field</h2>
          <Link href="/news" className="text-sea hover:underline">
            All news and events
          </Link>
        </div>
        {lead ? (
          <div className="mt-10 space-y-14">
            <PostCard post={lead} featured />
            {rest.length > 0 ? (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {rest.slice(0, 6).map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-8 text-ink-soft">
            Our first stories are on the way. Follow us on Facebook in the meantime.
          </p>
        )}
      </section>

      {/* Upcoming events */}
      {upcoming.length > 0 ? (
        <section className="border-y border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="text-3xl font-semibold">Coming up</h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Transparency + how giving works */}
      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold md:text-4xl">Every peso, accounted for</h2>
          <p className="mt-4 max-w-prose text-lg text-ink-soft">
            Donations are confirmed by our treasurer against bank records. Spending is posted with receipts.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-ink-soft">Received</dt>
              <dd className="font-display text-3xl font-semibold tabular-nums">{formatPeso(totals.received)}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Spent on programs</dt>
              <dd className="font-display text-3xl font-semibold tabular-nums">{formatPeso(totals.spent)}</dd>
            </div>
          </dl>
          <ButtonLink href="/transparency" variant="outline" className="mt-8">
            Open the ledger
          </ButtonLink>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">How giving works</h2>
          <ol className="mt-6 space-y-6">
            {givingSteps.map((step, i) => (
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
        </div>
      </section>

      {/* Volunteer */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="rounded-3xl bg-sea px-8 py-14 text-white md:px-14">
          <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">Give a Saturday instead of a peso</h2>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            We need people to pack bags, take photos, drive, and teach. Tell us what you&apos;re good at.
          </p>
          <ButtonLink href="/contact?subject=Volunteering" variant="give" size="lg" className="mt-8">
            Volunteer with us
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
