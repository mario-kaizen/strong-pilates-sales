import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/coalharbour',
        destination: '/coalharbour.html',
      },
    ];
  },
};

export default nextConfig;
