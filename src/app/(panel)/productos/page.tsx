import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Productos" };

export default async function PaginaProductos() {
  await requerirSesion();

  return (
    <PaginaEnConstruccion
      titulo="Productos"
      descripcion="Catálogo con búsqueda, filtros por categoría, stock, estado, precio y proveedor."
    />
  );
}
