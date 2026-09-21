import { prisma } from "@/lib/prisma/cliente";
import { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { unidadStockProducto } from "@/lib/utilidades/unidadStockProducto";
import { calcularCantidadStockLinea } from "@/servicios/pedidos/calcularCantidadStockLinea";
import type { UnidadVenta } from "@/generated/prisma/enums";

export type LineaPedidoEntrada = {
  productoId: string;
  cantidad: number;
  // Modalidad elegida por el operador. Si falta, se usa la del producto. En un
  // producto con venta suelta, `UNIDAD` es la presentación y `KILOGRAMO` el
  // suelto.
  modalidad?: UnidadVenta;
};

export type LineaCalculada = {
  productoId: string;
  nombreProducto: string;
  // Modalidad vendida (se congela en el detalle del pedido).
  unidadVenta: UnidadVenta;
  // Unidad en la que se lleva el stock (para mensajes y formateo).
  unidadStock: UnidadVenta;
  // Peso de la presentación al momento de la venta (null si no aplica).
  pesoPresentacionKg: Prisma.Decimal | null;
  precioUnitario: Prisma.Decimal;
  cantidad: Prisma.Decimal;
  // Cantidad de stock que consume la línea, en la unidad de stock.
  cantidadStock: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  unidadesPorBulto: number;
  // Bultos equivalentes para el cálculo de envío POR_BULTO.
  bultos: Prisma.Decimal;
  stockActual: Prisma.Decimal;
};

export type TotalesPedido = {
  lineas: LineaCalculada[];
  subtotal: Prisma.Decimal;
};

// Resuelve el precio vigente de cada producto según el método de pago y la
// modalidad elegida, y calcula los subtotales. El cliente nunca define precios:
// solo envía producto, cantidad y modalidad. Valida la modalidad de venta
// (entero en presentación, kg decimal en suelto) y que exista precio.
export async function calcularTotalesPedido(
  lineas: LineaPedidoEntrada[],
  metodoPagoId: string,
): Promise<TotalesPedido> {
  const ids = lineas.map((linea) => linea.productoId);

  const productos = await prisma.producto.findMany({
    where: { id: { in: ids }, activo: true },
    select: {
      id: true,
      nombre: true,
      unidadVenta: true,
      permiteVentaSuelta: true,
      pesoPresentacionKg: true,
      unidadesPorBulto: true,
      stockActual: true,
      precios: {
        where: { metodoPagoId, activo: true },
        select: { precio: true },
      },
      preciosSuelto: {
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

    const modalidad = linea.modalidad ?? producto.unidadVenta;
    const esVentaSuelta = modalidad !== producto.unidadVenta;

    if (esVentaSuelta && !producto.permiteVentaSuelta) {
      throw new ErrorNegocio(
        `${producto.nombre} no admite venta suelta.`,
      );
    }

    const precio = esVentaSuelta
      ? producto.preciosSuelto[0]?.precio
      : producto.precios[0]?.precio;

    if (precio === undefined) {
      throw new ErrorNegocio(
        `No hay un precio configurado para ${producto.nombre} con el método de pago seleccionado.`,
      );
    }

    const cantidad = new Prisma.Decimal(linea.cantidad);

    if (cantidad.lte(0)) {
      throw new ErrorNegocio("La cantidad debe ser mayor a cero.");
    }

    if (modalidad === "UNIDAD" && !cantidad.isInteger()) {
      throw new ErrorNegocio(
        `${producto.nombre} se vende por unidad: la cantidad debe ser un número entero.`,
      );
    }

    const pesoPresentacionKg =
      producto.permiteVentaSuelta && producto.pesoPresentacionKg !== null
        ? producto.pesoPresentacionKg
        : null;

    const cantidadStock = calcularCantidadStockLinea(
      modalidad,
      cantidad,
      pesoPresentacionKg,
    );

    const bultos =
      pesoPresentacionKg !== null
        ? cantidadStock.div(pesoPresentacionKg)
        : cantidad.div(producto.unidadesPorBulto);

    const subtotal = precio.mul(cantidad).toDecimalPlaces(2);

    calculadas.push({
      productoId: producto.id,
      nombreProducto: producto.nombre,
      unidadVenta: modalidad,
      unidadStock: unidadStockProducto(producto),
      pesoPresentacionKg,
      precioUnitario: precio,
      cantidad,
      cantidadStock,
      subtotal,
      unidadesPorBulto: producto.unidadesPorBulto,
      bultos,
      stockActual: producto.stockActual,
    });
  }

  const subtotal = calculadas.reduce(
    (total, linea) => total.add(linea.subtotal),
    new Prisma.Decimal(0),
  );

  return { lineas: calculadas, subtotal };
}
