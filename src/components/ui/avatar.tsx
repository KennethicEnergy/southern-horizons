"use client";

import Image from "next/image";
import { useState } from "react";
import { UserIcon } from "@hugeicons/core-free-icons";
import { initials } from "@/lib/initials";
import { Icon } from "./icon";

const sizes = {
  sm: { box: "size-7 text-[0.7rem]", px: 28, icon: 16 },
  md: { box: "size-10 text-sm", px: 40, icon: 20 },
  lg: { box: "size-14 text-lg", px: 56, icon: 28 },
} as const;

type AvatarProps = {
  name?: string | null;
  /** Google profile photo (session.user.image). Missing or failing to load, it falls back to initials. */
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
};

/** Circle avatar: the account photo, or the person's initials on sea when there is none. Decorative; show the name beside it. */
export const Avatar = ({ name, src, size = "md", className = "" }: AvatarProps) => {
  const [failed, setFailed] = useState(false);
  const { box, px, icon } = sizes[size];
  const letters = name ? initials(name).toUpperCase() : "";

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 select-none items-center justify-center overflow-clip rounded-full bg-sea font-display font-semibold text-white ring-2 ring-white ${box} ${className}`}
    >
      {src && !failed ? (
        // Google serves avatars from its own CDN; skip the optimizer and send no referrer, which it sometimes refuses.
        <Image
          src={src}
          alt=""
          width={px}
          height={px}
          unoptimized
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : letters ? (
        letters
      ) : (
        <Icon icon={UserIcon} size={icon} />
      )}
    </span>
  );
};
