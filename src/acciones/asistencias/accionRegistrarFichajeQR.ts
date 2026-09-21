"use server";

import { revalidatePath } from "next/cache";
import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { esquemaFichajeQR } from "@/lib/validaciones/fichajeQR";
import { registrarFichajeQR } from "@/servicios/asistencias/registrarFichajeQR";
import { extraerTokenFichaje } from "@/lib/utilidades/extraerTokenFichaje";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import type { EstadoFichajeQR } from "@/tipos/fichaje";

// Registra el fichaje a partir del contenido leído del QR. La identidad del
// empleado se obtiene de la sesión autenticada; el cliente solo aporta el
// código escaneado, que el servidor valida.
export async function accionRegistrarFichajeQR(
  _estado: EstadoFichajeQR,
  formData: FormData,
): Promise<EstadoFichajeQR> {
  const usuario = await requerirSesion();

  const contenido = formData.get("contenido");
  const token =
    typeof contenido === "string" ? extraerTokenFichaje(contenido) : null;

  const validacion = esquemaFichajeQR.safeParse({ token });

  if (!validacion.success) {
    return { error: "El código QR no es válido." };
  }

  try {
    const resultado = await registrarFichajeQR(
      validacion.data.token,
      usuario.id,
    );

    revalidatePath("/asistencia/fichar");

    return { exito: true, resultado };
  } catch (error) {
    if (error instanceof ErrorNegocio) return { error: error.message };
    throw error;
  }
}
