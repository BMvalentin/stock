"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { anularProduccion } from "@/servicios/producciones/anularProduccion";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionAnularProduccion(
  produccionId: string,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  try {
    const { userId } = await anularProduccion(produccionId, usuario.id);

    revalidatePath("/empleados");
    revalidatePath(`/empleados/${userId}/produccion`);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  return {};
}
