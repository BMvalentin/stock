import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Reportes" };

export default async function PaginaReportes() {
  await requerirAdmin();

  return (
    <PaginaEnConstruccion
      titulo="Reportes"
      descripcion="Resúmenes diarios y mensuales de ventas, movimientos, pagos y productos con mayor movimiento."
    />
  );
}
