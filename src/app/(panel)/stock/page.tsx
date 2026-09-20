import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Stock" };

export default async function PaginaStock() {
  await requerirSesion();

  return (
    <PaginaEnConstruccion
      titulo="Stock"
      descripcion="Ingresos, egresos y ajustes de mercadería. Toda modificación genera un movimiento registrado."
    />
  );
}
