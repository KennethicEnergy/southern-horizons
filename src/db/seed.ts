/**
 * Creates the first President (the seed admin) and a sample campaign.
 * Run once after `pnpm db:migrate`:  pnpm db:seed
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const db = drizzle(neon(url), { schema, casing: "snake_case" });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Site Admin";
  if (!email || !password || password.length < 12) {
    throw new Error("Set SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters.");
  }

  let [admin] = await db
    .select()
    .from(schema.users)
    .where(sql`lower(${schema.users.email}) = ${email.toLowerCase()}`)
    .limit(1);

  if (!admin) {
    [admin] = await db
      .insert(schema.users)
      .values({ email, name, role: "president", passwordHash: await bcrypt.hash(password, 12) })
      .returning();
    console.log(`Created President ${email}`);
  } else {
    console.log(`${email} already exists`);
  }

  const [existing] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.slug, "school-bag-drive-2026")).limit(1);
  if (!existing) {
    const [campaign] = await db
      .insert(schema.campaigns)
      .values({
        slug: "school-bag-drive-2026",
        title: "School bag drive 2026",
        summary: "Help 200 learners from daycare to Grade 4 start the school year with a full bag of supplies.",
        status: "draft",
        startsAt: new Date(),
      })
      .returning();
    await db.insert(schema.donationItems).values({
      campaignId: campaign!.id,
      name: "School bag",
      unitAmount: 250_00,
      goalQuantity: 200,
      contents: ["6 notebooks", "2 pencils", "1 ballpen", "1 eraser", "1 sharpener", "1 box of crayons", "1 ruler", "1 pad paper"],
    });
    console.log("Created sample campaign (status: draft). Upload a QR Ph image and set it to active when ready.");
  }

  const [welcome] = await db.select().from(schema.posts).where(eq(schema.posts.slug, "welcome")).limit(1);
  if (!welcome) {
    await db.insert(schema.posts).values({
      slug: "welcome",
      title: "Our new home online",
      excerpt: "News, events, and a public ledger of every donation, all in one place.",
      type: "news",
      status: "published",
      publishedAt: new Date(),
      authorId: admin!.id,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "This is a sample post. Edit or delete it from the backoffice." }],
          },
        ],
      },
    });
    console.log("Created sample post /news/welcome");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
