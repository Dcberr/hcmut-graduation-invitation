import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [{ source: "/moi/:id", destination: "/invitation/:id", permanent: true }];
  },
};

export default nextConfig;
