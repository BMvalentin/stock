"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaAsistencia } from "@/lib/validaciones/asistencias";
import { registrarAsistencia } from "@/servicios/asistencias/registrarAsistencia";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionRegistrarAsistencia(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaAsistencia.safeParse({
    empleadoId: formData.get("empleadoId"),
    fecha: formData.get("fecha"),
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
    const { userId } = await registrarAsistencia(resultado.data, usuario.id);

    revalidatePath("/admin/empleados");
    revalidatePath(`/admin/empleados/${userId}/asistencia`);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  return { exito: true, mensaje: "Asistencia registrada." };
}
