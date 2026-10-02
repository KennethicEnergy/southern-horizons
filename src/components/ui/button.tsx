import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "./icon";

export type ButtonVariant = "primary" | "give" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-full font-medium transition-[background-color,border-color,color,box-shadow,scale] duration-200 ease-out-soft active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-sea text-white shadow-soft hover:bg-sea-deep",
  give: "bg-sun text-ink shadow-soft ring-1 ring-inset ring-sun-deep hover:bg-sun-deep",
  outline: "border border-ink/15 bg-white text-ink hover:border-ink/40 hover:bg-sky",
  ghost: "text-ink hover:bg-sky",
  danger: "bg-danger text-white shadow-soft hover:bg-danger/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-5 text-[0.95rem]",
  lg: "h-12 px-6 text-base",
};

const squareSizes: Record<ButtonSize, string> = { sm: "size-9", md: "size-10", lg: "size-12" };

export const iconSizes: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

export const buttonClass = (variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") =>
  `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();

/** Square, icon-only version of buttonClass. */
export const iconButtonClass = (variant: ButtonVariant = "ghost", size: ButtonSize = "md", extra = "") =>
  `${base} ${variants[variant]} ${squareSizes[size]} ${extra}`.trim();

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shown before the label. Pick it from `actionIcons` so the same action always looks the same. */
  icon?: IconSvgElement;
  /** Shown after the label, e.g. an arrow for "next". */
  iconEnd?: IconSvgElement;
};

const ButtonContent = ({ icon, iconEnd, size = "md", children }: Pick<ButtonStyleProps, "icon" | "iconEnd" | "size"> & { children?: ReactNode }) => (
  <>
    {icon ? <Icon icon={icon} size={iconSizes[size]} className="shrink-0" /> : null}
    {children}
    {iconEnd ? <Icon icon={iconEnd} size={iconSizes[size]} className="shrink-0" /> : null}
  </>
);

export const Button = ({
  variant = "primary",
  size = "md",
  icon,
  iconEnd,
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & ButtonStyleProps) => (
  <button className={buttonClass(variant, size, className)} {...props}>
    <ButtonContent icon={icon} iconEnd={iconEnd} size={size}>
      {children}
    </ButtonContent>
  </button>
);

export const ButtonLink = ({
  variant = "primary",
  size = "md",
  icon,
  iconEnd,
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleProps) => (
  <Link className={buttonClass(variant, size, className)} {...props}>
    <ButtonContent icon={icon} iconEnd={iconEnd} size={size}>
      {children}
    </ButtonContent>
  </Link>
);
