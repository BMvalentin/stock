import type { ReactNode } from "react";
import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { BarraNavegacion } from "@/componentes/comunes/BarraNavegacion";

// Protección de todas las rutas del panel: la sesión se valida en el servidor
// antes de renderizar cualquier página interna.
export default async function LayoutPanel({
  children,
}: {
  children: ReactNode;
}) {
  const usuario = await requerirSesion();

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <BarraNavegacion rol={usuario.rol} nombre={usuario.nombre} />
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">{children}</main>
    </div>
  );
}
