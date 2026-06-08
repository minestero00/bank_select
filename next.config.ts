import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/bankSelect" : "",
  assetPrefix: isProd ? "/bankSelect/" : "",
  images: { unoptimized: true },
};

export default nextConfig;
