"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cambiarEstadoEmpleado } from "@/servicios/empleados/cambiarEstadoEmpleado";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionCambiarEstadoEmpleado(
  id: string,
  activo: boolean,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  try {
    await cambiarEstadoEmpleado(id, activo, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/empleados");
  return {};
}
