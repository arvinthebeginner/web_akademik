import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint warnings/errors won't block production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors won't block production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
