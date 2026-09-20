import { z } from "zod";
import {
  esquemaPrecioProducto,
  esquemaProducto,
  esquemaStockInicial,
} from "@/lib/validaciones/productos";
import { listarMetodosPagoActivos } from "@/servicios/metodosPago/listarMetodosPagoActivos";
import type { DatosProducto } from "@/servicios/productos/crearProducto";

export type ResultadoParseoProducto =
  | { ok: true; datos: DatosProducto; stockInicial: number }
  | { ok: false; errores: Record<string, string[]> };

// Traduce el FormData del formulario de producto a los datos validados del
// servicio. Compartido por las acciones de creación y edición.
export async function parsearProducto(
  formData: FormData,
): Promise<ResultadoParseoProducto> {
  const resultado = esquemaProducto.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    sku: formData.get("sku"),
    categoriaId: formData.get("categoriaId"),
    stockMinimo: formData.get("stockMinimo"),
    unidadesPorBulto: formData.get("unidadesPorBulto"),
  });

  if (!resultado.success) {
    return { ok: false, errores: z.flattenError(resultado.error).fieldErrors };
  }

  const metodos = await listarMetodosPagoActivos();
  const precios: DatosProducto["precios"] = [];
  const erroresPrecios: Record<string, string[]> = {};

  for (const metodo of metodos) {
    const parseo = esquemaPrecioProducto.safeParse({
      metodoPagoId: metodo.id,
      precio: formData.get(`precio_${metodo.id}`),
    });

    if (!parseo.success) {
      erroresPrecios[`precio_${metodo.id}`] = ["Precio inválido"];
      continue;
    }

    precios.push(parseo.data);
  }

  if (Object.keys(erroresPrecios).length > 0) {
    return { ok: false, errores: erroresPrecios };
  }

  const stock = esquemaStockInicial.safeParse(
    formData.get("stockInicial") ?? "0",
  );
  const stockInicial = stock.success ? stock.data : 0;

  const proveedorIds = formData
    .getAll("proveedorIds")
    .map(String)
    .filter(Boolean);
  const principalCrudo = formData.get("proveedorPrincipalId");
  const proveedorPrincipalId =
    typeof principalCrudo === "string" &&
    proveedorIds.includes(principalCrudo)
      ? principalCrudo
      : undefined;

  return {
    ok: true,
    stockInicial,
    datos: {
      nombre: resultado.data.nombre,
      descripcion: resultado.data.descripcion,
      sku: resultado.data.sku,
      categoriaId: resultado.data.categoriaId,
      stockMinimo: resultado.data.stockMinimo,
      unidadesPorBulto: resultado.data.unidadesPorBulto,
      precios,
      proveedorIds,
      proveedorPrincipalId,
    },
  };
}
