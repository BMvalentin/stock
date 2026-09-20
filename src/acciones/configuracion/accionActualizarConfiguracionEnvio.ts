"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaConfiguracionEnvio } from "@/lib/validaciones/configuracion";
import { actualizarConfiguracionEnvio } from "@/servicios/configuracion/actualizarConfiguracionEnvio";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionActualizarConfiguracionEnvio(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaConfiguracionEnvio.safeParse({
    tipo: formData.get("tipo"),
    precio: formData.get("precio"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    await actualizarConfiguracionEnvio(resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/configuracion");
  return { exito: true, mensaje: "Configuración de envío actualizada." };
}
