import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Avoid root auto-detection issues when multiple lockfiles exist
  // (e.g. one in home directory and one in the project).
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Enable image optimization for local images
    unoptimized: false,
    // Quality setting for optimized images
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kutv.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "engineering.byu.edu",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "brightspotcdn.byu.edu",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "help.lucid.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
