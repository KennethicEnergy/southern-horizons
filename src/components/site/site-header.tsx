"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/config/site";
import { actionIcons } from "@/config/icons";
import { ButtonLink } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Icon } from "@/components/ui/icon";
import { HorizonMark } from "./horizon-mark";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export const SiteHeader = ({ donateHref }: { donateHref: string }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="header-elevate sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-ink" onClick={close}>
          <HorizonMark className="size-8 shrink-0" />
          <span className="truncate font-display text-base font-semibold tracking-tight max-[359px]:sr-only sm:text-lg">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {site.nav.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-[0.95rem] transition-colors duration-200 ${
                  active ? "bg-sea-mist font-medium text-sea-deep" : "text-ink-soft hover:bg-sky hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <ButtonLink href={donateHref} variant="give" size="sm" icon={actionIcons.donate} className="ml-3">
            Donate
          </ButtonLink>
        </nav>

        {/* Phones: Donate stays one tap away; everything else lives in the menu. */}
        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <ButtonLink href={donateHref} variant="give" size="sm" icon={actionIcons.donate} onClick={close}>
            Donate
          </ButtonLink>
          <IconButton
            icon={open ? actionIcons.close : actionIcons.menu}
            label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          />
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-line bg-white px-4 pb-5 pt-2 shadow-lift transition-[opacity,translate] duration-300 ease-out-soft starting:-translate-y-2 starting:opacity-0 md:hidden"
        >
          <ul className="space-y-0.5">
            {site.nav.map(({ href, label, icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-lg ${active ? "bg-sea-mist font-medium text-sea-deep" : "text-ink hover:bg-sky"}`}
                  >
                    <Icon icon={icon} size={22} className={active ? "text-sea-deep" : "text-sea"} />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/join" onClick={close} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-lg text-ink hover:bg-sky">
                <Icon icon={actionIcons.join} size={22} className="text-sea" />
                Become a member
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
};
