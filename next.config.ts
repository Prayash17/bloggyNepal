import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/explore-nepal/kavrepalanchowk",
        destination: "/explore-nepal/kavrepalanchok",
        permanent: true,
      },
      {
        source: "/explore-nepal/makawanpur",
        destination: "/explore-nepal/makwanpur",
        permanent: true,
      },
      {
        source: "/explore-nepal/sindhupalchowk",
        destination: "/explore-nepal/sindhupalchok",
        permanent: true,
      },
    ];
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
      "@": "./src",
    },
  },
};

export default nextConfig;
