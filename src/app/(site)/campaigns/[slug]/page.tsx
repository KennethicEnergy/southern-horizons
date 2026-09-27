import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/lib/queries";
import { renderContent } from "@/lib/content/render";
import { formatPeso } from "@/lib/money";
import { ProgressHorizon } from "@/components/site/progress-horizon";
import { DonationForm } from "@/components/forms/donation-form";

export const revalidate = 120;
export const generateStaticParams = async () => [];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCampaignBySlug((await params).slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.summary,
    openGraph: { images: c.cover ? [{ url: c.cover.url }] : undefined },
  };
}

export default async function CampaignPage({ params }: Props) {
  const campaign = await getCampaignBySlug((await params).slug);
  if (!campaign) notFound();
  const isOpen = campaign.status === "active";

  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-5 py-14 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="font-medium text-sea">{isOpen ? "Open for donations" : "This campaign has closed"}</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{campaign.title}</h1>
        <p className="mt-5 text-xl text-ink-soft">{campaign.summary}</p>

        {campaign.cover ? (
          <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-2xl bg-sky">
            <Image src={campaign.cover.url} alt={campaign.cover.alt ?? ""} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        ) : null}

        <div className="mt-10 space-y-10">
          {campaign.items.map((item) => (
            <section key={item.id}>
              <ProgressHorizon given={item.given} goal={item.goalQuantity} unit={item.name.toLowerCase()} />
              <div className="mt-6 flex flex-col gap-6 sm:flex-row">
                {item.image ? (
                  <div className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-xl bg-sky">
                    <Image src={item.image.url} alt={item.image.alt ?? item.name} fill sizes="160px" className="object-cover" />
                  </div>
                ) : null}
                <div>
                  <h2 className="text-2xl font-semibold">
                    {formatPeso(item.unitAmount)} gives one {item.name.toLowerCase()}
                  </h2>
                  {item.description ? <p className="mt-2 text-ink-soft">{item.description}</p> : null}
                  {item.contents.length > 0 ? (
                    <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-ink-soft">
                      {item.contents.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </section>
          ))}
        </div>

        {campaign.content ? (
          <div className="article prose prose-lg mt-12 prose-a:text-sea" dangerouslySetInnerHTML={{ __html: renderContent(campaign.content) }} />
        ) : null}

        <p className="mt-10 text-ink-soft">
          Every confirmed donation and every expense for this campaign appears on our{" "}
          <Link href="/transparency" className="text-sea underline">
            transparency page
          </Link>
          .
          {campaign.event ? (
            <>
              {" "}
              Follow the distribution at{" "}
              <Link href={`/news/${campaign.event.slug}`} className="text-sea underline">
                {campaign.event.title}
              </Link>
              .
            </>
          ) : null}
        </p>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line p-6 md:p-8">
          {isOpen ? (
            <DonationForm
              campaignId={campaign.id}
              items={campaign.items.map((i) => ({ id: i.id, name: i.name, unitAmount: i.unitAmount }))}
              qr={campaign.qr ? { url: campaign.qr.url, accountName: campaign.qrAccountName } : null}
            />
          ) : (
            <p className="text-lg text-ink-soft">
              Thank you to everyone who gave. See what the campaign achieved on the transparency page.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
