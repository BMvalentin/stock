"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cambiarEstadoCategoria } from "@/servicios/categorias/cambiarEstadoCategoria";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionCambiarEstadoCategoria(
  id: string,
  activo: boolean,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  try {
    await cambiarEstadoCategoria(id, activo, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidateTag("categorias", { expire: 0 });
  return {};
}
