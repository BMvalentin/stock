"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { esquemaCuentaPagoProveedor } from "@/lib/validaciones/cuentasPagoProveedor";
import { crearCuentaPagoProveedor } from "@/servicios/proveedores/crearCuentaPagoProveedor";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFormulario } from "@/tipos/formulario";

export async function accionCrearCuentaPagoProveedor(
  proveedorId: string,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();

  const resultado = esquemaCuentaPagoProveedor.safeParse({
    metodoPago: formData.get("metodoPago"),
    tipoCuenta: formData.get("tipoCuenta") || undefined,
    alias: formData.get("alias"),
    cbu: formData.get("cbu"),
    cvu: formData.get("cvu"),
    titular: formData.get("titular"),
    titularCuit: formData.get("titularCuit"),
    banco: formData.get("banco"),
    esPrincipal: formData.get("esPrincipal") === "true",
    activo: formData.get("activo") === "true",
  });

  if (!resultado.success) {
    return { errores: z.flattenError(resultado.error).fieldErrors };
  }

  try {
    await crearCuentaPagoProveedor(proveedorId, resultado.data, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/proveedores");
  revalidatePath(`/admin/proveedores/${proveedorId}`);
  return { exito: true, mensaje: "Cuenta de pago creada." };
}
