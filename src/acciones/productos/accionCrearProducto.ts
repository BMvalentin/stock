"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { crearProducto } from "@/servicios/productos/crearProducto";
import { subirImagenProducto } from "@/servicios/productos/subirImagenProducto";
import { eliminarRecursoImagen } from "@/servicios/productos/eliminarRecursoImagen";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { parsearProducto } from "@/acciones/productos/parsearProducto";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionCrearProducto(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();
  const parseo = await parsearProducto(formData);

  if (!parseo.ok) {
    return { errores: parseo.errores };
  }

  let imagen: { url: string; publicId: string } | undefined;

  try {
    if (parseo.imagenArchivo) {
      imagen = await subirImagenProducto(parseo.imagenArchivo);
    }

    const { id } = await crearProducto(
      { ...parseo.datos, stockInicial: parseo.stockInicial, imagen },
      usuario.id,
    );

    revalidatePath("/productos");
    revalidatePath("/stock");
    revalidatePath("/dashboard");
    return { exito: true, redirigir: `/productos/${id}` };
  } catch (error) {
    // Si la creación falla después de subir, se elimina el recurso recién
    // subido para no dejar imágenes huérfanas.
    if (imagen) await eliminarRecursoImagen(imagen.publicId);

    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }
}
