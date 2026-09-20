import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Categorías" };

export default async function PaginaCategorias() {
  await requerirAdmin();

  return (
    <PaginaEnConstruccion
      titulo="Categorías"
      descripcion="Alta, edición y desactivación lógica de categorías. No se elimina una categoría con productos asociados."
    />
  );
}
