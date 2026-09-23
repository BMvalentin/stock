"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaConfiguracionGeneral } from "@/lib/validaciones/configuracion";
import { actualizarConfiguracionGeneral } from "@/servicios/configuracion/actualizarConfiguracionGeneral";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionActualizarConfiguracionGeneral(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaConfiguracionGeneral.safeParse({
    nombreComercio: formData.get("nombreComercio"),
    moneda: formData.get("moneda"),
    locale: formData.get("locale"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    await actualizarConfiguracionGeneral(resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin");
  revalidateTag("configuracion", { expire: 0 });
  return { exito: true, mensaje: "Configuración general actualizada." };
}
