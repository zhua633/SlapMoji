import type { NextConfig } from "next";

const defaultApiUrl = "https://slapmoji-backend.onrender.com";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl,
  },
  webpack(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve("stream-browserify"),
      events: require.resolve("events/"),
      buffer: require.resolve("buffer/"),
    };
    return config;
  },
};

export default nextConfig;
