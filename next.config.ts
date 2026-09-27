import type { NextConfig } from "next";

const r2Host = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: r2Host ? [{ protocol: "https", hostname: r2Host }] : [],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
