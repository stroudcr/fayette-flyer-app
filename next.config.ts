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
      {
        // Photos business owners upload to their guide listings (Vercel Blob)
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
