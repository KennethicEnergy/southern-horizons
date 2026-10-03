/**
 * Fills the site with lorem ipsum placeholder content: news, events, stories,
 * an active campaign with confirmed donations, and ledger entries.
 * Everything it creates has a slug starting with "sample-".
 *
 *   pnpm db:seed:samples            add the samples (skips ones that exist)
 *   pnpm db:seed:samples --remove   delete every sample again
 *
 * Run `pnpm db:seed` first; samples are authored by the President.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, inArray, like } from "drizzle-orm";
import * as schema from "./schema";
import { SINGLE_HOLDER_ROLES } from "../config/roles";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const db = drizzle(neon(url), { schema, casing: "snake_case" });

const PREFIX = "sample-";
const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY);

const LOREM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.",
  "Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.",
];

const text = (t: string) => ({ type: "text", text: t });
const paragraph = (t: string) => ({ type: "paragraph", content: [text(t)] });
const heading = (t: string) => ({ type: "heading", attrs: { level: 2 }, content: [text(t)] });
const bullets = (items: string[]) => ({
  type: "bulletList",
  content: items.map((i) => ({ type: "listItem", content: [paragraph(i)] })),
});

function loremDoc(seed: number) {
  const p = (i: number) => LOREM[(seed + i) % LOREM.length]!;
  return {
    type: "doc",
    content: [
      paragraph(p(0)),
      paragraph(p(1)),
      heading("Lorem ipsum dolor sit amet"),
      paragraph(p(2)),
      bullets(["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Sed do eiusmod tempor incididunt"]),
      paragraph(p(3)),
    ],
  };
}

type SamplePost = {
  slug: string;
  title: string;
  type: schema.PostType;
  publishedDaysAgo: number;
  event?: { startsInDays: number; hours: number; location: string };
};

const samplePosts: SamplePost[] = [
  { slug: "sample-news-lorem-ipsum", title: "Lorem ipsum dolor sit amet, consectetur adipiscing", type: "news", publishedDaysAgo: 2 },
  { slug: "sample-news-sed-ut-perspiciatis", title: "Sed ut perspiciatis unde omnis iste natus", type: "news", publishedDaysAgo: 9 },
  { slug: "sample-news-nemo-enim", title: "Nemo enim ipsam voluptatem quia voluptas", type: "news", publishedDaysAgo: 21 },
  { slug: "sample-story-at-vero-eos", title: "At vero eos et accusamus et iusto odio", type: "story", publishedDaysAgo: 14 },
  { slug: "sample-story-nam-libero", title: "Nam libero tempore, cum soluta nobis", type: "story", publishedDaysAgo: 30 },
  {
    slug: "sample-event-coastal-clean-up",
    title: "Lorem ipsum coastal clean-up",
    type: "event",
    publishedDaysAgo: 3,
    event: { startsInDays: 12, hours: 4, location: "Lorem Beach, Batangas" },
  },
  {
    slug: "sample-event-school-bag-packing",
    title: "Dolor sit amet school bag packing day",
    type: "event",
    publishedDaysAgo: 5,
    event: { startsInDays: 26, hours: 6, location: "Ipsum Covered Court, Lipa City" },
  },
  {
    slug: "sample-event-reading-circle",
    title: "Consectetur reading circle",
    type: "event",
    publishedDaysAgo: 6,
    event: { startsInDays: 40, hours: 3, location: "Barangay Adipiscing Hall" },
  },
];

async function addSamples() {
  // Either one-person seat can author samples; the President's may be empty right after a Super Admin hand-over.
  const admin = await db.query.users.findFirst({ where: inArray(schema.users.role, [...SINGLE_HOLDER_ROLES]) });
  if (!admin) throw new Error("No Super Admin or President found. Run `pnpm db:seed` first.");

  const existing = new Set(
    (await db.select({ slug: schema.posts.slug }).from(schema.posts).where(like(schema.posts.slug, `${PREFIX}%`))).map((r) => r.slug),
  );

  for (const [i, p] of samplePosts.entries()) {
    if (existing.has(p.slug)) continue;
    const startsAt = p.event ? daysFromNow(p.event.startsInDays) : null;
    await db.insert(schema.posts).values({
      slug: p.slug,
      title: p.title,
      excerpt: LOREM[i % LOREM.length]!.slice(0, 140).replace(/\s\S*$/, "…"),
      type: p.type,
      status: "published",
      publishedAt: daysFromNow(-p.publishedDaysAgo),
      content: loremDoc(i),
      authorId: admin.id,
      eventStartAt: startsAt,
      eventEndAt: startsAt && p.event ? new Date(startsAt.getTime() + p.event.hours * 60 * 60 * 1000) : null,
      location: p.event?.location ?? null,
    });
    console.log(`Created ${p.type} /news/${p.slug}`);
  }

  const campaignSlug = `${PREFIX}campaign-lorem-ipsum-drive`;
  const [campaignExists] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.slug, campaignSlug)).limit(1);
  if (campaignExists) return;

  const [campaign] = await db
    .insert(schema.campaigns)
    .values({
      slug: campaignSlug,
      title: "Lorem ipsum school supply drive",
      summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
      content: loremDoc(1),
      status: "active",
      startsAt: daysFromNow(-20),
      endsAt: daysFromNow(45),
    })
    .returning();

  const [item] = await db
    .insert(schema.donationItems)
    .values({
      campaignId: campaign!.id,
      name: "School bag",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      unitAmount: 250_00,
      goalQuantity: 150,
      contents: ["Lorem notebooks", "Ipsum pencils", "Dolor crayons", "Sit amet ruler", "Consectetur eraser", "Adipiscing pad paper"],
    })
    .returning();

  const donors = ["Lorem Ipsum", "Dolor Sit", "Amet Consectetur", null, "Adipiscing Elit", "Sed Eiusmod", null, "Tempor Incididunt"];
  await db.insert(schema.donations).values(
    donors.map((name, i) => {
      const quantity = (i % 3) + 1;
      return {
        campaignId: campaign!.id,
        itemId: item!.id,
        quantity,
        amount: quantity * item!.unitAmount,
        donorName: name,
        isAnonymous: name === null,
        message: i % 2 === 0 ? "Lorem ipsum dolor sit amet!" : null,
        referenceNumber: `SAMPLE${String(100000 + i)}`,
        status: "confirmed" as const,
        reviewedById: admin.id,
        reviewedAt: daysFromNow(-15 + i),
      };
    }),
  );

  await db.insert(schema.ledgerEntries).values([
    { campaignId: campaign!.id, kind: "income", description: "Lorem ipsum cash donation", amount: 1_500_00, occurredAt: daysFromNow(-12), createdById: admin.id },
    { campaignId: campaign!.id, kind: "expense", description: "Dolor sit amet notebooks (lorem ipsum)", amount: 1_200_00, occurredAt: daysFromNow(-8), createdById: admin.id },
    { campaignId: campaign!.id, kind: "expense", description: "Consectetur school bags (adipiscing)", amount: 950_00, occurredAt: daysFromNow(-4), createdById: admin.id },
  ]);
  console.log(`Created active campaign /campaigns/${campaignSlug} with donations and ledger entries`);
}

async function removeSamples() {
  const campaigns = await db.select({ id: schema.campaigns.id }).from(schema.campaigns).where(like(schema.campaigns.slug, `${PREFIX}%`));
  const ids = campaigns.map((c) => c.id);
  if (ids.length > 0) {
    await db.delete(schema.ledgerEntries).where(inArray(schema.ledgerEntries.campaignId, ids));
    await db.delete(schema.donations).where(inArray(schema.donations.campaignId, ids));
    await db.delete(schema.donationItems).where(inArray(schema.donationItems.campaignId, ids));
    await db.delete(schema.campaigns).where(inArray(schema.campaigns.id, ids));
  }
  const posts = await db.delete(schema.posts).where(like(schema.posts.slug, `${PREFIX}%`)).returning({ slug: schema.posts.slug });
  console.log(`Removed ${posts.length} sample posts and ${ids.length} sample campaigns`);
}

(process.argv.includes("--remove") ? removeSamples() : addSamples())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
