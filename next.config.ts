import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "cdn.movieofthenight.com",
      },
      {
        protocol: "https",
        hostname: "media.movieofthenight.com",
      },
      {
        protocol: "https",
        hostname: "*.movieofthenight.com",
      },
    ],
  },
};

export default nextConfig;
