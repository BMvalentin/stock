import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Reutiliza una única instancia de PrismaClient por proceso para no agotar
// el pool de conexiones durante el hot-reload de desarrollo.
const globalParaPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function crearClientePrisma(): PrismaClient {
  const adaptador = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter: adaptador });
}

export const prisma = globalParaPrisma.prisma ?? crearClientePrisma();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
