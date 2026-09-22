import Link from "next/link";
import type { DetallePedidoItem } from "@/servicios/pedidos/obtenerPedido";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearCantidad } from "@/lib/utilidades/formatearCantidad";
import { etiquetaModalidadLinea } from "@/lib/utilidades/etiquetaModalidadLinea";
import { sufijoPrecioModalidadLinea } from "@/lib/utilidades/sufijoPrecioModalidadLinea";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";

// Productos del pedido. En desktop se muestra la tabla; en mobile, una tarjeta
// por producto. Ambas vistas comparten el mismo cálculo de modalidad, precio y
// cantidad para no duplicar lógica.
export function ProductosPedido({
  detalles,
  moneda,
  locale,
}: {
  detalles: DetallePedidoItem[];
  moneda: string;
  locale: string;
}) {
  const lineas = detalles.map((detalle) => {
    const contenido = detalle.contenido ?? detalle.pesoPresentacionKg;
    const esBolsa = contenido !== null && detalle.unidadVenta === "UNIDAD";

    return {
      id: detalle.id,
      productoId: detalle.productoId,
      nombreProducto: detalle.nombreProducto,
      modalidad: etiquetaModalidadLinea({
        modalidadNombre: detalle.modalidadNombre,
        unidadVenta: detalle.unidadVenta,
        contenido: detalle.contenido,
        pesoPresentacionKg: detalle.pesoPresentacionKg,
      }),
      presentacion: esBolsa ? ` · Presentación ${contenido} kg` : "",
      precio: `${formatearMoneda(detalle.precioUnitario, moneda, locale)} ${sufijoPrecioModalidadLinea(
        {
          unidadVenta: detalle.unidadVenta,
          contenido: detalle.contenido,
          pesoPresentacionKg: detalle.pesoPresentacionKg,
        },
      )}`.trim(),
      cantidad: esBolsa
        ? `${detalle.cantidad} ${detalle.cantidad === 1 ? "bolsa" : "bolsas"}`
        : formatearCantidad(detalle.cantidad, detalle.unidadVenta, locale),
      subtotal: formatearMoneda(detalle.subtotal, moneda, locale),
    };
  });

  return (
    <>
      <div className="hidden md:block">
        <TablaDatos
          columnas={[
            { encabezado: "Producto" },
            { encabezado: "Precio unitario", alineacion: "der" },
            { encabezado: "Cantidad", alineacion: "der" },
            { encabezado: "Subtotal", alineacion: "der" },
          ]}
          filas={lineas.map((linea) => ({
            id: linea.id,
            celdas: [
              <div key="nombre" className="min-w-0">
                <Link
                  href={`/admin/productos/${linea.productoId}`}
                  className="text-sm text-zinc-800 hover:underline"
                >
                  {linea.nombreProducto}
                </Link>
                <p className="text-xs text-zinc-500">
                  Venta: {linea.modalidad}
                  {linea.presentacion}
                </p>
              </div>,
              <span key="precio" className="whitespace-nowrap">
                {linea.precio}
              </span>,
              <span key="cantidad" className="whitespace-nowrap">
                {linea.cantidad}
              </span>,
              <span key="subtotal" className="font-medium text-zinc-900">
                {linea.subtotal}
              </span>,
            ],
          }))}
        />
      </div>

      <ul className="space-y-3 md:hidden">
        {lineas.map((linea) => (
          <li
            key={linea.id}
            className="rounded-lg border border-zinc-200 p-4"
          >
            <Link
              href={`/admin/productos/${linea.productoId}`}
              className="block min-w-0 break-words text-sm font-medium text-zinc-900 hover:underline"
            >
              {linea.nombreProducto}
            </Link>
            <p className="mt-1 break-words text-xs text-zinc-500">
              Venta: {linea.modalidad}
              {linea.presentacion}
            </p>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-zinc-500">Precio</dt>
                <dd className="min-w-0 break-words text-right text-zinc-800">
                  {linea.precio}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-zinc-500">Cantidad</dt>
                <dd className="min-w-0 break-words text-right text-zinc-800">
                  {linea.cantidad}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-zinc-100 pt-2">
                <dt className="font-medium text-zinc-900">Subtotal</dt>
                <dd className="text-right font-semibold text-zinc-900">
                  {linea.subtotal}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
