import type { Media, Post } from "@/db/schema";

/** Fixture data for the component showcase. Nothing here touches the database. */

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysFromNow = (n: number) => new Date(now + n * DAY);

/** A small horizon scene in brand colors, inlined so the showcase needs no uploaded images. */
function scene(sky: string, sun: string, ground: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect width="300" height="200" fill="${sky}"/><circle cx="150" cy="130" r="42" fill="${sun}"/><rect y="128" width="300" height="72" fill="${ground}"/><rect y="127" width="300" height="2" fill="#023d54"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function sampleMedia(overrides: Partial<Media> & Pick<Media, "id" | "kind" | "url" | "filename" | "mimeType">): Media {
  return {
    key: overrides.id,
    size: 240 * 1024,
    alt: null,
    width: null,
    height: null,
    verified: true,
    uploadedById: null,
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-10),
    deletedAt: null,
    ...overrides,
  };
}

export const images = {
  dawn: sampleMedia({ id: "img-dawn", kind: "image", url: scene("#d4eaef", "#fdfd68", "#0c6980"), filename: "dawn.svg", mimeType: "image/svg+xml", alt: "Sun rising over the sea" }),
  field: sampleMedia({ id: "img-field", kind: "image", url: scene("#eff7f8", "#fdfd68", "#94dfa7"), filename: "field.svg", mimeType: "image/svg+xml", alt: "Sun over a green field" }),
  dusk: sampleMedia({ id: "img-dusk", kind: "image", url: scene("#0c6980", "#94dfa7", "#023d54"), filename: "dusk.svg", mimeType: "image/svg+xml", alt: "Evening over the bay" }),
};

export const documents = {
  pdf: sampleMedia({ id: "doc-pdf", kind: "document", url: "#", filename: "liquidation-report.pdf", mimeType: "application/pdf", alt: "Liquidation report, Q3", size: 1.8 * 1024 * 1024 }),
  docx: sampleMedia({
    id: "doc-docx",
    kind: "document",
    url: "#",
    filename: "volunteer-briefing.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 86 * 1024,
  }),
};

export const video = sampleMedia({ id: "vid", kind: "video", url: "#", filename: "drive-recap.mp4", mimeType: "video/mp4" });

type PostWithCover = Post & { cover: Media | null };

function samplePost(overrides: Partial<PostWithCover> & Pick<Post, "id" | "title" | "type">): PostWithCover {
  return {
    slug: overrides.id,
    excerpt: null,
    status: "published",
    content: {},
    coverMediaId: null,
    parentId: null,
    eventStartAt: null,
    eventEndAt: null,
    location: null,
    authorId: "sample-author",
    publishedAt: daysFromNow(-3),
    createdAt: daysFromNow(-4),
    updatedAt: daysFromNow(-3),
    deletedAt: null,
    cover: null,
    ...overrides,
  };
}

export const posts = {
  news: samplePost({
    id: "sample-news",
    type: "news",
    title: "120 school bags packed for Barangay Sampaguita",
    excerpt: "Volunteers spent Saturday sorting notebooks, pencils, and rain jackets.",
    cover: images.dawn,
  }),
  noCover: samplePost({
    id: "sample-story",
    type: "story",
    title: "Why we publish every receipt",
    excerpt: "A note from our treasurer on how donations are matched and logged.",
  }),
  upcoming: samplePost({
    id: "sample-upcoming",
    type: "event",
    title: "Coastal clean-up at Laiya",
    excerpt: "Gloves and sacks provided. Bring water and a hat.",
    eventStartAt: daysFromNow(14),
    location: "Laiya, San Juan",
    cover: images.field,
  }),
  ongoing: samplePost({
    id: "sample-ongoing",
    type: "event",
    title: "Back-to-school supply drive",
    eventStartAt: daysFromNow(-2),
    eventEndAt: daysFromNow(5),
    location: "Lipa City Hall",
    cover: images.dusk,
  }),
  past: samplePost({
    id: "sample-past",
    type: "event",
    title: "Tree planting along the Kumintang trail",
    eventStartAt: daysFromNow(-40),
    location: "Batangas City",
  }),
};
