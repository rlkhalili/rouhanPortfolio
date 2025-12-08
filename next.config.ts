import type { NextConfig } from "next";

// sitenxt/next.config.ts
const repoBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const outputMode = "export";

const nextConfig: NextConfig = {
  output: outputMode,
  basePath: repoBase ? `/${repoBase}` : undefined,
  assetPrefix: repoBase ? `/${repoBase}/` : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  reactCompiler: true,
};
export default nextConfig;
