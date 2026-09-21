"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaMetodoPago } from "@/lib/validaciones/configuracion";
import { crearMetodoPago } from "@/servicios/configuracion/crearMetodoPago";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionCrearMetodoPago(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaMetodoPago.safeParse({
    codigo: formData.get("codigo"),
    nombre: formData.get("nombre"),
    orden: formData.get("orden"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    await crearMetodoPago(resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/productos");
  return { exito: true, mensaje: "Método de pago creado." };
}
