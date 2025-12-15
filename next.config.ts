import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: false,
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_PATH
    ? "/" + process.env.NEXT_PUBLIC_PATH
    : undefined,
  transpilePackages: ["lucide-react"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  poweredByHeader: false,
  output: "standalone",
  images: {
    dangerouslyAllowLocalIP: true, //TODO: Revisar si se mueve en produccion
    remotePatterns: process.env.NEXT_PUBLIC_IMAGES_DOMAIN
      ? process.env.NEXT_PUBLIC_IMAGES_DOMAIN.split(",").map((domain) => ({
          protocol: domain === "localhost" ? "http" : "https",
          hostname: domain,
          pathname: "**",
        }))
      : [
          {
            protocol: "http",
            hostname: "localhost",
            pathname: "**",
          },
        ],
  },
};

export default withBundleAnalyzer(nextConfig);
