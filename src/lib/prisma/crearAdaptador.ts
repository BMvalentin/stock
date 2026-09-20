import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Traduce DATABASE_URL (formato MySQL/TiDB) a la configuración del driver
// `mariadb`, adaptador oficial de Prisma para MySQL/MariaDB. El CLI de Prisma
// usa `sslaccept`, pero el driver `mariadb` espera `ssl`, por eso se traduce.
export function crearAdaptador(): PrismaMariaDb {
  const cadena = process.env.DATABASE_URL;

  if (!cadena) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  }

  const url = new URL(cadena);
  const usaTls = url.searchParams.get("sslaccept") === "strict";

  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: Number(url.searchParams.get("connection_limit") ?? 10),
    connectTimeout: 10_000,
    ...(usaTls ? { ssl: { rejectUnauthorized: true } } : {}),
  });
}
