import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Clientes" };

export default async function PaginaClientes() {
  await requerirAdmin();

  return (
    <PaginaEnConstruccion
      titulo="Clientes"
      descripcion="Clientes reutilizables entre pedidos, con datos de contacto y dirección."
    />
  );
}
