"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaRemuneracion } from "@/lib/validaciones/remuneracion";
import { actualizarRemuneracion } from "@/servicios/empleados/actualizarRemuneracion";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionActualizarRemuneracion(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaRemuneracion.safeParse({
    empleadoId: formData.get("empleadoId"),
    tipoRemuneracion: formData.get("tipoRemuneracion"),
    horasJornada: formData.get("horasJornada"),
    pagoJornada: formData.get("pagoJornada"),
    horaEntradaEsperada: formData.get("horaEntradaEsperada"),
    horaSalidaEsperada: formData.get("horaSalidaEsperada"),
    horaEntradaTramo2Esperada: formData.get("horaEntradaTramo2Esperada"),
    horaSalidaTramo2Esperada: formData.get("horaSalidaTramo2Esperada"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    const { userId } = await actualizarRemuneracion(
      resultado.data.empleadoId,
      resultado.data,
      usuario.id,
    );

    revalidatePath("/empleados");
    revalidatePath(`/empleados/${userId}`);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  return { exito: true, mensaje: "Remuneración actualizada." };
}
