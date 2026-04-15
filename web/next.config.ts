import type { NextConfig } from "next";

const defaultApiUrl = "https://slapmoji-production.up.railway.app";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl,
  },
};

export default nextConfig;
