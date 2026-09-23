import type { ReactNode } from "react";
import { requerirEmpleado } from "@/lib/seguridad/requerirEmpleado";
import { EnvoltorioPanel } from "@/componentes/panel/EnvoltorioPanel";

// Protección de todas las rutas del área del empleado: solo rol EMPLEADO. Un
// ADMIN es redirigido al panel administrativo (/admin).
export default async function LayoutEmpleado({
  children,
}: {
  children: ReactNode;
}) {
  const usuario = await requerirEmpleado();

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
