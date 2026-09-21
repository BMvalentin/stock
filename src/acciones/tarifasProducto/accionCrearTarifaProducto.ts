"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaTarifaProducto } from "@/lib/validaciones/tarifasProducto";
import { crearTarifaProducto } from "@/servicios/tarifasProducto/crearTarifaProducto";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionCrearTarifaProducto(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaTarifaProducto.safeParse({
    empleadoId: formData.get("empleadoId"),
    productoId: formData.get("productoId"),
    precioUnidad: formData.get("precioUnidad"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    const { userId } = await crearTarifaProducto(
      resultado.data.empleadoId,
      resultado.data.productoId,
      resultado.data.precioUnidad,
      usuario.id,
    );

    revalidatePath("/empleados");
    revalidatePath(`/empleados/${userId}`);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  return { exito: true, mensaje: "Tarifa creada." };
}
