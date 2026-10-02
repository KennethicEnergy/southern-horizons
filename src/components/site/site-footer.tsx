import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon, Facebook01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { site } from "@/config/site";
import { HorizonMark } from "./horizon-mark";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
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
          <ul className="mt-4 space-y-2.5 text-[0.95rem]">
            {[...site.nav, { href: "/join", label: "Become a member" }, ...site.legal].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-base font-semibold text-white">Reach us</h2>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            <li className="flex items-center gap-2.5">
              <HugeiconsIcon icon={Mail01Icon} size={18} />
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <HugeiconsIcon icon={Call02Icon} size={18} />
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {site.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <HugeiconsIcon icon={Facebook01Icon} size={18} />
              <a href={site.facebook} className="hover:text-white" rel="noopener noreferrer" target="_blank">
                Southern Horizons on Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-sm text-white/60">
          © {new Date().getFullYear()} {site.name}. Run entirely by volunteers.
        </p>
      </div>
    </footer>
  );
}
