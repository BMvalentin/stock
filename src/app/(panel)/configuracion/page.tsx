import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Configuración" };

export default async function PaginaConfiguracion() {
  await requerirAdmin();

  return (
    <PaginaEnConstruccion
      titulo="Configuración"
      descripcion="Métodos de pago, reglas de envío y parámetros generales del comercio."
    />
  );
}
