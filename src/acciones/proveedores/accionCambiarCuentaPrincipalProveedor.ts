"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cambiarCuentaPrincipalProveedor } from "@/servicios/proveedores/cambiarCuentaPrincipalProveedor";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionCambiarCuentaPrincipalProveedor(
  proveedorId: string,
  cuentaId: string,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  try {
    await cambiarCuentaPrincipalProveedor(proveedorId, cuentaId, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/proveedores");
  revalidatePath(`/proveedores/${proveedorId}`);
  return {};
}
