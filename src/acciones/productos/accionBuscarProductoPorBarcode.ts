"use server";

import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { esquemaBarcode } from "@/lib/validaciones/productos";
import {
  buscarProductoPorBarcode,
  type ProductoPorBarcode,
} from "@/servicios/productos/buscarProductoPorBarcode";

export type ResultadoBusquedaBarcode =
  | { ok: true; producto: ProductoPorBarcode | null }
  | { ok: false; error: string };

// Búsqueda segura de un producto por código de barras. La consulta se hace en
// el servidor: el cliente nunca accede a Prisma. ADMIN y EMPLEADO pueden
// consultar (el escaneo es de lectura).
export async function accionBuscarProductoPorBarcode(
  barcodeCrudo: string,
): Promise<ResultadoBusquedaBarcode> {
  await requerirSesion();

  const parseo = esquemaBarcode.safeParse(barcodeCrudo);

  if (!parseo.success) {
    return { ok: false, error: "El código de barras no es válido." };
  }

  const producto = await buscarProductoPorBarcode(parseo.data);

  return { ok: true, producto };
}
