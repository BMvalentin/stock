import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Empleados" };

export default async function PaginaEmpleados() {
  await requerirAdmin();

  return (
    <PaginaEnConstruccion
      titulo="Empleados"
      descripcion="Alta y desactivación de usuarios con rol EMPLEADO. Solo el ADMIN accede a esta sección."
    />
  );
}
