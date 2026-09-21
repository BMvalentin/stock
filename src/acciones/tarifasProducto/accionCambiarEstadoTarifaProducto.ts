"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cambiarEstadoTarifaProducto } from "@/servicios/tarifasProducto/cambiarEstadoTarifaProducto";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionCambiarEstadoTarifaProducto(
  tarifaId: string,
  activo: boolean,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  try {
    const { userId } = await cambiarEstadoTarifaProducto(
      tarifaId,
      activo,
      usuario.id,
    );

    revalidatePath("/admin/empleados");
    revalidatePath(`/admin/empleados/${userId}`);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  return {};
}
