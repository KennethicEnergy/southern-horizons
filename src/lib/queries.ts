import "server-only";
import { and, asc, count, desc, eq, inArray, isNull, sql, sum } from "drizzle-orm";
import { getDb, isDbConfigured, schema } from "@/db";
import type { PostType } from "@/db/schema";

const PAGE_SIZE = 12;
const visible = and(eq(schema.posts.status, "published"), isNull(schema.posts.deletedAt));

export async function getPublishedPosts({ type, page = 1 }: { type?: PostType; page?: number } = {}) {
  if (!isDbConfigured()) return { posts: [], page, totalPages: 1 };
  const db = getDb();
  const where = and(visible, type ? eq(schema.posts.type, type) : sql`${schema.posts.type} <> 'update'`);

  const [rows, [total]] = await Promise.all([
    db.query.posts.findMany({
      where,
      orderBy: [desc(schema.posts.publishedAt)],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      with: { cover: true, author: { columns: { name: true } } },
    }),
    db.select({ n: count() }).from(schema.posts).where(where),
  ]);

  return { posts: rows, page, totalPages: Math.max(1, Math.ceil((total?.n ?? 0) / PAGE_SIZE)) };
}

export async function getUpcomingEvents(limit = 3) {
  if (!isDbConfigured()) return [];
  return getDb().query.posts.findMany({
    where: and(visible, eq(schema.posts.type, "event"), sql`coalesce(${schema.posts.eventEndAt}, ${schema.posts.eventStartAt}) >= now()`),
    orderBy: [asc(schema.posts.eventStartAt)],
    limit,
    with: { cover: true },
  });
}

/** A post plus, for events, its thread of updates (oldest first, like a timeline). */
export async function getPostBySlug(slug: string) {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const post = await db.query.posts.findFirst({
    where: and(visible, eq(schema.posts.slug, slug)),
    with: {
      cover: true,
      author: { columns: { name: true } },
      parent: { columns: { title: true, slug: true, status: true } },
      attachments: { with: { media: true }, orderBy: [asc(schema.postMedia.sortOrder)] },
    },
  });
  if (!post) return null;

  const updates =
    post.type === "event"
      ? await db.query.posts.findMany({
          where: and(visible, eq(schema.posts.parentId, post.id)),
          orderBy: [asc(schema.posts.publishedAt)],
          with: { cover: true, attachments: { with: { media: true }, orderBy: [asc(schema.postMedia.sortOrder)] } },
        })
      : [];

  return { ...post, updates };
}

async function itemProgress(itemIds: string[]) {
  if (itemIds.length === 0) return new Map<string, number>();
  const rows = await getDb()
    .select({ itemId: schema.donations.itemId, qty: sum(schema.donations.quantity).mapWith(Number) })
    .from(schema.donations)
    .where(and(inArray(schema.donations.itemId, itemIds), eq(schema.donations.status, "confirmed")))
    .groupBy(schema.donations.itemId);
  return new Map(rows.map((r) => [r.itemId!, r.qty ?? 0]));
}

export async function getCampaignBySlug(slug: string) {
  if (!isDbConfigured()) return null;
  const campaign = await getDb().query.campaigns.findFirst({
    where: and(eq(schema.campaigns.slug, slug), isNull(schema.campaigns.deletedAt), sql`${schema.campaigns.status} <> 'draft'`),
    with: {
      cover: true,
      qr: true,
      event: { columns: { slug: true, title: true } },
      items: { with: { image: true }, orderBy: [asc(schema.donationItems.sortOrder)] },
    },
  });
  if (!campaign) return null;
  const progress = await itemProgress(campaign.items.map((i) => i.id));
  return { ...campaign, items: campaign.items.map((i) => ({ ...i, given: progress.get(i.id) ?? 0 })) };
}

export async function getFeaturedCampaign() {
  if (!isDbConfigured()) return null;
  const campaign = await getDb().query.campaigns.findFirst({
    where: and(eq(schema.campaigns.status, "active"), isNull(schema.campaigns.deletedAt)),
    orderBy: [desc(schema.campaigns.startsAt)],
    with: { items: { orderBy: [asc(schema.donationItems.sortOrder)] }, cover: true },
  });
  if (!campaign) return null;
  const progress = await itemProgress(campaign.items.map((i) => i.id));
  return { ...campaign, items: campaign.items.map((i) => ({ ...i, given: progress.get(i.id) ?? 0 })) };
}

/** Money in vs. money out, per campaign, from confirmed donations and the ledger. */
export async function getTransparencyReport() {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const [campaigns, donationTotals, ledger] = await Promise.all([
    db.query.campaigns.findMany({
      where: and(isNull(schema.campaigns.deletedAt), sql`${schema.campaigns.status} <> 'draft'`),
      orderBy: [desc(schema.campaigns.startsAt)],
    }),
    db
      .select({
        campaignId: schema.donations.campaignId,
        amount: sum(schema.donations.amount).mapWith(Number),
        donors: count(),
      })
      .from(schema.donations)
      .where(eq(schema.donations.status, "confirmed"))
      .groupBy(schema.donations.campaignId),
    db.query.ledgerEntries.findMany({
      where: isNull(schema.ledgerEntries.deletedAt),
      orderBy: [desc(schema.ledgerEntries.occurredAt)],
      with: { receipt: true },
    }),
  ]);

  const byCampaign = new Map(donationTotals.map((d) => [d.campaignId, d]));
  return campaigns.map((c) => {
    const entries = ledger.filter((l) => l.campaignId === c.id);
    const otherIncome = entries.filter((e) => e.kind === "income").reduce((a, e) => a + e.amount, 0);
    const spent = entries.filter((e) => e.kind === "expense").reduce((a, e) => a + e.amount, 0);
    const donated = byCampaign.get(c.id)?.amount ?? 0;
    return {
      campaign: c,
      donated,
      donors: byCampaign.get(c.id)?.donors ?? 0,
      received: donated + otherIncome,
      spent,
      entries,
    };
  });
}

export async function getEventsForSelect() {
  return getDb()
    .select({ id: schema.posts.id, title: schema.posts.title })
    .from(schema.posts)
    .where(and(eq(schema.posts.type, "event"), isNull(schema.posts.deletedAt)))
    .orderBy(desc(schema.posts.eventStartAt));
}
