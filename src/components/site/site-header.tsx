"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { site } from "@/config/site";
import { HorizonMark } from "./horizon-mark";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader({ donateHref }: { donateHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Link href="/" className="flex items-center gap-2.5 text-ink" onClick={() => setOpen(false)}>
          <HorizonMark />
          <span className="font-display text-lg font-semibold tracking-tight">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-[0.95rem] transition-colors ${
                  active ? "bg-sky text-sea-deep" : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <ButtonLink href={donateHref} variant="give" size="sm" className="ml-3">
            Donate
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="rounded-full p-2 text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <HugeiconsIcon icon={open ? Cancel01Icon : Menu01Icon} size={24} />
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line bg-white px-5 pb-6 pt-2 md:hidden">
          <ul className="divide-y divide-line">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-3.5 text-lg" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href={donateHref} variant="give" size="lg" className="mt-4 w-full" onClick={() => setOpen(false)}>
            Donate
          </ButtonLink>
        </nav>
      ) : null}
    </header>
  );
}
