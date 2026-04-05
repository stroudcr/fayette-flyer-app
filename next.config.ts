import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  turbopack: {
    root: path.resolve(__dirname),
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.beehiiv.com",
      },
      {
        protocol: "https",
        hostname: "beehiiv-images-production.s3.amazonaws.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
