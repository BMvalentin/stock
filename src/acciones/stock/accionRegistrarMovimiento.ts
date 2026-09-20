"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaMovimiento } from "@/lib/validaciones/stock";
import { registrarMovimiento } from "@/servicios/stock/registrarMovimiento";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionRegistrarMovimiento(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaMovimiento.safeParse({
    productoId: formData.get("productoId"),
    tipo: formData.get("tipo"),
    cantidad: formData.get("cantidad"),
    motivo: formData.get("motivo"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    await registrarMovimiento(resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/stock");
  revalidatePath("/movimientos");
  revalidatePath("/dashboard");
  revalidatePath(`/productos/${resultado.data.productoId}`);
  return { exito: true, mensaje: "Movimiento registrado." };
}
