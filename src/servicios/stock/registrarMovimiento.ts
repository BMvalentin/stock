import { prisma } from "@/lib/prisma/cliente";
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

export async function registrarMovimiento(
  datos: DatosMovimiento,
  usuarioId: string,
): Promise<void> {
  if (!TIPOS_MANUALES.includes(datos.tipo)) {
    throw new ErrorNegocio("Ese tipo de movimiento no se registra manualmente.");
  }

  if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) {
    throw new ErrorNegocio("La cantidad debe ser un entero mayor a cero.");
  }

  await prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findUnique({
      where: { id: datos.productoId },
      select: { id: true, nombre: true, stockActual: true },
    });

    if (!producto) {
      throw new ErrorNegocio("El producto no existe.");
    }

    const stockPosterior =
      producto.stockActual + signoMovimiento(datos.tipo) * datos.cantidad;

    if (stockPosterior < 0) {
      throw new ErrorNegocio(
        `Stock insuficiente. Disponible: ${producto.stockActual}.`,
      );
    }

    await tx.producto.update({
      where: { id: producto.id },
      data: { stockActual: stockPosterior },
    });

    await tx.movimientoStock.create({
      data: {
        productoId: producto.id,
        tipo: datos.tipo,
        cantidad: datos.cantidad,
        stockAnterior: producto.stockActual,
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
          cantidad: datos.cantidad,
          stockAnterior: producto.stockActual,
          stockPosterior,
        },
      },
      tx,
    );
  });
}
