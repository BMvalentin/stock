"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaMontoPositivo } from "@/lib/validaciones/montos";
import { actualizarTarifaProducto } from "@/servicios/tarifasProducto/actualizarTarifaProducto";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionActualizarTarifaProducto(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const tarifaId = formData.get("tarifaId");
  const precio = formData.get("precioUnidad");

  if (typeof tarifaId !== "string" || tarifaId.length === 0) {
    return { error: "Tarifa inválida." };
  }

  const resultado = esquemaMontoPositivo.safeParse(precio);

  if (!resultado.success) {
    return {
      errores: { precioUnidad: [resultado.error.issues[0]?.message ?? "Importe inválido"] },
    };
  }

  try {
    const { userId } = await actualizarTarifaProducto(
      tarifaId,
      resultado.data,
      usuario.id,
    );

    revalidatePath("/empleados");
    revalidatePath(`/empleados/${userId}`);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  return { exito: true, mensaje: "Tarifa actualizada." };
}
