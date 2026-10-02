import Link from "next/link";
import { site } from "@/config/site";
import { ContactList } from "./contact-list";
import { HorizonMark } from "./horizon-mark";

const links = [...site.nav, { href: "/join", label: "Become a member" }, ...site.legal];

export const SiteFooter = () => (
  <footer className="mt-24 bg-ink text-white/80">
    <div aria-hidden="true" className="bg-brand-stripe h-1" />
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
      <div className="max-w-sm">
        <div className="flex items-center gap-2.5 text-white">
          <HorizonMark />
          <span className="font-display text-lg font-semibold">{site.name}</span>
        </div>
        <p className="mt-4 text-[0.95rem] leading-relaxed">
          A volunteer group from {site.city}. Every donation is logged and every receipt is published on our
          transparency page.
        </p>
      </div>

      <nav aria-label="Footer">
        <h2 className="font-display text-base font-semibold text-white">Explore</h2>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[0.95rem] md:grid-cols-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="transition-colors hover:text-white">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <h2 className="font-display text-base font-semibold text-white">Reach us</h2>
        <ContactList tone="dark" className="mt-3" />
      </div>
    </div>
    <div className="border-t border-white/10">
      <p className="mx-auto max-w-6xl px-5 py-6 text-sm text-white/60">
        © {new Date().getFullYear()} {site.name}. Run entirely by volunteers.
      </p>
    </div>
  </footer>
);
