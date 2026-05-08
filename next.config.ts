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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Apple Podcasts / iTunes artwork — wildcard covers all isN.mzstatic.com CDN shards
      {
        protocol: "https",
        hostname: "**.mzstatic.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
