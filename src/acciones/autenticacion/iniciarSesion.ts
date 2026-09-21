"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { esquemaCredenciales } from "@/lib/validaciones/autenticacion";
import type { EstadoLogin } from "@/tipos/autenticacion";

// Flujo: validación Zod -> autenticación -> respuesta. Los errores son
// genéricos para no filtrar si el correo existe o no.
export async function iniciarSesion(
  _estado: EstadoLogin | undefined,
  formData: FormData,
): Promise<EstadoLogin> {
  const resultado = esquemaCredenciales.safeParse({
    email: formData.get("email"),
    contrasena: formData.get("contrasena"),
  });

  if (!resultado.success) {
    return { error: "Correo o contraseña incorrectos" };
  }

  try {
    await signIn("credentials", {
      email: resultado.data.email.trim().toLowerCase(),
      contrasena: resultado.data.contrasena,
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos" };
    }
    throw error;
  }
}
