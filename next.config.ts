import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },

  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
  },
};

export default nextConfig;
