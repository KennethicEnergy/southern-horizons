"use client";

import { useId } from "react";
import { THEME_OPTIONS } from "@/config/theme";
import { themeIcons } from "@/config/icons";
import { useTheme } from "@/hooks/useTheme";
import { Icon } from "./icon";

// `deep` is for always-dark grounds like the footer; `panel` for everywhere else.
const tones = {
  panel: { group: "bg-panel ring-1 ring-line", idle: "text-fg-soft hover:text-fg" },
  deep: { group: "bg-white/10", idle: "text-white/70 hover:text-white" },
};

type ThemeSwitcherProps = { tone?: keyof typeof tones; className?: string };

/**
 * Light / Dark / Match device. Real radio inputs, so arrow keys move between them and screen readers
 * announce a choice of three. Nothing is selected until hydration, because the server can't read the cookie.
 */
export const ThemeSwitcher = ({ tone = "panel", className = "" }: ThemeSwitcherProps) => {
  const name = useId();
  const { choice, setChoice } = useTheme();
  const { group, idle } = tones[tone];

  return (
    <fieldset className={`inline-flex gap-1 rounded-full p-1 ${group} ${className}`}>
      <legend className="sr-only">Theme</legend>
      {THEME_OPTIONS.map(({ value, label }) => {
        const selected = choice === value;
        return (
          <label
            key={value}
            title={label}
            className={`flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
              selected ? "bg-surface text-fg shadow-soft" : idle
            }`}
          >
            <input type="radio" name={name} value={value} checked={selected} onChange={() => setChoice(value)} className="sr-only" />
            <Icon icon={themeIcons[value]} size={16} />
            <span className="sr-only">{label}</span>
          </label>
        );
      })}
    </fieldset>
  );
};
