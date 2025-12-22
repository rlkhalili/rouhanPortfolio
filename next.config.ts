import type { NextConfig } from "next";

// sitenxt/next.config.ts
const repoBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const outputMode: NextConfig["output"] =
  process.env.NEXT_OUTPUT === "standalone" ||
  process.env.NEXT_OUTPUT === "export"
    ? process.env.NEXT_OUTPUT
    : undefined;
const allowedDevOrigins = process.env.NEXT_ALLOWED_DEV_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  ...(outputMode ? { output: outputMode } : {}),
  ...(allowedDevOrigins ? { allowedDevOrigins } : {}),
  basePath: repoBase ? `/${repoBase}` : undefined,
  assetPrefix: repoBase ? `/${repoBase}/` : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  reactCompiler: true,
};
export default nextConfig;
