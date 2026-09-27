export const site = {
  name: "Southern Horizons",
  city: process.env.NEXT_PUBLIC_ORG_CITY ?? "Lipa City, Batangas",
  tagline: "Volunteers who show up for kids and communities, and show you where every peso goes.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@example.org",
  phone: "+63 927 255 9083",
  facebook: "https://www.facebook.com/SouthernHorizons2025",
  nav: [
    { href: "/news", label: "News & events" },
    { href: "/transparency", label: "Transparency" },
    { href: "/about", label: "About us" },
    { href: "/faqs", label: "FAQs" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/terms", label: "Terms and conditions" },
  ],
} as const;
