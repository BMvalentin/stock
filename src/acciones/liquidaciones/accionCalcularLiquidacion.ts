"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaPeriodoLiquidacion } from "@/lib/validaciones/liquidaciones";
import { calcularLiquidacionEmpleado } from "@/servicios/liquidaciones/calcularLiquidacionEmpleado";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionCalcularLiquidacion(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaPeriodoLiquidacion.safeParse({
    empleadoId: formData.get("empleadoId"),
    desde: formData.get("desde"),
    hasta: formData.get("hasta"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    const { liquidacionId, userId, total } = await calcularLiquidacionEmpleado(
      resultado.data.empleadoId,
      resultado.data.desde,
      resultado.data.hasta,
      usuario.id,
    );

    revalidatePath("/empleados");
    revalidatePath(`/empleados/${userId}/liquidacion`);
    revalidatePath(`/empleados/${userId}/liquidacion/${liquidacionId}`);

    return { exito: true, mensaje: `Liquidación calculada. Total: $${total}` };
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }
}
