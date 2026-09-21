"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaAsistenciaEdicion } from "@/lib/validaciones/asistencias";
import { actualizarAsistencia } from "@/servicios/asistencias/actualizarAsistencia";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionActualizarAsistencia(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const asistenciaId = formData.get("asistenciaId");

  if (typeof asistenciaId !== "string" || asistenciaId.length === 0) {
    return { error: "Asistencia inválida." };
  }

  const resultado = esquemaAsistenciaEdicion.safeParse({
    estado: formData.get("estado"),
    horaEntrada: formData.get("horaEntrada"),
    horaSalida: formData.get("horaSalida"),
    horaEntradaTramo2: formData.get("horaEntradaTramo2"),
    horaSalidaTramo2: formData.get("horaSalidaTramo2"),
    observacion: formData.get("observacion"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    const { userId } = await actualizarAsistencia(
      asistenciaId,
      resultado.data,
      usuario.id,
    );

    revalidatePath("/admin/empleados");
    revalidatePath(`/admin/empleados/${userId}/asistencia`);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  return { exito: true, mensaje: "Asistencia actualizada." };
}
