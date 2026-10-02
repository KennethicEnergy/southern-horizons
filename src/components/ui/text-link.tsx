import Link from "next/link";
import type { ComponentProps } from "react";
import { actionIcons } from "@/config/icons";
import { Icon } from "./icon";

type TextLinkProps = ComponentProps<typeof Link> & {
  /** "back" puts a left arrow before the text, for links up to a parent page. */
  direction?: "forward" | "back";
};

/** An inline link that says where it goes with an arrow, which nudges toward its direction on hover. */
export const TextLink = ({ direction = "forward", className = "", children, ...props }: TextLinkProps) => {
  const back = direction === "back";
  const arrow = (
    <Icon
      icon={back ? actionIcons.back : actionIcons.next}
      size={18}
      className={`shrink-0 transition-transform duration-200 ease-out-soft ${back ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
    />
  );
  return (
    <Link className={`group inline-flex items-center gap-1.5 font-medium text-sea hover:text-sea-deep ${className}`} {...props}>
      {back ? arrow : null}
      {children}
      {back ? null : arrow}
    </Link>
  );
};
