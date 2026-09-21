"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaEmpleado } from "@/lib/validaciones/empleados";
import { crearEmpleado } from "@/servicios/empleados/crearEmpleado";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionCrearEmpleado(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaEmpleado.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    contrasena: formData.get("contrasena"),
    rol: formData.get("rol"),
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    await crearEmpleado(resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/empleados");
  return { exito: true, mensaje: "Empleado creado." };
}
