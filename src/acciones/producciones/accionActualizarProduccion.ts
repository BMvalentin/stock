"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { actualizarProduccion } from "@/servicios/producciones/actualizarProduccion";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

const esquema = z.object({
  fecha: z.string().trim().min(1, "La fecha es obligatoria"),
  cantidad: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0"),
});

export async function accionActualizarProduccion(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const produccionId = formData.get("produccionId");

  if (typeof produccionId !== "string" || produccionId.length === 0) {
    return { error: "Producción inválida." };
  }

  const resultado = esquema.safeParse({
    fecha: formData.get("fecha"),
    cantidad: formData.get("cantidad"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    const { userId } = await actualizarProduccion(
      produccionId,
      resultado.data,
      usuario.id,
    );

    revalidatePath("/admin/empleados");
    revalidatePath(`/admin/empleados/${userId}/produccion`);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  return { exito: true, mensaje: "Producción actualizada." };
}
