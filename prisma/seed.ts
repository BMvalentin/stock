import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adaptador = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter: adaptador });

async function main(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? "admin@ejemplo.com")
    .trim()
    .toLowerCase();
  const contrasena = process.env.ADMIN_PASSWORD ?? "cambiar-esta-clave";
  const passwordHash = await bcrypt.hash(contrasena, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { rol: "ADMIN", activo: true, passwordHash },
    create: {
      email,
      name: "Administrador",
      rol: "ADMIN",
      activo: true,
      passwordHash,
    },
  });

  const metodosPago = [
    { codigo: "EFECTIVO", nombre: "Efectivo", orden: 1 },
    { codigo: "TRANSFERENCIA", nombre: "Transferencia", orden: 2 },
  ];

  for (const metodo of metodosPago) {
    await prisma.metodoPago.upsert({
      where: { codigo: metodo.codigo },
      update: { nombre: metodo.nombre, orden: metodo.orden },
      create: metodo,
    });
  }

  const configuracionEnvio = await prisma.configuracionEnvio.findFirst();

  if (!configuracionEnvio) {
    await prisma.configuracionEnvio.create({
      data: { tipo: "TARIFA_FIJA", precio: 0, activo: true },
    });
  }

  console.log(`Seed completado. Administrador: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Error en el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
