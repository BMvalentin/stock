"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaRol } from "@/lib/validaciones/empleados";
import { cambiarRolEmpleado } from "@/servicios/empleados/cambiarRolEmpleado";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionCambiarRolEmpleado(
  id: string,
  rol: string,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  const resultado = esquemaRol.safeParse(rol);

  if (!resultado.success) {
    return { error: "Rol inválido." };
  }

  try {
    await cambiarRolEmpleado(id, resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/empleados");
  revalidatePath("/admin/auditoria");
  return {};
}
