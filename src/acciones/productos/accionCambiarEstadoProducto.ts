"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cambiarEstadoProducto } from "@/servicios/productos/cambiarEstadoProducto";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionCambiarEstadoProducto(
  id: string,
  activo: boolean,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  try {
    await cambiarEstadoProducto(id, activo, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
  return {};
}
