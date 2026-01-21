import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dummyimage.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      // In production, you would add actual image domains here (e.g., static.coupangcdn.com)
    ],
  },
};

export default nextConfig;
