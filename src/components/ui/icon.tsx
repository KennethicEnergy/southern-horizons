import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

export type IconProps = { icon: IconSvgElement; size?: number; className?: string };

/** Decorative icon: hidden from screen readers, so always pair it with visible text or an aria-label on its control. */
export const Icon = ({ icon, size = 20, className }: IconProps) => (
  <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8} className={className} aria-hidden="true" focusable="false" />
);
