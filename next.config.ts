import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Uploaded files are served straight from /public/uploads without optimization.
    unoptimized: false,
  },
  async rewrites() {
    return {
      // Files written to public/uploads at runtime aren't guaranteed to be served by
      // `next start`; anything the public folder doesn't resolve falls back to the
      // upload route, which streams it from disk.
      afterFiles: [{ source: "/uploads/:name", destination: "/api/upload/:name" }],
    };
  },
};

export default nextConfig;
