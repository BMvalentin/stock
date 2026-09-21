import type { NextConfig } from "next";

const nombreNube = process.env.CLOUDINARY_CLOUD_NAME;

const rutasAntiguas = [
  "productos",
  "categorias",
  "proveedores",
  "stock",
  "movimientos",
  "pedidos",
  "reportes",
  "empleados",
  "configuracion",
  "auditoria",
  "asistencia",
];

const nextConfig: NextConfig = {
  // Redirecciones temporales desde las rutas anteriores a su nueva ubicación
  // bajo /admin. Se conservan para no romper enlaces guardados.
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/admin",
        permanent: false,
      },
      ...rutasAntiguas.map((ruta) => ({
        source: `/${ruta}`,
        destination: `/admin/${ruta}`,
        permanent: false,
      })),
      ...rutasAntiguas.map((ruta) => ({
        source: `/${ruta}/:path*`,
        destination: `/admin/${ruta}/:path*`,
        permanent: false,
      })),
    ];
  },
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
  // El adaptador de Prisma y el driver `mariadb` usan APIs de Node y no deben
  // bundlearse: se resuelven con `require` nativo en el servidor.
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb"],
};

export default nextConfig;
