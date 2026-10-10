import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@react-three/drei"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
