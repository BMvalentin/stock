import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { esquemaPaginacion } from "@/lib/validaciones/paginacion";
import { listarCategorias } from "@/servicios/categorias/listarCategorias";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { TablaCategorias } from "@/componentes/categorias/TablaCategorias";

export const metadata = { title: "Categorías" };

export default async function PaginaCategorias({
  searchParams,
}: PageProps<"/admin/categorias">) {
  await requerirAdmin();
  const params = await searchParams;

  const { pagina, porPagina } = esquemaPaginacion.parse({
    pagina: params.pagina,
    porPagina: params.porPagina,
  });

  const resultado = await listarCategorias({ pagina, porPagina });
  const totalPaginas = calcularTotalPaginas(resultado.total, porPagina);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Categorías"
        descripcion="Organizá el catálogo. Las categorías se desactivan, no se eliminan."
      />
      <TablaCategorias categorias={resultado.categorias} />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        totalRegistros={resultado.total}
        porPagina={porPagina}
        baseHref="/admin/categorias"
      />
    </div>
  );
}
