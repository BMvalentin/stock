import { z } from "zod";
import {
  esquemaModalidades,
  esquemaProducto,
  esquemaStockInicial,
} from "@/lib/validaciones/productos";
import { validarImagenProducto } from "@/lib/validaciones/imagenes";
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
// servicio. Las modalidades y sus reglas de precio llegan serializadas en JSON
// (campo `modalidades`). Compartido por las acciones de creación y edición.
export async function parsearProducto(
  formData: FormData,
): Promise<ResultadoParseoProducto> {
  const resultado = esquemaProducto.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    sku: formData.get("sku") ?? "",
    barcode: formData.get("barcode") ?? "",
    categoriaId: formData.get("categoriaId"),
    stockMinimo: formData.get("stockMinimo"),
    unidadesPorBulto: formData.get("unidadesPorBulto"),
  });

  if (!resultado.success) {
    return { ok: false, errores: z.flattenError(resultado.error).fieldErrors };
  }

  const crudo = formData.get("modalidades");
  let modalidadesCrudas: unknown = [];

  if (typeof crudo === "string" && crudo.trim().length > 0) {
    try {
      modalidadesCrudas = JSON.parse(crudo);
    } catch {
      return {
        ok: false,
        errores: { modalidades: ["Los datos de modalidades son inválidos."] },
      };
    }
  }

  const modalidadesResultado = esquemaModalidades.safeParse(modalidadesCrudas);

  if (!modalidadesResultado.success) {
    return {
      ok: false,
      errores: {
        modalidades: [
          modalidadesResultado.error.issues[0]?.message ??
            "Revisá las modalidades y precios.",
        ],
      },
    };
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
      stockMinimo: resultado.data.stockMinimo,
      unidadesPorBulto: resultado.data.unidadesPorBulto,
      modalidades: modalidadesResultado.data,
      proveedorIds,
      proveedorPrincipalId,
    },
  };
}
