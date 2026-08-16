import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Allow up to 50MB request body (Ollama prompts can be large)
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  
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
      '@': './src',
    },
  },
};
export default nextConfig;
