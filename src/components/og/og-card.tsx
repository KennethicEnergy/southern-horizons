import { HorizonMark } from "@/components/site/horizon-mark";
import { brandColors } from "@/config/brand";
import { site } from "@/config/site";

/**
 * Social share card rendered by next/og (Satori), so it uses inline styles only:
 * no Tailwind, and every element with more than one child needs `display: flex`.
 */
export type OgCardProps = {
  title: string;
  eyebrow?: string;
  /** Background photo. Must be a JPEG or PNG URL; see getOgCoverUrl. */
  imageUrl?: string | null;
};

const { ink, sea, sun, mint, white } = brandColors;
const host = new URL(site.url).host;

// Satori ignores `inset`, so overlays spell out their box.
const fill = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex" } as const;

const titleSize = (title: string) => (title.length > 70 ? 60 : title.length > 40 ? 72 : 88);

const Sunrise = () => (
  <div style={{ position: "absolute", right: 64, bottom: 0, width: 320, height: 160, display: "flex" }}>
    <div style={{ position: "absolute", left: -96, bottom: 0, width: 256, height: 128, borderRadius: "128px 128px 0 0", background: sea, opacity: 0.8 }} />
    <div style={{ position: "absolute", right: -64, bottom: 0, width: 192, height: 96, borderRadius: "96px 96px 0 0", background: mint, opacity: 0.8 }} />
    <div style={{ ...fill, borderRadius: "160px 160px 0 0", background: sun, opacity: 0.85 }} />
  </div>
);

export const OgCard = ({ title, eyebrow, imageUrl }: OgCardProps) => {
  const fg = imageUrl ? white : ink;
  return (
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: white, color: fg }}>
      {imageUrl ? (
        <div style={fill}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- Satori only renders <img> */}
          <img src={imageUrl} width={1200} height={630} style={{ ...fill, objectFit: "cover" }} />
          <div
            style={{
              ...fill,
              backgroundImage: `linear-gradient(to top, ${ink} 0%, rgba(2, 61, 84, 0.75) 45%, rgba(2, 61, 84, 0.15) 100%)`,
            }}
          />
        </div>
      ) : (
        <div style={fill}>
          <Sunrise />
          <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 4, background: ink }} />
        </div>
      )}

      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 72px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <HorizonMark size={64} />
          <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>{site.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: imageUrl ? 1056 : 760 }}>
          {eyebrow ? <span style={{ fontSize: 30, color: imageUrl ? mint : sea, marginBottom: 16 }}>{eyebrow}</span> : null}
          <span style={{ fontSize: titleSize(title), fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.03em", lineClamp: 3 }}>{title}</span>
          <span style={{ fontSize: 26, marginTop: 28, opacity: 0.75 }}>{host}</span>
        </div>
      </div>
    </div>
  );
};
