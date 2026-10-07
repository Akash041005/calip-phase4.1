import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [new URL("https://res.cloudinary.com/**")],
  },
};

export default nextConfig;
