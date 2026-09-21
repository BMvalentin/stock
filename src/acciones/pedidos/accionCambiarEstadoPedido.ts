"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { cambiarEstadoPedido } from "@/servicios/pedidos/cambiarEstadoPedido";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { ESTADOS_PEDIDO } from "@/constantes/estadosPedido";
import type { EstadoPedido } from "@/generated/prisma/enums";

export async function accionCambiarEstadoPedido(
  id: string,
  estado: string,
): Promise<{ error?: string }> {
  const usuario = await requerirAdmin();

  if (!ESTADOS_PEDIDO.includes(estado as EstadoPedido)) {
    return { error: "Estado de pedido inválido." };
  }

  try {
    await cambiarEstadoPedido(id, estado as EstadoPedido, usuario.id);
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/stock");
  revalidatePath("/admin/movimientos");
  revalidatePath("/admin");
  return {};
}
