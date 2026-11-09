import path from "path";
import type { NextConfig } from "next";

const normalizedCwd = process.cwd().split(path.sep).join("/");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  turbopack: {
    root: normalizedCwd,
    rules: {
      "*.css": {
        loaders: [
          {
            loader: "@tailwindcss/turbopack",
            options: {
              base: normalizedCwd,
            },
          },
        ],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
