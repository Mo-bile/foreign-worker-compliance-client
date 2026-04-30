import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/compliance",
        destination: "/deadlines",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
