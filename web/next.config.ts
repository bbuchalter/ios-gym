import path from "path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  distDir: 'out',
  turbopack: {
    root: path.resolve(__dirname, '..')  // Parent directory is the turbopack root
  }
};

export default nextConfig;
