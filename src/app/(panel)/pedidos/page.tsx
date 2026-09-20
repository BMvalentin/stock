import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Pedidos" };

export default async function PaginaPedidos() {
  await requerirSesion();

  return (
    <PaginaEnConstruccion
      titulo="Pedidos"
      descripcion="Alta, seguimiento de estados, detalle con precios congelados, pagos y envíos."
    />
  );
}
