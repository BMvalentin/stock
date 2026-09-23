"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cambiarEstadoProveedor } from "@/servicios/proveedores/cambiarEstadoProveedor";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionCambiarEstadoProveedor(
  id: string,
  activo: boolean,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  try {
    await cambiarEstadoProveedor(id, activo, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/proveedores");
  revalidatePath(`/admin/proveedores/${id}`);
  revalidateTag("proveedores", { expire: 0 });
  return {};
}
