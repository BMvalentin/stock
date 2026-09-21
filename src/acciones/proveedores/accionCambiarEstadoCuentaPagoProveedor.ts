"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cambiarEstadoCuentaPagoProveedor } from "@/servicios/proveedores/cambiarEstadoCuentaPagoProveedor";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export async function accionCambiarEstadoCuentaPagoProveedor(
  proveedorId: string,
  cuentaId: string,
  activo: boolean,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  try {
    await cambiarEstadoCuentaPagoProveedor(
      proveedorId,
      cuentaId,
      activo,
      usuario.id,
    );
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/proveedores");
  revalidatePath(`/admin/proveedores/${proveedorId}`);
  return {};
}
