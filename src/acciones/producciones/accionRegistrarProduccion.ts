"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaProduccion } from "@/lib/validaciones/producciones";
import { registrarProduccion } from "@/servicios/producciones/registrarProduccion";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionRegistrarProduccion(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaProduccion.safeParse({
    empleadoId: formData.get("empleadoId"),
    productoId: formData.get("productoId"),
    fecha: formData.get("fecha"),
    cantidad: formData.get("cantidad"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    const { userId, total } = await registrarProduccion(
      resultado.data,
      usuario.id,
    );

    revalidatePath("/empleados");
    revalidatePath(`/empleados/${userId}/produccion`);

    return { exito: true, mensaje: `Producción registrada. Total: $${total}` };
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }
}
