import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-images-1.listennotes.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.listennotes.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
