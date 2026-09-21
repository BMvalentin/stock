"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cancelarLiquidacion } from "@/servicios/liquidaciones/cancelarLiquidacion";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionCancelarLiquidacion(
  liquidacionId: string,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  try {
    const { userId } = await cancelarLiquidacion(liquidacionId, usuario.id);

    revalidatePath("/empleados");
    revalidatePath(`/empleados/${userId}/liquidacion`);
    revalidatePath(`/empleados/${userId}/liquidacion/${liquidacionId}`);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  return {};
}
