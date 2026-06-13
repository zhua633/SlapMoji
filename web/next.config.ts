import type { NextConfig } from "next";

const defaultApiUrl = "https://slapmoji-backend.onrender.com";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl,
  },
};

export default nextConfig;
