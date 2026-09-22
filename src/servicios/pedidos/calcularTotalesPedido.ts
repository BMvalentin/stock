import { prisma } from "@/lib/prisma/cliente";
import { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { unidadStockProducto } from "@/lib/utilidades/unidadStockProducto";
import { calcularCantidadStockLinea } from "@/servicios/pedidos/calcularCantidadStockLinea";
import {
  calcularPrecioLinea,
  type DesglosePrecio,
  type ReglaPrecioResoluble,
} from "@/servicios/precios/calcularPrecioLinea";
import type { UnidadVenta } from "@/generated/prisma/enums";

export type LineaPedidoEntrada = {
  productoId: string;
  cantidad: number;
  // Modalidad de venta elegida (bolsa, suelto, unidad...). Obligatoria.
  modalidadId: string;
};

export type LineaCalculada = {
  productoId: string;
  nombreProducto: string;
  modalidadId: string;
  // Nombre de la modalidad vendida (se congela en el detalle del pedido).
  modalidadNombre: string;
  // Unidad en la que se vende (define el precio y la cantidad).
  unidadVenta: UnidadVenta;
  // Unidad en la que se lleva el stock (para mensajes y formateo).
  unidadStock: UnidadVenta;
  // Stock que consume una unidad de la modalidad (null = 1).
  contenido: Prisma.Decimal | null;
  precioUnitario: Prisma.Decimal;
  cantidad: Prisma.Decimal;
  // Cantidad de stock que consume la línea, en la unidad de stock.
  cantidadStock: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  // Desglose de las reglas aplicadas (tramos/promociones).
  desglose: DesglosePrecio;
  unidadesPorBulto: number;
  // Bultos equivalentes para el cálculo de envío POR_BULTO.
  bultos: Prisma.Decimal;
  stockActual: Prisma.Decimal;
};

export type TotalesPedido = {
  lineas: LineaCalculada[];
  subtotal: Prisma.Decimal;
};

// Resuelve el precio vigente de cada producto según la modalidad elegida y el
// método de pago, y calcula los subtotales. El cliente nunca define precios:
// solo envía producto, cantidad y modalidad. El motor de precios aplica las
// escalas por cantidad y las promociones configuradas.
export async function calcularTotalesPedido(
  lineas: LineaPedidoEntrada[],
  metodoPagoId: string,
): Promise<TotalesPedido> {
  const ids = [...new Set(lineas.map((linea) => linea.productoId))];

  const productos = await prisma.producto.findMany({
    where: { id: { in: ids }, activo: true },
    select: {
      id: true,
      nombre: true,
      unidadStock: true,
      unidadesPorBulto: true,
      stockActual: true,
      modalidades: {
        where: { activo: true },
        select: {
          id: true,
          nombre: true,
          unidadVenta: true,
          contenido: true,
          esBase: true,
          reglas: {
            where: { activo: true },
            select: {
              id: true,
              metodoPagoId: true,
              cantidadDesde: true,
              cantidadHasta: true,
              tipoPrecio: true,
              precio: true,
              prioridad: true,
            },
          },
        },
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

    const modalidad = producto.modalidades.find(
      (actual) => actual.id === linea.modalidadId,
    );

    if (!modalidad) {
      throw new ErrorNegocio(
        `${producto.nombre} no tiene esa modalidad de venta.`,
      );
    }

    const cantidad = new Prisma.Decimal(linea.cantidad);

    if (cantidad.lte(0)) {
      throw new ErrorNegocio("La cantidad debe ser mayor a cero.");
    }

    if (modalidad.unidadVenta === "UNIDAD" && !cantidad.isInteger()) {
      throw new ErrorNegocio(
        `${producto.nombre} se vende por unidad: la cantidad debe ser un número entero.`,
      );
    }

    const reglas: ReglaPrecioResoluble[] = modalidad.reglas.map((regla) => ({
      id: regla.id,
      metodoPagoId: regla.metodoPagoId,
      cantidadDesde: Number(regla.cantidadDesde),
      cantidadHasta:
        regla.cantidadHasta === null ? null : Number(regla.cantidadHasta),
      tipoPrecio: regla.tipoPrecio,
      precio: Number(regla.precio),
      prioridad: regla.prioridad,
    }));

    const precio = calcularPrecioLinea(
      reglas,
      metodoPagoId,
      cantidad.toNumber(),
    );

    if (!precio) {
      throw new ErrorNegocio(
        `No hay un precio configurado para ${producto.nombre} (${modalidad.nombre}) con el método de pago seleccionado.`,
      );
    }

    const cantidadStock = calcularCantidadStockLinea(
      modalidad.contenido,
      cantidad,
    );

    const base =
      producto.modalidades.find((actual) => actual.esBase) ??
      producto.modalidades[0];
    const contenidoBase = base?.contenido ?? null;

    const bultos =
      contenidoBase !== null && Number(contenidoBase) > 0
        ? cantidadStock.div(contenidoBase)
        : cantidad.div(producto.unidadesPorBulto);

    calculadas.push({
      productoId: producto.id,
      nombreProducto: producto.nombre,
      modalidadId: modalidad.id,
      modalidadNombre: modalidad.nombre,
      unidadVenta: modalidad.unidadVenta,
      unidadStock: unidadStockProducto(producto),
      contenido: modalidad.contenido,
      precioUnitario: new Prisma.Decimal(precio.precioUnitario),
      cantidad,
      cantidadStock,
      subtotal: new Prisma.Decimal(precio.subtotal),
      desglose: precio.desglose,
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
