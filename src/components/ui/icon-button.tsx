import type { ComponentProps } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { iconButtonClass, iconSizes, type ButtonSize, type ButtonVariant } from "./button";
import { Icon } from "./icon";

type IconButtonProps = Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  icon: IconSvgElement;
  /** Required: it is the button's only name for screen readers, and its tooltip on desktop. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** Icon-only action for tight spots (toolbars, toasts, the mobile header). Prefer Button with an icon when there is room for a label. */
export const IconButton = ({ icon, label, variant = "ghost", size = "md", type = "button", className = "", ...props }: IconButtonProps) => (
  <button type={type} aria-label={label} title={label} className={iconButtonClass(variant, size, className)} {...props}>
    <Icon icon={icon} size={iconSizes[size] + 2} />
  </button>
);
