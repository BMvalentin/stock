"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { crearPedido } from "@/servicios/pedidos/crearPedido";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { parsearPedido } from "@/acciones/pedidos/parsearPedido";
import type { EstadoFormulario } from "@/tipos/formulario";

// Crea un pedido administrativo. Valida con Zod, exige rol ADMIN y delega en el
// servicio, que recalcula precios, envío y total en el servidor.
export async function accionCrearPedido(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAdmin();
  const parseo = parsearPedido(formData);

  if (!parseo.ok) {
    return { errores: parseo.errores };
  }

  try {
    const { id } = await crearPedido(parseo.datos, usuario.id);

    revalidatePath("/pedidos");
    revalidatePath("/stock");
    revalidatePath("/movimientos");
    revalidatePath("/dashboard");
    return { exito: true, redirigir: `/pedidos/${id}` };
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }
}
