import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/cours",
        destination: "/dashboard/documents?type=cours",
        permanent: true,
      },
      {
        source: "/dashboard/exercices",
        destination: "/dashboard/documents?type=exercice",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
