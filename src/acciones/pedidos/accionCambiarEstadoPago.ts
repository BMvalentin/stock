"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cambiarEstadoPago } from "@/servicios/pedidos/cambiarEstadoPago";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { ESTADOS_PAGO } from "@/constantes/estadosPago";
import type { EstadoPago } from "@/generated/prisma/enums";

export async function accionCambiarEstadoPago(
  id: string,
  estado: string,
  observacion?: string,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  if (!ESTADOS_PAGO.includes(estado as EstadoPago)) {
    return { error: "Estado de pago inválido." };
  }

  try {
    await cambiarEstadoPago(
      id,
      estado as EstadoPago,
      usuario.id,
      observacion?.trim() || undefined,
    );
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
  return {};
}
