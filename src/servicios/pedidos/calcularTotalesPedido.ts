import { prisma } from "@/lib/prisma/cliente";
import { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { UnidadVenta } from "@/generated/prisma/enums";

export type LineaCalculada = {
  productoId: string;
  nombreProducto: string;
  unidadVenta: UnidadVenta;
  precioUnitario: Prisma.Decimal;
  cantidad: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  unidadesPorBulto: number;
  stockActual: Prisma.Decimal;
};

export type TotalesPedido = {
  lineas: LineaCalculada[];
  subtotal: Prisma.Decimal;
};

// Resuelve el precio vigente de cada producto según el método de pago elegido y
// calcula los subtotales. El cliente nunca define precios: solo envía producto
// y cantidad. Valida la modalidad de venta (unidad entera, kg decimal) y que
// exista un precio configurado.
export async function calcularTotalesPedido(
  lineas: { productoId: string; cantidad: number }[],
  metodoPagoId: string,
): Promise<TotalesPedido> {
  const ids = lineas.map((linea) => linea.productoId);

  const productos = await prisma.producto.findMany({
    where: { id: { in: ids }, activo: true },
    select: {
      id: true,
      nombre: true,
      unidadVenta: true,
      unidadesPorBulto: true,
      stockActual: true,
      precios: {
        where: { metodoPagoId, activo: true },
        select: { precio: true },
      },
    },
  });

  const mapa = new Map(productos.map((producto) => [producto.id, producto]));
  const calculadas: LineaCalculada[] = [];

  for (const linea of lineas) {
    const producto = mapa.get(linea.productoId);

    if (!producto) {
      throw new ErrorNegocio(
        "Uno de los productos no existe o está inactivo.",
      );
    }

    const precio = producto.precios[0]?.precio;

    if (precio === undefined) {
      throw new ErrorNegocio(
        `No hay un precio configurado para ${producto.nombre} con el método de pago seleccionado.`,
      );
    }

    const cantidad = new Prisma.Decimal(linea.cantidad);

    if (cantidad.lte(0)) {
      throw new ErrorNegocio("La cantidad debe ser mayor a cero.");
    }

    if (producto.unidadVenta === "UNIDAD" && !cantidad.isInteger()) {
      throw new ErrorNegocio(
        `${producto.nombre} se vende por unidad: la cantidad debe ser un número entero.`,
      );
    }

    const subtotal = precio.mul(cantidad).toDecimalPlaces(2);

    calculadas.push({
      productoId: producto.id,
      nombreProducto: producto.nombre,
      unidadVenta: producto.unidadVenta,
      precioUnitario: precio,
      cantidad,
      subtotal,
      unidadesPorBulto: producto.unidadesPorBulto,
      stockActual: producto.stockActual,
    });
  }

  const subtotal = calculadas.reduce(
    (total, linea) => total.add(linea.subtotal),
    new Prisma.Decimal(0),
  );

  return { lineas: calculadas, subtotal };
}
