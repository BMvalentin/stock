"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaProveedor } from "@/lib/validaciones/proveedores";
import { actualizarProveedor } from "@/servicios/proveedores/actualizarProveedor";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionActualizarProveedor(
  id: string,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaProveedor.safeParse({
    nombre: formData.get("nombre"),
    empresa: formData.get("empresa"),
    telefono: formData.get("telefono"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    direccion: formData.get("direccion"),
    notas: formData.get("notas"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    await actualizarProveedor(id, resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/proveedores");
  revalidatePath(`/proveedores/${id}`);
  return { exito: true, mensaje: "Proveedor actualizado." };
}
