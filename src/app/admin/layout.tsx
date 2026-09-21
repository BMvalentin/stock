import type { ReactNode } from "react";
import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { EnvoltorioPanel } from "@/componentes/panel/EnvoltorioPanel";

// Protección de todas las rutas del panel: la sesión se valida en el servidor
// antes de renderizar cualquier página interna.
export default async function LayoutPanel({
  children,
}: {
  children: ReactNode;
}) {
  const usuario = await requerirSesion();

  return (
    <EnvoltorioPanel
      rol={usuario.rol}
      nombre={usuario.nombre}
      email={usuario.email}
    >
      {children}
    </EnvoltorioPanel>
  );
}
