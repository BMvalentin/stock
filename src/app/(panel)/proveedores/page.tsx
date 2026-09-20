import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Proveedores" };

export default async function PaginaProveedores() {
  await requerirSesion();

  return (
    <PaginaEnConstruccion
      titulo="Proveedores"
      descripcion="Datos de contacto, productos que ofrece cada proveedor y reposición por WhatsApp, teléfono o email."
    />
  );
}
