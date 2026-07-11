import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
