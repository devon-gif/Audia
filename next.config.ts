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
      // Apple Podcasts / iTunes artwork
      {
        protocol: "https",
        hostname: "is1.mzstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "is2.mzstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "is3.mzstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "is4.mzstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "is5.mzstatic.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
