import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { crearAdaptador } from "../../src/lib/prisma/crearAdaptador";

// Orden de borrado: primero los hijos, después los padres. Respetar el orden es
// obligatorio porque varias tablas referencian a Producto, Pedido, Empleado,
// Proveedor y Categoria. `deleteMany` es idempotente: volver a ejecutarlo no
// rompe nada.
const MODELOS_A_LIMPIAR = [
  "detallePedido",
  "pago",
  "movimientoStock",
  "pedido",
  "precioProductoHistorial",
  "precioProducto",
  "productoProveedor",
  "empleadoTarifaProducto",
  "empleadoProduccion",
  "empleadoAsistencia",
  "empleadoLiquidacion",
  "producto",
  "cuentaPagoProveedor",
  "proveedor",
  "categoria",
  "tokenFichajeQR",
  "auditoria",
  "empleado",
] as const;

// Nunca se tocan: usuarios, credenciales/cuentas OAuth y configuración global
// necesaria para que la aplicación funcione.
const MODELOS_CONSERVADOS = [
  "user",
  "account",
  "session",
  "verificationToken",
  "metodoPago",
  "configuracionGeneral",
  "configuracionEnvio",
] as const;

type DelegadoModelo = {
  count: () => Promise<number>;
  deleteMany: () => Promise<{ count: number }>;
};

function obtenerDelegado(
  cliente: unknown,
  modelo: string,
): DelegadoModelo {
  const delegado = (cliente as Record<string, unknown>)[modelo];
  return delegado as DelegadoModelo;
}

function describirConexion(): string {
  const cadena = process.env.DATABASE_URL;

  if (!cadena) return "DATABASE_URL no definida";

  const url = new URL(cadena);
  return `${url.hostname}:${url.port || "3306"}/${url.pathname.replace(/^\//, "")}`;
}

async function mostrarConteos(prisma: PrismaClient): Promise<void> {
  console.log("Conteo actual de modelos a limpiar:");
  for (const modelo of MODELOS_A_LIMPIAR) {
    console.log(`  ${modelo.padEnd(26)} ${await obtenerDelegado(prisma, modelo).count()}`);
  }

  console.log("\nConteo actual de modelos a conservar:");
  for (const modelo of MODELOS_CONSERVADOS) {
    console.log(`  ${modelo.padEnd(26)} ${await obtenerDelegado(prisma, modelo).count()}`);
  }
}

async function limpiarDatosPrueba(prisma: PrismaClient): Promise<void> {
  const borrados = await prisma.$transaction(
    async (tx) => {
      const resultado: Array<{ modelo: string; cantidad: number }> = [];

      for (const modelo of MODELOS_A_LIMPIAR) {
        const { count } = await obtenerDelegado(tx, modelo).deleteMany();
        resultado.push({ modelo, cantidad: count });
      }

      return resultado;
    },
    { timeout: 120_000, maxWait: 15_000 },
  );

  console.log("\nFilas eliminadas:");
  for (const { modelo, cantidad } of borrados) {
    console.log(`  ${modelo.padEnd(26)} ${cantidad}`);
  }
}

async function verificar(prisma: PrismaClient): Promise<void> {
  console.log("\nVerificación posterior:");

  let correcto = true;

  for (const modelo of MODELOS_A_LIMPIAR) {
    const restantes = await obtenerDelegado(prisma, modelo).count();

    if (restantes !== 0) {
      correcto = false;
      console.log(`  ERROR ${modelo}: quedan ${restantes} registros`);
    }
  }

  const usuarios = await obtenerDelegado(prisma, "user").count();
  const cuentas = await obtenerDelegado(prisma, "account").count();

  console.log(`  usuarios conservados: ${usuarios}`);
  console.log(`  cuentas OAuth conservadas: ${cuentas}`);

  if (usuarios === 0) {
    correcto = false;
    console.log("  ERROR: no quedaron usuarios registrados");
  }

  console.log(
    correcto
      ? "\nLimpieza completada correctamente."
      : "\nLimpieza finalizada con advertencias (revisar arriba).",
  );
}

async function main(): Promise<void> {
  const prisma = new PrismaClient({ adapter: crearAdaptador() });
  const confirmado = process.argv.includes("--confirmar");

  try {
    console.log(`Conexión: ${describirConexion()}`);

    if (!confirmado) {
      console.log(
        "\nModo simulación. No se elimina nada. Ejecutá con --confirmar para limpiar.",
      );
      await mostrarConteos(prisma);
      return;
    }

    await limpiarDatosPrueba(prisma);
    await verificar(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Error durante la limpieza:", error);
  process.exitCode = 1;
});
