"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaProveedor } from "@/lib/validaciones/proveedores";
import { crearProveedor } from "@/servicios/proveedores/crearProveedor";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionCrearProveedor(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaProveedor.safeParse({
    nombre: formData.get("nombre"),
    empresa: formData.get("empresa"),
    cuit: formData.get("cuit"),
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
    await crearProveedor(resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/proveedores");
  return { exito: true, mensaje: "Proveedor creado." };
}
