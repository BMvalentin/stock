import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { listarCategorias } from "@/servicios/categorias/listarCategorias";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { TablaCategorias } from "@/componentes/categorias/TablaCategorias";

export const metadata = { title: "Categorías" };

export default async function PaginaCategorias() {
  await requerirAdmin();
  const categorias = await listarCategorias();

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Categorías"
        descripcion="Organizá el catálogo. Las categorías se desactivan, no se eliminan."
      />
      <TablaCategorias categorias={categorias} />
    </div>
  );
}
