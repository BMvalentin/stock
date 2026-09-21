import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/cliente";
import type { Rol } from "@/generated/prisma/enums";

export type UsuarioSesion = {
  id: string;
  nombre: string | null;
  email: string;
  rol: Rol;
};

// Autorización de servidor: valida la sesión y vuelve a leer el usuario desde
// la base de datos para reflejar cambios de rol o desactivaciones inmediatas.
// `cache` deduplica la lectura de usuario cuando el layout y la página la
// invocan en la misma request (una sola consulta por render).
export const requerirSesion = cache(async (): Promise<UsuarioSesion> => {
  const sesion = await auth();

  if (!sesion?.user?.id) {
    redirect("/login");
  }

  const usuario = await prisma.user.findUnique({
    where: { id: sesion.user.id },
    select: { id: true, name: true, email: true, rol: true, activo: true },
  });

  if (!usuario || !usuario.activo) {
    redirect("/login");
  }

  return {
    id: usuario.id,
    nombre: usuario.name,
    email: usuario.email,
    rol: usuario.rol,
  };
});
