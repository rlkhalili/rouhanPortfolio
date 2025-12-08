import type { NextConfig } from "next";

// sitenxt/next.config.ts
const repoBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const outputMode = process.env.NEXT_OUTPUT;

const nextConfig: NextConfig = {
  ...(outputMode ? { output: outputMode } : {}),
  basePath: repoBase ? `/${repoBase}` : undefined,
  assetPrefix: repoBase ? `/${repoBase}/` : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  reactCompiler: true,
};
export default nextConfig;
