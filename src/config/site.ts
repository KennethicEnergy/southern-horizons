import { HelpCircleIcon, Invoice01Icon, Mail01Icon, News01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";

export const site = {
  name: "Southern Horizons",
  // `||` rather than `??`: a variable set to an empty string on Vercel should fall back too.
  city: process.env.ORG_CITY || "Lipa City, Batangas",
  tagline: "Rising Together, Giving Back With Purpose",
  url:
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    "http://localhost:3000",
  email: "southernhorizonsph@gmail.com",
  phone: "+63 993 757 7410",
  facebook: "https://www.facebook.com/SouthernHorizons2025",
  // The icon sits beside each label in the mobile menu.
  nav: [
    { href: "/news", label: "News & events", icon: News01Icon },
    { href: "/transparency", label: "Transparency", icon: Invoice01Icon },
    { href: "/about", label: "About us", icon: UserGroupIcon },
    { href: "/faqs", label: "FAQs", icon: HelpCircleIcon },
    { href: "/contact", label: "Contact", icon: Mail01Icon },
  ],
  legal: [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/terms", label: "Terms and conditions" },
  ],
} as const;
