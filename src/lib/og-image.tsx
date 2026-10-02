import { ImageResponse } from "next/og";
import { OgCard, type OgCardProps } from "@/components/og/og-card";
import { OG_IMAGE_SIZE } from "@/config/og";

export const renderOgImage = (props: OgCardProps) => new ImageResponse(<OgCard {...props} />, OG_IMAGE_SIZE);
