"use server";

import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import {
  buscarProductosParaPedido,
  type ProductoParaPedido,
} from "@/servicios/productos/buscarProductosParaPedido";

export type ResultadoBusquedaProductos =
  | { ok: true; productos: ProductoParaPedido[] }
  | { ok: false; error: string };

// Búsqueda de productos para armar un pedido. Es de lectura: alcanza con sesión
// válida. El precio se usa solo como referencia visual; el servidor lo recalcula
// al crear el pedido.
export async function accionBuscarProductosPedido(
  busqueda: string,
): Promise<ResultadoBusquedaProductos> {
  await requerirSesion();

  if (typeof busqueda !== "string" || busqueda.trim().length < 2) {
    return { ok: true, productos: [] };
  }

  const productos = await buscarProductosParaPedido(busqueda);

  return { ok: true, productos };
}
