"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaCategoria } from "@/lib/validaciones/categorias";
import { crearCategoria } from "@/servicios/categorias/crearCategoria";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionCrearCategoria(
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
    await crearCategoria(resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/categorias");
  revalidatePath("/productos");
  return { exito: true, mensaje: "Categoría creada." };
}
