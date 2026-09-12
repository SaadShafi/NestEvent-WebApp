import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Uploaded files are served straight from /public/uploads without optimization.
    unoptimized: false,
  },
};

export default nextConfig;
