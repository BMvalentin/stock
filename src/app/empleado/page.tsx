import { requerirEmpleado } from "@/lib/seguridad/requerirEmpleado";
import { obtenerResumenEmpleado } from "@/servicios/dashboard/obtenerResumenEmpleado";
import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import { DashboardEmpleado } from "@/componentes/dashboard/DashboardEmpleado";

export const metadata = { title: "Dashboard" };

function formatearHoy(): string {
  const texto = new Intl.DateTimeFormat("es-AR", {
    timeZone: ZONA_HORARIA,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default async function PaginaDashboardEmpleado() {
  const usuario = await requerirEmpleado();
  const resumen = await obtenerResumenEmpleado(usuario.id);

  if (!resumen) {
    return null;
  }

  return <DashboardEmpleado resumen={resumen} fechaHoy={formatearHoy()} />;
}
