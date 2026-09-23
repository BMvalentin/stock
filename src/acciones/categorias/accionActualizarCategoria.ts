"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaCategoria } from "@/lib/validaciones/categorias";
import { actualizarCategoria } from "@/servicios/categorias/actualizarCategoria";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionActualizarCategoria(
  id: string,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaCategoria.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    await actualizarCategoria(id, resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidateTag("categorias", { expire: 0 });
  return { exito: true, mensaje: "Categoría actualizada." };
}
