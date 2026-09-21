import { Plus } from "lucide-react";
import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { leerParametro } from "@/lib/utilidades/parametros";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { esquemaPaginacion } from "@/lib/validaciones/paginacion";
import { listarProductos } from "@/servicios/productos/listarProductos";
import { listarCategoriasActivas } from "@/servicios/categorias/listarCategoriasActivas";
import { listarProveedoresActivos } from "@/servicios/proveedores/listarProveedoresActivos";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { BuscadorProductos } from "@/componentes/productos/BuscadorProductos";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { TablaProductos } from "@/componentes/productos/TablaProductos";

export const metadata = { title: "Productos" };

type FiltroEstado = "ACTIVOS" | "INACTIVOS" | "TODOS";
type FiltroStock = "SIN_STOCK" | "BAJO" | "NORMAL" | "TODOS";
type FiltroOrden = "nombre" | "stock_asc" | "stock_desc" | "recientes";

export default async function PaginaProductos({
  searchParams,
}: PageProps<"/admin/productos">) {
  const usuario = await requerirSesion();
  const params = await searchParams;

  const busqueda = leerParametro(params.q);
  const categoriaId = leerParametro(params.categoria);
  const proveedorId = leerParametro(params.proveedor);
  const estadoCrudo = leerParametro(params.estado);
  const stockCrudo = leerParametro(params.stock);
  const ordenCrudo = leerParametro(params.orden);
  const { pagina, porPagina } = esquemaPaginacion.parse({
    pagina: params.pagina,
    porPagina: params.porPagina,
  });

  const estado: FiltroEstado =
    estadoCrudo === "ACTIVOS" || estadoCrudo === "INACTIVOS"
      ? estadoCrudo
      : "TODOS";
  const stock: FiltroStock =
    stockCrudo === "SIN_STOCK" || stockCrudo === "BAJO" || stockCrudo === "NORMAL"
      ? stockCrudo
      : "TODOS";
  const orden: FiltroOrden =
    ordenCrudo === "stock_asc" ||
    ordenCrudo === "stock_desc" ||
    ordenCrudo === "recientes"
      ? ordenCrudo
      : "nombre";

  const [configuracion, categorias, proveedores, resultado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    listarCategoriasActivas(),
    listarProveedoresActivos(),
    listarProductos({
      busqueda,
      categoriaId,
      proveedorId,
      estado,
      stock,
      orden,
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
        acciones={
          usuario.rol === "ADMIN" ? (
            <EnlaceBoton href="/admin/productos/nuevo" variante="primario">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Nuevo producto
            </EnlaceBoton>
          ) : undefined
        }
      />

      <BarraFiltros baseHref="/admin/productos" limpiarHref="/admin/productos">
        <BuscadorProductos valorInicial={busqueda} />
        <SelectFiltro
          nombre="categoria"
          valorInicial={categoriaId}
          marcador="Todas las categorías"
          opciones={categorias}
        />
        <SelectFiltro
          nombre="proveedor"
          valorInicial={proveedorId}
          marcador="Todos los proveedores"
          opciones={proveedores}
        />
        <SelectFiltro
          nombre="estado"
          valorInicial={estado === "TODOS" ? "" : estado}
          marcador="Todos los estados"
          opciones={[
            { valor: "ACTIVOS", etiqueta: "Activos" },
            { valor: "INACTIVOS", etiqueta: "Inactivos" },
          ]}
        />
        <SelectFiltro
          nombre="stock"
          valorInicial={stock === "TODOS" ? "" : stock}
          marcador="Todo el stock"
          opciones={[
            { valor: "SIN_STOCK", etiqueta: "Sin stock" },
            { valor: "BAJO", etiqueta: "Stock bajo" },
            { valor: "NORMAL", etiqueta: "Stock normal" },
          ]}
        />
        <SelectFiltro
          nombre="orden"
          valorInicial={orden === "nombre" ? "" : orden}
          marcador="Ordenar por nombre"
          opciones={[
            { valor: "stock_asc", etiqueta: "Menor stock" },
            { valor: "stock_desc", etiqueta: "Mayor stock" },
            { valor: "recientes", etiqueta: "Más recientes" },
          ]}
        />
      </BarraFiltros>

      <TablaProductos
        productos={resultado.productos}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
        esAdmin={usuario.rol === "ADMIN"}
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        totalRegistros={resultado.total}
        porPagina={porPagina}
        baseHref="/admin/productos"
        parametros={{
          q: busqueda,
          categoria: categoriaId,
          proveedor: proveedorId,
          estado: estado === "TODOS" ? undefined : estado,
          stock: stock === "TODOS" ? undefined : stock,
          orden: orden === "nombre" ? undefined : orden,
        }}
      />
    </div>
  );
}
