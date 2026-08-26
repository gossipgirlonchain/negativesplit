import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // there is a stray lockfile above this directory; pin the root so the
  // build does not go looking for one and pick the wrong workspace
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
