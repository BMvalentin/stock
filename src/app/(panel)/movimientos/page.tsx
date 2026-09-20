import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Movimientos" };

export default async function PaginaMovimientos() {
  await requerirAdmin();

  return (
    <PaginaEnConstruccion
      titulo="Movimientos"
      descripcion="Historial de stock con filtros por fecha, producto, categoría, tipo y usuario."
    />
  );
}
