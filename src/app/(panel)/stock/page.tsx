import { ArrowLeftRight } from "lucide-react";
import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { leerParametro } from "@/lib/utilidades/parametros";
import { normalizarPagina } from "@/lib/utilidades/normalizarPagina";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { REGISTROS_POR_PAGINA } from "@/constantes/paginacion";
import { listarStock } from "@/servicios/stock/listarStock";
import { listarProductosParaSeleccion } from "@/servicios/productos/listarProductosParaSeleccion";
import { listarCategoriasActivas } from "@/servicios/categorias/listarCategoriasActivas";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { BuscadorStock } from "@/componentes/stock/BuscadorStock";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { TablaStock } from "@/componentes/stock/TablaStock";
import { BotonMovimiento } from "@/componentes/stock/BotonMovimiento";

export const metadata = { title: "Stock" };

type FiltroStock = "SIN_STOCK" | "BAJO" | "NORMAL" | "TODOS";
type FiltroOrden = "nombre" | "stock_asc" | "stock_desc";

export default async function PaginaStock({
  searchParams,
}: PageProps<"/stock">) {
  const usuario = await requerirSesion();
  const params = await searchParams;
  const esAdmin = usuario.rol === "ADMIN";

  const busqueda = leerParametro(params.q);
  const categoriaId = leerParametro(params.categoria);
  const stockCrudo = leerParametro(params.stock);
  const ordenCrudo = leerParametro(params.orden);
  const pagina = normalizarPagina(params.pagina);
  const productoSeleccionado = leerParametro(params.producto);

  const stock: FiltroStock =
    stockCrudo === "SIN_STOCK" || stockCrudo === "BAJO" || stockCrudo === "NORMAL"
      ? stockCrudo
      : "TODOS";
  const orden: FiltroOrden =
    ordenCrudo === "stock_asc" || ordenCrudo === "stock_desc"
      ? ordenCrudo
      : "nombre";

  const [configuracion, categorias, opciones, resultado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    listarCategoriasActivas(),
    listarProductosParaSeleccion(),
    listarStock({
      busqueda,
      categoriaId,
      stock,
      orden,
      pagina,
      porPagina: REGISTROS_POR_PAGINA,
    }),
  ]);

  const totalPaginas = calcularTotalPaginas(
    resultado.total,
    REGISTROS_POR_PAGINA,
  );

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Stock"
        descripcion="Estado actual del inventario. Cada cambio genera un movimiento."
        acciones={
          esAdmin ? (
            <BotonMovimiento
              productos={opciones}
              productoInicialId={productoSeleccionado}
              abrirInicial={Boolean(productoSeleccionado)}
              icono={
                <ArrowLeftRight className="h-4 w-4" strokeWidth={1.75} />
              }
            />
          ) : undefined
        }
      />

      <BarraFiltros baseHref="/stock" limpiarHref="/stock">
        <BuscadorStock
          valorInicial={busqueda}
          esAdmin={esAdmin}
          moneda={configuracion.moneda}
          locale={configuracion.locale}
        />
        <SelectFiltro
          nombre="categoria"
          valorInicial={categoriaId}
          marcador="Todas las categorías"
          opciones={categorias}
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
          ]}
        />
      </BarraFiltros>

      <TablaStock
        productos={resultado.productos}
        productosOpciones={opciones}
        locale={configuracion.locale}
        esAdmin={esAdmin}
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        baseHref="/stock"
        parametros={{
          q: busqueda,
          categoria: categoriaId,
          stock: stock === "TODOS" ? undefined : stock,
          orden: orden === "nombre" ? undefined : orden,
        }}
      />
    </div>
  );
}
