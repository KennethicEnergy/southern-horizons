import { actionIcons } from "@/config/icons";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/icon";

const contacts = [
  { icon: actionIcons.email, label: site.email, href: `mailto:${site.email}`, external: false },
  { icon: actionIcons.call, label: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}`, external: false },
  { icon: actionIcons.facebook, label: "Message us on Facebook", href: site.facebook, external: true },
];

const tones = {
  light: { row: "hover:bg-sky", chip: "bg-sea-mist text-sea", text: "text-ink" },
  dark: { row: "hover:bg-white/5", chip: "bg-white/10 text-mint", text: "text-white/80 group-hover:text-white" },
};

/** Email, phone, and Facebook as tappable rows. `tone="dark"` for ink backgrounds like the footer. */
export const ContactList = ({ tone = "light", className = "" }: { tone?: keyof typeof tones; className?: string }) => {
  const { row, chip, text } = tones[tone];
  return (
    <ul className={`-mx-2 space-y-1 ${className}`}>
      {contacts.map(({ icon, label, href, external }) => (
        <li key={href}>
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`group flex min-h-11 items-center gap-3 rounded-xl px-2 py-1.5 transition-colors ${row}`}
          >
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${chip}`}>
              <Icon icon={icon} size={18} />
            </span>
            <span className={`min-w-0 break-words text-[0.95rem] ${text}`}>{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
};
