"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import {
  actualizarProducto,
  type OperacionImagenProducto,
} from "@/servicios/productos/actualizarProducto";
import { subirImagenProducto } from "@/servicios/productos/subirImagenProducto";
import { eliminarRecursoImagen } from "@/servicios/productos/eliminarRecursoImagen";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { parsearProducto } from "@/acciones/productos/parsearProducto";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionActualizarProducto(
  id: string,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();
  const parseo = await parsearProducto(formData);

  if (!parseo.ok) {
    return { errores: parseo.errores };
  }

  let operacion: OperacionImagenProducto = { tipo: "mantener" };
  let imagenSubida: { url: string; publicId: string } | undefined;

  try {
    if (parseo.imagenArchivo) {
      imagenSubida = await subirImagenProducto(parseo.imagenArchivo);
      operacion = { tipo: "establecer", ...imagenSubida };
    } else if (parseo.eliminarImagen) {
      operacion = { tipo: "eliminar" };
    }
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  let actualizado = false;

  try {
    const { publicIdAnterior } = await actualizarProducto(
      id,
      parseo.datos,
      usuario.id,
      operacion,
    );
    actualizado = true;

    // El recurso anterior se elimina después del commit. Es best-effort: si
    // falla, el producto ya quedó consistente y solo resta un huérfano.
    if (publicIdAnterior && publicIdAnterior !== imagenSubida?.publicId) {
      await eliminarRecursoImagen(publicIdAnterior);
    }

    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${id}`);
    revalidatePath("/admin");
    return { exito: true, redirigir: `/admin/productos/${id}` };
  } catch (error) {
    // Si la actualización falla antes del commit, se elimina la imagen nueva
    // para no dejar un recurso huérfano.
    if (imagenSubida && !actualizado) {
      await eliminarRecursoImagen(imagenSubida.publicId);
    }

    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }
}
