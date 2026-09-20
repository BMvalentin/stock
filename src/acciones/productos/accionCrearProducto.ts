"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { crearProducto } from "@/servicios/productos/crearProducto";
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

  try {
    const { id } = await crearProducto(
      { ...parseo.datos, stockInicial: parseo.stockInicial },
      usuario.id,
    );

    revalidatePath("/productos");
    revalidatePath("/stock");
    revalidatePath("/dashboard");
    return { exito: true, redirigir: `/productos/${id}` };
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }
}
