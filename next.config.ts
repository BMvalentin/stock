import type { NextConfig } from "next";

const nombreNube = process.env.CLOUDINARY_CLOUD_NAME;

const nextConfig: NextConfig = {
  experimental: {
    // Las imágenes de producto pueden pesar hasta 5 MB; el límite por defecto
    // de las Server Actions (1 MB) no alcanza para el body multipart.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: nombreNube ? `/${nombreNube}/**` : "/**",
      },
    ],
  },
};

export default nextConfig;
