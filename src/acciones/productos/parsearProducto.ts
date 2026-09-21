import { z } from "zod";
import {
  esquemaPrecioProducto,
  esquemaPrecioProductoSuelto,
  esquemaProducto,
  esquemaStockInicial,
} from "@/lib/validaciones/productos";
import { validarImagenProducto } from "@/lib/validaciones/imagenes";
import { listarMetodosPagoActivos } from "@/servicios/metodosPago/listarMetodosPagoActivos";
import type { DatosProducto } from "@/servicios/productos/crearProducto";

export type ResultadoParseoProducto =
  | {
      ok: true;
      datos: DatosProducto;
      stockInicial: number;
      imagenArchivo?: File;
      eliminarImagen: boolean;
    }
  | { ok: false; errores: Record<string, string[]> };

// Traduce el FormData del formulario de producto a los datos validados del
// servicio. Compartido por las acciones de creación y edición.
export async function parsearProducto(
  formData: FormData,
): Promise<ResultadoParseoProducto> {
  const resultado = esquemaProducto.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    sku: formData.get("sku") ?? "",
    barcode: formData.get("barcode") ?? "",
    categoriaId: formData.get("categoriaId"),
    unidadVenta: formData.get("unidadVenta") ?? "UNIDAD",
    permiteVentaSuelta: formData.get("permiteVentaSuelta") === "on",
    pesoPresentacionKg: formData.get("pesoPresentacionKg"),
    stockMinimo: formData.get("stockMinimo"),
    unidadesPorBulto: formData.get("unidadesPorBulto"),
  });

  if (!resultado.success) {
    return { ok: false, errores: z.flattenError(resultado.error).fieldErrors };
  }

  const archivoCrudo = formData.get("imagen");
  const imagenArchivo =
    archivoCrudo instanceof File && archivoCrudo.size > 0
      ? archivoCrudo
      : undefined;

  if (imagenArchivo) {
    const validacion = validarImagenProducto(imagenArchivo);

    if (!validacion.valida) {
      return { ok: false, errores: { imagen: [validacion.mensaje] } };
    }
  }

  const eliminarImagen = formData.get("imagenEliminar") === "1";

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

  // Precios de venta suelta: solo se exigen si la modalidad está habilitada.
  const preciosSuelto: DatosProducto["preciosSuelto"] = [];
  const erroresPreciosSuelto: Record<string, string[]> = {};

  if (resultado.data.permiteVentaSuelta) {
    for (const metodo of metodos) {
      const parseo = esquemaPrecioProductoSuelto.safeParse({
        metodoPagoId: metodo.id,
        precio: formData.get(`precioSuelto_${metodo.id}`),
      });

      if (!parseo.success) {
        erroresPreciosSuelto[`precioSuelto_${metodo.id}`] = [
          "Precio por kg inválido",
        ];
        continue;
      }

      preciosSuelto.push(parseo.data);
    }

    if (Object.keys(erroresPreciosSuelto).length > 0) {
      return { ok: false, errores: erroresPreciosSuelto };
    }
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
    imagenArchivo,
    eliminarImagen,
    datos: {
      nombre: resultado.data.nombre,
      descripcion: resultado.data.descripcion,
      sku: resultado.data.sku ?? null,
      barcode: resultado.data.barcode,
      categoriaId: resultado.data.categoriaId,
      unidadVenta: resultado.data.unidadVenta,
      permiteVentaSuelta: resultado.data.permiteVentaSuelta,
      pesoPresentacionKg: resultado.data.pesoPresentacionKg,
      stockMinimo: resultado.data.stockMinimo,
      unidadesPorBulto: resultado.data.unidadesPorBulto,
      precios,
      preciosSuelto,
      proveedorIds,
      proveedorPrincipalId,
    },
  };
}
