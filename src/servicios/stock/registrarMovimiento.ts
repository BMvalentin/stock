import { prisma } from "@/lib/prisma/cliente";
import { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { signoMovimiento } from "@/servicios/stock/signoMovimiento";
import type { TipoMovimiento } from "@/generated/prisma/enums";

// Tipos que un administrador puede registrar manualmente. VENTA y DEVOLUCION
// los genera el flujo de pedidos, nunca la UI de stock.
const TIPOS_MANUALES: TipoMovimiento[] = [
  "INGRESO",
  "EGRESO",
  "AJUSTE_POSITIVO",
  "AJUSTE_NEGATIVO",
];

export type DatosMovimiento = {
  productoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string;
};

// Aplica un movimiento de stock de forma atómica. En egresos usa una condición
// `stockActual >= cantidad` para no dejar stock negativo ni perder escrituras
// concurrentes (el update y la lectura posterior corren en la misma transacción).
export async function registrarMovimiento(
  datos: DatosMovimiento,
  usuarioId: string,
): Promise<void> {
  if (!TIPOS_MANUALES.includes(datos.tipo)) {
    throw new ErrorNegocio("Ese tipo de movimiento no se registra manualmente.");
  }

  const cantidad = new Prisma.Decimal(datos.cantidad);

  if (cantidad.lte(0)) {
    throw new ErrorNegocio("La cantidad debe ser mayor a cero.");
  }

  await prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findUnique({
      where: { id: datos.productoId },
      select: { id: true, nombre: true, stockActual: true },
    });

    if (!producto) {
      throw new ErrorNegocio("El producto no existe.");
    }

    if (signoMovimiento(datos.tipo) > 0) {
      await tx.producto.update({
        where: { id: producto.id },
        data: { stockActual: { increment: cantidad } },
      });
    } else {
      const aplicado = await tx.producto.updateMany({
        where: { id: producto.id, stockActual: { gte: cantidad } },
        data: { stockActual: { decrement: cantidad } },
      });

      if (aplicado.count === 0) {
        throw new ErrorNegocio(
          `Stock insuficiente. Disponible: ${producto.stockActual.toString()}.`,
        );
      }
    }

    const actualizado = await tx.producto.findUniqueOrThrow({
      where: { id: producto.id },
      select: { stockActual: true },
    });

    const stockAnterior = producto.stockActual;
    const stockPosterior = actualizado.stockActual;

    await tx.movimientoStock.create({
      data: {
        productoId: producto.id,
        tipo: datos.tipo,
        cantidad,
        stockAnterior,
        stockPosterior,
        usuarioId,
        motivo: datos.motivo ?? null,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.STOCK_MODIFICADO,
        entidad: "Producto",
        entidadId: producto.id,
        datos: {
          producto: producto.nombre,
          tipo: datos.tipo,
          cantidad: cantidad.toString(),
          stockAnterior: stockAnterior.toString(),
          stockPosterior: stockPosterior.toString(),
        },
      },
      tx,
    );
  });
}
