import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.beehiiv.com",
      },
      {
        protocol: "https",
        hostname: "media.beehiiv.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
