import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { leerParametro } from "@/lib/utilidades/parametros";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { esquemaPaginacion } from "@/lib/validaciones/paginacion";
import { listarProveedores } from "@/servicios/proveedores/listarProveedores";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { CampoBusqueda } from "@/componentes/ui/CampoBusqueda";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { TablaProveedores } from "@/componentes/proveedores/TablaProveedores";

export const metadata = { title: "Proveedores" };

type EstadoFiltro = "ACTIVOS" | "INACTIVOS" | "TODOS";

export default async function PaginaProveedores({
  searchParams,
}: PageProps<"/admin/proveedores">) {
  const usuario = await requerirSesion();
  const params = await searchParams;

  const busqueda = leerParametro(params.q);
  const estadoCrudo = leerParametro(params.estado);
  const estado: EstadoFiltro =
    estadoCrudo === "ACTIVOS" || estadoCrudo === "INACTIVOS"
      ? estadoCrudo
      : "TODOS";
  const { pagina, porPagina } = esquemaPaginacion.parse({
    pagina: params.pagina,
    porPagina: params.porPagina,
  });

  const resultado = await listarProveedores({
    busqueda,
    estado,
    incluirCuentaPago: usuario.rol === "ADMIN",
    pagina,
    porPagina,
  });
  const totalPaginas = calcularTotalPaginas(resultado.total, porPagina);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Proveedores"
        descripcion="Contactá proveedores y consultá los productos asociados."
      />

      <BarraFiltros baseHref="/admin/proveedores" limpiarHref="/admin/proveedores">
        <CampoBusqueda
          valorInicial={busqueda}
          placeholder="Buscar por nombre, empresa o teléfono"
          className="w-full sm:w-72"
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
      </BarraFiltros>

      <TablaProveedores
        proveedores={resultado.proveedores}
        esAdmin={usuario.rol === "ADMIN"}
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        totalRegistros={resultado.total}
        porPagina={porPagina}
        baseHref="/admin/proveedores"
        parametros={{
          q: busqueda,
          estado: estado === "TODOS" ? undefined : estado,
        }}
      />
    </div>
  );
}
