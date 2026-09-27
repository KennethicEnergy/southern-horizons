export const site = {
  name: "Southern Horizons",
  city: process.env.NEXT_PUBLIC_ORG_CITY ?? "Lipa City, Batangas",
  tagline: "Rising Together, Giving Back With Purpose",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "southernhorizonsph@gmail.com",
  phone: "+63 993 757 7410",
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
