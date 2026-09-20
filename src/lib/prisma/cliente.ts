import { PrismaClient } from "@/generated/prisma/client";
import { crearAdaptador } from "@/lib/prisma/crearAdaptador";

// Reutiliza una única instancia de PrismaClient por proceso para no agotar
// el pool de conexiones durante el hot-reload de desarrollo.
const globalParaPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function crearClientePrisma(): PrismaClient {
  return new PrismaClient({ adapter: crearAdaptador() });
}

export const prisma = globalParaPrisma.prisma ?? crearClientePrisma();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
