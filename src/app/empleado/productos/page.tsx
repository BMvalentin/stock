import { requerirEmpleado } from "@/lib/seguridad/requerirEmpleado";
import { leerParametro } from "@/lib/utilidades/parametros";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { esquemaPaginacion } from "@/lib/validaciones/paginacion";
import { listarProductos } from "@/servicios/productos/listarProductos";
import { listarCategoriasActivas } from "@/servicios/categorias/listarCategoriasActivas";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { BuscadorProductos } from "@/componentes/productos/BuscadorProductos";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { TablaProductos } from "@/componentes/productos/TablaProductos";

export const metadata = { title: "Productos" };

export default async function PaginaProductosEmpleado({
  searchParams,
}: PageProps<"/empleado/productos">) {
  await requerirEmpleado();
  const params = await searchParams;

  const busqueda = leerParametro(params.q);
  const categoriaId = leerParametro(params.categoria);
  const { pagina, porPagina } = esquemaPaginacion.parse({
    pagina: params.pagina,
    porPagina: params.porPagina,
  });

  const [configuracion, categorias, resultado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    listarCategoriasActivas(),
    listarProductos({
      busqueda,
      categoriaId,
      estado: "ACTIVOS",
      stock: "TODOS",
      orden: "nombre",
      pagina,
      porPagina,
    }),
  ]);

  const totalPaginas = calcularTotalPaginas(resultado.total, porPagina);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Productos"
        descripcion={`${resultado.total} producto(s) en el catálogo.`}
      />

      <BarraFiltros baseHref="/empleado/productos" limpiarHref="/empleado/productos">
        <BuscadorProductos valorInicial={busqueda} />
        <SelectFiltro
          nombre="categoria"
          valorInicial={categoriaId}
          marcador="Todas las categorías"
          opciones={categorias}
        />
      </BarraFiltros>

      <TablaProductos
        productos={resultado.productos}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
        esAdmin={false}
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        totalRegistros={resultado.total}
        porPagina={porPagina}
        baseHref="/empleado/productos"
        parametros={{
          q: busqueda,
          categoria: categoriaId,
        }}
      />
    </div>
  );
}
